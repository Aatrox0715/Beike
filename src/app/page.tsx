"use client";

import { useState } from "react";

interface Competitor {
  id: number;
  name: string;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalysisResult = Record<string, any>;

let nextId = 0;

export default function Home() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const addCompetitor = () => {
    if (competitors.length >= 3) return;
    setCompetitors([...competitors, { id: nextId++, name: "", description: "" }]);
  };

  const removeCompetitor = (id: number) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  const updateCompetitor = (id: number, field: "name" | "description", value: string) => {
    setCompetitors(competitors.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleAnalyze = async () => {
    if (!productName.trim() || !description.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const body = {
        productName,
        description,
        competitors: competitors
          .filter((c) => c.name.trim() || c.description.trim())
          .map((c) => ({ name: c.name, description: c.description })),
      };
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "请求失败");
      } else {
        setResult(data);
      }
    } catch {
      setError("网络异常，请重试");
    }
    setLoading(false);
  };

  const modules: { key: string; title: string }[] = [
    { key: "positioning", title: "📌 商品定位与价格带诊断" },
    { key: "userProfile", title: "👤 目标用户画像与转化动机" },
    { key: "sellingPoints", title: "🎯 核心卖点与转化话术" },
    { key: "comparison", title: "📊 竞品替代关系与攻防策略" },
    { key: "trafficPaths", title: "🚦 流量获取路径与关键词策略" },
    { key: "actionableSuggestions", title: "📋 7天可执行运营动作" },
    { key: "decisionSummary", title: "📌 运营决策总结" },
  ];

  return (
    <main className="min-h-screen px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          轻量竞品对比系统
        </h1>
        <p className="text-slate-400 mt-2 text-sm">输入产品与竞品信息，生成电商运营分析日报</p>
      </div>

      {/* Input Card */}
      <div className="mx-auto max-w-2xl bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="space-y-4">
          <span className="text-xs font-bold text-blue-400 bg-blue-400/15 rounded px-2 py-0.5">我方产品</span>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">商品名称</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="例如：智能健身镜 Pro"
              className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">商品描述</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述产品功能、目标用户、价格区间等..."
              className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="my-5 border-t border-slate-700" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 bg-purple-400/15 rounded px-2 py-0.5">竞品信息（可选，最多3个）</span>
            {competitors.length < 3 && (
              <button onClick={addCompetitor} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                + 添加竞品
              </button>
            )}
          </div>

          {competitors.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">
              暂未添加竞品 — AI 将基于市场常识推断竞品做对比
            </p>
          )}

          {competitors.map((c, i) => (
            <div key={c.id} className="border border-slate-600/50 rounded-xl p-4 bg-slate-900/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">竞品 {i + 1}</span>
                <button onClick={() => removeCompetitor(c.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  移除
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateCompetitor(c.id, "name", e.target.value)}
                  placeholder="竞品名称"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
                <textarea
                  rows={2}
                  value={c.description}
                  onChange={(e) => updateCompetitor(c.id, "description", e.target.value)}
                  placeholder="竞品描述、价格、卖点等..."
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !productName.trim() || !description.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-semibold text-white hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-5"
        >
          {loading ? "分析中..." : "开始对比分析"}
        </button>
      </div>

      {error && (
        <div className="mx-auto max-w-2xl mt-6 bg-red-900/30 border border-red-700 rounded-xl p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="mx-auto max-w-2xl mt-6 space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 animate-pulse">
              <div className="h-4 w-24 bg-slate-700 rounded mb-3" />
              <div className="h-3 bg-slate-700 rounded mb-2 w-full" />
              <div className="h-3 bg-slate-700 rounded mb-2 w-5/6" />
              <div className="h-3 bg-slate-700 rounded w-4/6" />
            </div>
          ))}
        </div>
      )}

      {result && !loading && (
        <div className="mx-auto max-w-2xl mt-6 space-y-4">
          {modules.map((m) => (
            <div key={m.key} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-semibold text-blue-400 mb-3">{m.title}</h3>
              <FieldRenderer value={result[m.key]} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

// ---- 自适应渲染器 ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FieldRenderer({ value }: { value: any }) {
  if (value == null) return <p className="text-sm text-slate-500">暂无数据</p>;

  if (typeof value === "string") {
    return <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{value}</p>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-3">
        {value.map((item, i) => (
          <FieldRenderer key={i} value={item} />
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return <p className="text-sm text-slate-500">-</p>;

    // { point, example, isMain, buyReason, rejectRisk } 卖点结构
    if ("point" in value && "isMain" in value) {
      return <SellingPointCard value={value} />;
    }

    // { day, action, channel, budget, kpi, expectedImpact, riskNote } 运营建议结构
    if ("day" in value && "action" in value) {
      return <SuggestionCard value={value} />;
    }

    // 运营决策总结 { conclusion, primaryStrategy, coreRisks, oneLiner }
    if ("conclusion" in value && "primaryStrategy" in value) {
      return <DecisionSummaryCard value={value} />;
    }

    // 竞品对比矩阵子字段
    if (
      keys.some((k) =>
        ["competitorTypes", "positioningGap", "priceGap", "audienceGap", "operationGap", "adSuggestion"].includes(k)
      )
    ) {
      const gapLabels: Record<string, string> = {
        competitorTypes: "竞品分类与替代关系",
        positioningGap: "定位差异",
        priceGap: "价格带差异与转化影响",
        audienceGap: "人群渗透差异",
        operationGap: "运营打法差异",
        adSuggestion: "投流攻防建议",
      };
      return (
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k} className="rounded-lg border border-slate-600/50 bg-slate-900/40 px-4 py-3">
              <h4 className="text-xs font-semibold text-purple-400 mb-1.5">{gapLabels[k] || k}</h4>
              <FieldRenderer value={value[k]} />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {keys.map((k) => (
          <div key={k}>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{k}</span>
            <FieldRenderer value={value[k]} />
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-sm text-slate-300">{String(value)}</span>;
}

function DecisionSummaryCard({ value }: { value: Record<string, unknown> }) {
  const conclusion = String(value.conclusion ?? "");
  const conclusionColor =
    conclusion.includes("推荐做") ? "text-green-400 bg-green-400/10 border-green-500/30" :
    conclusion.includes("谨慎") ? "text-amber-400 bg-amber-400/10 border-amber-500/30" :
    "text-red-400 bg-red-400/10 border-red-500/30";

  const strategy = String(value.primaryStrategy ?? "");
  const strategyLabel = strategy.includes("爆款") ? "🔥 爆款打法" :
    strategy.includes("利润") ? "💰 利润打法" :
    strategy.includes("测试") ? "🧪 测试打法" : strategy;

  const risks: string[] = Array.isArray(value.coreRisks) ? value.coreRisks.map(String) : [];

  return (
    <div className="space-y-4">
      {/* 结论 */}
      <div className={`rounded-lg border px-4 py-3 ${conclusionColor}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold opacity-70 rounded px-1.5 py-0.5 bg-current">决策结论</span>
        </div>
        <p className="text-sm font-semibold">{conclusion}</p>
      </div>

      {/* 策略 */}
      <div className="rounded-lg border border-slate-600/50 bg-slate-900/40 px-4 py-3">
        <span className="text-[10px] font-bold text-blue-400 bg-blue-400/15 rounded px-1.5 py-0.5 mb-2 inline-block">
          最优运营策略
        </span>
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line mt-1.5">{strategyLabel}</p>
      </div>

      {/* 风险点 */}
      {risks.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
          <span className="text-[10px] font-bold text-red-400 bg-red-400/15 rounded px-1.5 py-0.5 mb-2 inline-block">
            核心风险点
          </span>
          <ul className="space-y-2 mt-1.5">
            {risks.map((r, i) => (
              <li key={i} className="text-xs text-slate-300 flex gap-2">
                <span className="text-red-400 shrink-0 mt-0.5">⚠️</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 一句话指令 */}
      {value.oneLiner != null && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/15 rounded px-1.5 py-0.5 mb-2 inline-block">
            一句话执行指令
          </span>
          <p className="text-sm text-emerald-300 font-medium leading-relaxed mt-1.5">
            {String(value.oneLiner)}
          </p>
        </div>
      )}
    </div>
  );
}

function SellingPointCard({ value }: { value: Record<string, unknown> }) {
  const isMain = value.isMain === true || value.isMain === "true" || value.isMain === "是";
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        isMain ? "border-amber-500/40 bg-amber-500/10" : "border-slate-600/50 bg-slate-900/40"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {isMain && (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 rounded px-1.5 py-0.5">主图卖点</span>
        )}
        {value.point != null && <span className="text-sm font-medium text-slate-200">{String(value.point)}</span>}
      </div>
      {value.example != null && (
        <p className="text-xs text-slate-400 mb-1.5">💬 话术示例：「{String(value.example)}」</p>
      )}
      <div className="grid grid-cols-1 gap-1 text-xs">
        {value.buyReason != null && (
          <p className="text-green-400/80">✅ 会买：{String(value.buyReason)}</p>
        )}
        {value.rejectRisk != null && (
          <p className="text-red-400/80">⚠️ 不买账：{String(value.rejectRisk)}</p>
        )}
      </div>
    </div>
  );
}

function SuggestionCard({ value }: { value: Record<string, unknown> }) {
  const day = value.day != null ? `Day ${value.day}` : null;
  return (
    <div className="rounded-lg border border-slate-600/50 bg-slate-900/40 px-4 py-3">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {day && (
          <span className="text-[10px] font-bold text-purple-400 bg-purple-400/15 rounded px-1.5 py-0.5">{day}</span>
        )}
        {value.action != null && <span className="text-sm font-medium text-slate-200">{String(value.action)}</span>}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-2">
        {value.channel != null && <span>📡 {String(value.channel)}</span>}
        {value.budget != null && <span>💰 {String(value.budget)}</span>}
        {value.kpi != null && <span>📏 {String(value.kpi)}</span>}
      </div>
      <div className="grid grid-cols-1 gap-1 text-xs border-t border-slate-700/50 pt-2">
        {value.expectedImpact != null && (
          <p className="text-green-400/80">📈 预期效果：{String(value.expectedImpact)}</p>
        )}
        {value.riskNote != null && (
          <p className="text-amber-400/80">⚠️ 翻车风险：{String(value.riskNote)}</p>
        )}
      </div>
    </div>
  );
}
