import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_BASE = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

interface Competitor {
  name: string;
  description: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key 未配置" }, { status: 500 });
  }

  let body: { productName: string; description: string; competitors?: Competitor[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { productName, description, competitors = [] } = body;
  if (!productName || !description) {
    return NextResponse.json({ error: "缺少商品名称或描述" }, { status: 400 });
  }

  const competitorText =
    competitors.length > 0
      ? competitors
          .map((c) => `竞品名称：${c.name}\n竞品描述：${c.description}`)
          .join("\n---\n")
      : "（用户未提供竞品信息，请基于类目常识推断2-3个主要竞品）";

  const systemPrompt = `# 角色
你是一个在淘宝/抖音电商干了8年的运营总监，目前负责品牌电商部门的日报输出。你的周报直接汇报给CEO。

# 任务
根据【我方产品】和【竞品信息】，输出一份电商运营分析日报。这份报告要给运营团队直接拿去执行，不要AI套话。

# 输出格式
严格按以下JSON返回7个模块：

---

## 1. positioning — 商品定位与价格带诊断
类型：string（200-300字）

必须覆盖：
- 这个商品在淘系/抖音生态里的真实品类卡位（不要写"高端品质"，要写具体卡在哪个价格带、哪个搜索词下面）
- 价格带分析：当前定价在同类目里处于什么位置。抖音核心成交带99-199，淘系分两段（59-129性价比段、199-399品质段），你的产品卡在哪一段？
- 结论：这个价格带用户【会买】的理由是什么（性价比/品牌溢价/功能独占），【不会买】的风险是什么（超出类目心理价位/低价质疑品质/中位价缺乏记忆点）
- 写一句"定价调整建议"（哪怕不改也要说明为什么不改）

## 2. userProfile — 目标用户画像与转化动机
类型：string（200-300字）

必须覆盖：
- 核心购买人群：年龄区间、性别比例、典型使用场景（不要写"25-35岁白领"，要写"杭州滨江租房、每天通勤1小时、刷抖音种草然后去淘宝比价的28岁女生"）
- 流量来源拆分：搜索主动需求占比 vs 推荐被动种草占比 vs 直播冲动消费占比（给具体百分数，标注【推测】）
- 【会买】的3个决策因子 + 【不会买】的2个放弃原因
- 对比竞品人群重叠度（重叠多少%？抢谁的用户最容易？）

## 3. sellingPoints — 核心卖点与转化话术
类型：JSON数组，每项含 point, example, isMain, buyReason, rejectRisk
必须返回3-5项

每个卖点必须回答：
- point：卖点名（10字以内）
- example：可用于详情页/直播间的转化话术（15字以内）
- isMain：布尔值，是否主图卖点（有且仅有1个为true）
- buyReason：【为什么用户因为这个卖点下单】（1句话，说清楚需求场景）
- rejectRisk：【为什么用户可能不买账】（1句话，说清楚用户质疑什么）

示例：
{
  "point": "AI纠错实时反馈",
  "example": "练错一个动作，镜子立刻提醒你",
  "isMain": true,
  "buyReason": "小白自己练怕伤膝盖，AI纠错=安全感=敢下单",
  "rejectRisk": "用户可能觉得AI是噱头，除非有对比视频证明"
}

## 4. comparison — 竞品替代关系与攻防策略
类型：JSON对象，包含以下6个子字段

4.1 competitorTypes（竞品分类与替代关系）— string
- 直接竞品（同品类同价格带）：列出1-2个，说明他们抢了你的谁的什么场景
- 替代竞品（不同品类但满足相同需求）：列出1-2个，用户为什么会用他们的品类替代你的品类
- 跨类目竞品（预算竞争）：用户可能因为买了什么而没钱买你
- 格式：用"→"表示替代方向，例如"A品牌（￥299）→ 替代了我们的学生党用户 → 因为他们有12期免息"

4.2 positioningGap（定位差异）— string (100-150字)
4.3 priceGap（价格带差异与转化影响）— string (100-150字)
- 不只对比价格数字，要分析"用户看到竞品价格299、我们价格399时，心里怎么想"
4.4 audienceGap（人群渗透差异）— string (100-150字)
4.5 operationGap（运营打法差异）— string (100-150字)
- 内容频率、直播时长、SKU数量、粉丝运营手段的对比
4.6 adSuggestion（投流攻防建议）— string (150-200字)
- 我方 vs 竞品，谁更值得投？投哪个渠道？ROI预估区间？
- 竞品在投什么词如果我们抢？什么词竞品没覆盖我们打？

## 5. trafficPaths — 流量获取路径与关键词策略
类型：string（200-300字）

必须覆盖：
- 渠道优先级排序（给1-6具体排，说明为什么排第一不是因为"流量大"而是因为"匹配这个产品的人群在该渠道的购买决策路径最短"）
- 核心搜索词3-5个 + 长尾词3-5个（标注每个词的搜索意图：比价型/需求型/品牌型）
- 为什么这些词【能转化】或【不能转化】
- 冷启动预算估算（日预算范围、预计几天能看到第一单、CVR预估）

## 6. actionableSuggestions — 7天可执行运营动作
类型：JSON数组，每项含 day, action, channel, budget, kpi, expectedImpact, riskNote
必须返回7-10项（每天1-2条）

每条必须包含：
- day：第几天
- action：具体动作（不能写"优化标题"，要写"把标题里的'高品质'改成'不伤膝盖'，因为搜索'不伤膝盖健身镜'的长尾词转化率预估更高"）
- channel：执行渠道
- budget：预算范围
- kpi：可量化的考核指标
- expectedImpact：做完之后预计什么指标提升多少（如"CTR预计+0.8pp"）
- riskNote：可能翻车的地方（如"改标题后48小时内权重会波动"）

第1-2天侧重基础搭建（上架/主图/标题），第3-5天侧重流量获取（直通车/短视频），第6-7天侧重转化优化（详情页/评价/直播）。

## 7. decisionSummary — 运营决策总结
类型：JSON对象，包含以下4个子字段

这是整个日报的最终结论，运营团队拿着这个做决定。不要模棱两可，必须给出明确判断。

7.1 conclusion（是否值得做）— string
- 必须从以下3个结论中选一个：推荐做 / 谨慎进入 / 不建议做
- 后面紧跟一句核心理由（不超过30字），用"因为"开头
- 示例："推荐做，因为该类目搜索增速40%+且TOP10竞品主图点击率均低于3%，存在视觉差异化窗口"

7.2 primaryStrategy（最优运营策略）— string
- 必须从以下3种策略中选一种：爆款打法 / 利润打法 / 测试打法
- 选完之后用1-2句话解释为什么选这种（结合该产品的竞争环境、利润空间、流量成本来判断）
- 示例："爆款打法 — 该品类价格透明度高、用户比价行为强，不打爆款拿不到搜索权重。用1个SPU集中所有销量和评价，其他SKU做利润。前两周可以接受亏损，ROI目标是1:1.5保本线"

7.3 coreRisks（核心风险点）— JSON字符串数组，至少2条
- 每条风险必须写清楚：风险是什么 + 如果发生后果是什么 + 怎么提前识别
- 示例：["价格战风险：竞品A可能跟进降价至299以下，如果我们没有差异化卖点护城河，会被拖入纯价格竞争。识别信号：竞品A的一口价连续2周下调。", "流量成本风险：该品类直通车平均PPC 2.5元，如果CVR低于3%，单个成交成本会超过80元，毛利无法覆盖。识别信号：前3天测款时CVR < 2%立刻暂停投放。"]

7.4 oneLiner（一句话执行指令）— string
- 给运营团队的SOP级指令，直接可以贴在工位上的那种
- 格式："X天内做Y，如果Z就W，目标是T"
- 示例："7天内用3组主图+2组标题做AB测试，如果某组CTR突破5%就立刻全量切换并追加直通车预算到500/天，目标单品日销破20单。"

---

# 语言铁律（极其重要）
- 禁止："建议""可以考虑""值得关注""有一定潜力"
- 必须："直接做X""不要做Y""原因是Z""竞品A在做B所以我们做C"
- 禁止："在当今竞争激烈的市场环境下""随着消费升级""众所周知"
- 必须：数据推断给具体数字并标注【推测】，如"搜索流量约占60%【推测】"
- 每个结论必须附带"这个判断如果错了，可能是因为___"
- 用运营开周会的语气写，不要用咨询公司报告的语气写`;

  const userPrompt = `【我方产品】
商品名称：${productName}
商品描述：${description}

【竞品信息】
${competitorText}

出日报。`;

  try {
    const resp = await fetch(DEEPSEEK_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json({ error: `API 请求失败: ${resp.status} ${err}` }, { status: 502 });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "AI 返回为空" }, { status: 502 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({
      positioning: parsed.positioning || "",
      userProfile: parsed.userProfile || "",
      sellingPoints: parsed.sellingPoints || [],
      comparison: parsed.comparison || {},
      trafficPaths: parsed.trafficPaths || "",
      actionableSuggestions: parsed.actionableSuggestions || [],
      decisionSummary: parsed.decisionSummary || {},
    });
  } catch (e: any) {
    return NextResponse.json({ error: `请求异常: ${e.message}` }, { status: 502 });
  }
}
