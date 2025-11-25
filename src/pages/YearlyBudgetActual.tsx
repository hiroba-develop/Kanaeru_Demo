import React, { useState, useEffect, useCallback } from "react";
import { Save, Navigation } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import {
  onYearlyActualUpdate,
  loadPlPlan,
  loadPlActual,
  savePlActual,
} from "../utils/mandalaIntegration";

interface YearlyData {
  year: number;
  // 純資産
  netWorthTarget: number;
  netWorthActual: number;
  // 売上
  revenueTarget: number;
  revenueActual: number;
  // 粗利益
  grossProfitTarget: number;
  grossProfitActual: number;
  // 営業利益
  operatingProfitTarget: number;
  operatingProfitActual: number;
  // フェーズ
  phase: string;
}

// デモ用のロードマップデータ
const DEMO_ROADMAP_DATA = {
  fiscalYearStartMonth: 4,
  fiscalYearStartYear: 2023,
  tenYearData: {
    target: 5000, // 万円
    actual: 500, // 万円
    progress: 10.0, // %
  },
  yearlyTargets: [
    {
      year: 1,
      revenueTarget: 12000000,
      revenueActual: 11500000,
      grossProfitTarget: 4800000,
      grossProfitActual: 4500000,
      operatingProfitTarget: 3840000,
      operatingProfitActual: 3600000,
      netWorthTarget: 5000000,
      netWorthActual: 4800000,
      phase: "創業期",
    },
    {
      year: 2,
      revenueTarget: 18000000,
      revenueActual: 18500000,
      grossProfitTarget: 7200000,
      grossProfitActual: 7300000,
      operatingProfitTarget: 5760000,
      operatingProfitActual: 5840000,
      netWorthTarget: 10000000,
      netWorthActual: 10200000,
      phase: "創業期",
    },
    {
      year: 3,
      revenueTarget: 24000000,
      revenueActual: 23000000,
      grossProfitTarget: 9600000,
      grossProfitActual: 9400000,
      operatingProfitTarget: 7680000,
      operatingProfitActual: 7520000,
      netWorthTarget: 15000000,
      netWorthActual: 14500000,
      phase: "創業期",
    },
    {
      year: 4,
      revenueTarget: 30000000,
      revenueActual: 31000000,
      grossProfitTarget: 12000000,
      grossProfitActual: 12500000,
      operatingProfitTarget: 9600000,
      operatingProfitActual: 10000000,
      netWorthTarget: 20000000,
      netWorthActual: 20500000,
      phase: "転換期",
    },
    {
      year: 5,
      revenueTarget: 36000000,
      revenueActual: 0,
      grossProfitTarget: 14400000,
      grossProfitActual: 0,
      operatingProfitTarget: 11520000,
      operatingProfitActual: 0,
      netWorthTarget: 25000000,
      netWorthActual: 0,
      phase: "転換期",
    },
    {
      year: 6,
      revenueTarget: 42000000,
      revenueActual: 0,
      grossProfitTarget: 16800000,
      grossProfitActual: 0,
      operatingProfitTarget: 13440000,
      operatingProfitActual: 0,
      netWorthTarget: 30000000,
      netWorthActual: 0,
      phase: "成長期",
    },
    {
      year: 7,
      revenueTarget: 48000000,
      revenueActual: 0,
      grossProfitTarget: 19200000,
      grossProfitActual: 0,
      operatingProfitTarget: 15360000,
      operatingProfitActual: 0,
      netWorthTarget: 35000000,
      netWorthActual: 0,
      phase: "成長期",
    },
    {
      year: 8,
      revenueTarget: 54000000,
      revenueActual: 0,
      grossProfitTarget: 21600000,
      grossProfitActual: 0,
      operatingProfitTarget: 17280000,
      operatingProfitActual: 0,
      netWorthTarget: 40000000,
      netWorthActual: 0,
      phase: "成長期",
    },
    {
      year: 9,
      revenueTarget: 60000000,
      revenueActual: 0,
      grossProfitTarget: 24000000,
      grossProfitActual: 0,
      operatingProfitTarget: 19200000,
      operatingProfitActual: 0,
      netWorthTarget: 45000000,
      netWorthActual: 0,
      phase: "成長期",
    },
    {
      year: 10,
      revenueTarget: 66000000,
      revenueActual: 0,
      grossProfitTarget: 26400000,
      grossProfitActual: 0,
      operatingProfitTarget: 21120000,
      operatingProfitActual: 0,
      netWorthTarget: 50000000,
      netWorthActual: 0,
      phase: "成長期",
    },
  ],
};

// デモユーザーごとの補正
const getDemoDataForUser = (userId: string | undefined) => {
  if (!userId) {
    return {
      tenYearData: { target: 0, actual: 0, progress: 0 },
      yearlyTargets: [],
    };
  }

  const multiplier =
    userId === "user-A" ? 0.95 : userId === "user-B" ? 1.05 : 1;

  const userYearlyTargets = DEMO_ROADMAP_DATA.yearlyTargets.map((target) => ({
    ...target,
    revenueActual: Math.round(target.revenueActual * multiplier),
    grossProfitActual: Math.round(target.grossProfitActual * multiplier),
    operatingProfitActual: Math.round(
      target.operatingProfitActual * multiplier
    ),
    netWorthActual: Math.round(target.netWorthActual * multiplier),
  }));

  const userTenYearData = {
    ...DEMO_ROADMAP_DATA.tenYearData,
    actual: Math.round(DEMO_ROADMAP_DATA.tenYearData.actual * multiplier),
    progress: DEMO_ROADMAP_DATA.tenYearData.progress * multiplier,
  };

  return {
    tenYearData: userTenYearData,
    yearlyTargets: userYearlyTargets,
  };
};

type EditableField =
  | "revenueTarget"
  | "revenueActual"
  | "grossProfitTarget"
  | "grossProfitActual"
  | "operatingProfitTarget"
  | "operatingProfitActual"
  | "netWorthTarget"
  | "netWorthActual";

// yearごとに変更を保持
type PendingEdits = Record<number, Partial<YearlyData>>;

// ★ 直近の実績が入っている年の純資産を取得するヘルパー
const getLatestNetWorthActual = (list: YearlyData[]): number => {
  const withActual = list
    .filter((y) => y.netWorthActual > 0)
    .sort((a, b) => b.year - a.year); // year の大きい順

  if (withActual.length === 0) return 0;
  return withActual[0].netWorthActual;
};

const YearlyBudgetActual: React.FC = () => {
  const { selectedUser } = useAuth();

  const [tenYearProgress, setTenYearProgress] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [tenYearData, setTenYearData] = useState(DEMO_ROADMAP_DATA.tenYearData);
  const [targets, setTargets] = useState<YearlyData[]>([]);

  const [tableViewPeriod, setTableViewPeriod] = useState<"1-5" | "6-10">("1-5");
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const [pendingEdits, setPendingEdits] = useState<PendingEdits>({});

  // データロード
  useEffect(() => {
    const loadData = async () => {
      if (!selectedUser) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // pl_plan_v1（目標値）を読み込み
        const plPlan = loadPlPlan();
        // pl_actual_v1（実績値）を読み込み
        const plActual = loadPlActual();

        if (plPlan) {
          // マンダラ連動のPL計画が存在する場合
          const yearlyTargets: YearlyData[] = plPlan.yearly.map((y) => {
            const actualData = plActual?.yearly.find((a) => a.year === y.year);

            return {
              year: y.year,
              revenueTarget: y.revenueTarget,
              revenueActual: actualData?.revenueActual || 0,
              grossProfitTarget: y.grossProfitTarget,
              grossProfitActual: actualData?.grossProfitActual || 0,
              operatingProfitTarget: y.operatingProfitTarget,
              operatingProfitActual: actualData?.operatingProfitActual || 0,
              netWorthTarget: y.netWorthTarget,
              netWorthActual: actualData?.netWorthActual || 0,
              phase: y.year <= 3 ? "創業期" : y.year <= 5 ? "転換期" : "成長期",
            };
          });

          setTargets(yearlyTargets);

          // 初回ロード時にも一度 10年目標進捗を計算しておく
          const tenYearTarget = plPlan.tenYearTargetNetWorth;
          const latestActual = getLatestNetWorthActual(yearlyTargets);
          const progress =
            tenYearTarget > 0 ? (latestActual / tenYearTarget) * 100 : 0;

          setTenYearData({
            target: Math.round(tenYearTarget / 10000),
            actual: Math.round(latestActual / 10000),
            progress,
          });
        } else {
          // マンダラ連動が無い場合はデモデータ
          const data = getDemoDataForUser(selectedUser.id);
          setTargets(JSON.parse(JSON.stringify(data.yearlyTargets)));
          setTenYearData(data.tenYearData);
        }
      } catch (err) {
        setError("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedUser]);

  // ★ targets が変わるたびに 10年目標進捗を再計算
  useEffect(() => {
    const plPlan = loadPlPlan();
    if (!plPlan) return;

    const tenYearTarget = plPlan.tenYearTargetNetWorth;
    const latestActual = getLatestNetWorthActual(targets);
    const progress =
      tenYearTarget > 0 ? (latestActual / tenYearTarget) * 100 : 0;

    setTenYearData({
      target: Math.round(tenYearTarget / 10000),
      actual: Math.round(latestActual / 10000),
      progress,
    });
  }, [targets]);

  // セル更新
  const handleCellUpdate = (
    year: number,
    field: EditableField,
    value: number
  ) => {
    setPendingEdits((prev) => ({
      ...prev,
      [year]: {
        ...(prev[year] || {}),
        [field]: value,
      },
    }));

    // UI 即時反映
    setTargets((prev) =>
      prev.map((target) =>
        target.year === year ? { ...target, [field]: value } : target
      )
    );

    setEditingCell(null);
  };

  const handleCellDoubleClick = (year: number, field: EditableField) => {
    const key = `${year}-${field}`;
    setEditingCell(key);
  };

  const hasChanges = (): boolean => {
    return Object.keys(pendingEdits).length > 0;
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      alert("変更がありません");
      return;
    }

    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 既存の実績データを読み込む
      let plActual = loadPlActual();
      if (!plActual) {
        plActual = { yearly: [] };
      }

      let mandalaUpdated = false;

      // pendingEditsを反映
      Object.entries(pendingEdits).forEach(([yearStr, edits]) => {
        const year = parseInt(yearStr, 10);
        const currentData = targets.find((t) => t.year === year);
        if (!currentData) return;

        const updatedActual = {
          year,
          revenueActual: edits.revenueActual ?? currentData.revenueActual,
          grossProfitActual:
            edits.grossProfitActual ?? currentData.grossProfitActual,
          operatingProfitActual:
            edits.operatingProfitActual ?? currentData.operatingProfitActual,
          netWorthActual: edits.netWorthActual ?? currentData.netWorthActual,
        };

        // pl_actual_v1に保存
        const existingIndex = plActual!.yearly.findIndex(
          (a) => a.year === year
        );
        if (existingIndex >= 0) {
          plActual!.yearly[existingIndex] = updatedActual;
        } else {
          plActual!.yearly.push(updatedActual);
        }

        // 実績フィールドが編集されている場合のみマンダラ連動
        const hasActualEdit =
          edits.revenueActual !== undefined ||
          edits.grossProfitActual !== undefined ||
          edits.operatingProfitActual !== undefined ||
          edits.netWorthActual !== undefined;

        if (hasActualEdit) {
          onYearlyActualUpdate(year, updatedActual);
          mandalaUpdated = true;
        }
      });

      // localStorageに保存
      savePlActual(plActual);

      // pendingEditsをクリア
      setPendingEdits({});

      if (mandalaUpdated) {
        alert(
          "保存しました！\n\n✨ マンダラチャートの目標も自動更新されました!"
        );
      } else {
        alert("保存しました！");
      }
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  // 10年進捗アニメーション
  useEffect(() => {
    const target = Math.max(0, Math.min(100, tenYearData.progress || 0));

    // いったん 0 にリセット
    setTenYearProgress(0);

    // 0% の場合はアニメーション無しで終わり
    if (target === 0) {
      return;
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.5;
      if (progress >= target) {
        progress = target;
        clearInterval(interval);
      }
      setTenYearProgress(progress);
    }, 40);

    return () => {
      clearInterval(interval);
    };
  }, [tenYearData.progress]);

  const getTableDisplayData = useCallback(() => {
    if (tableViewPeriod === "1-5") {
      return targets.slice(0, 5);
    } else {
      return targets.slice(5, 10);
    }
  }, [targets, tableViewPeriod]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body text-text/70">
            {selectedUser?.name} さんのデータを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-body text-error mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  const renderDataCell = (
    data: YearlyData,
    field: keyof YearlyData,
    isEditable: boolean
  ) => {
    const key = `${data.year}-${field}`;
    const displayValue = data[field as EditableField] as number;

    const hasEditForCell =
      !!pendingEdits[data.year] &&
      (pendingEdits[data.year] as any)[field] !== undefined;

    return (
      <td
        key={data.year}
        className={`py-2 sm:py-3 px-1 sm:px-2 text-right ${
          isEditable
            ? "cursor-pointer hover:bg-primary/5 transition-colors"
            : ""
        } ${isEditable && hasEditForCell ? "bg-warning/10" : ""}`}
        onDoubleClick={() =>
          isEditable && handleCellDoubleClick(data.year, field as EditableField)
        }
        title={isEditable ? "ダブルクリックで編集" : ""}
      >
        {isEditable && editingCell === key ? (
          <input
            type="number"
            defaultValue={displayValue}
            onBlur={(e) =>
              handleCellUpdate(
                data.year,
                field as EditableField,
                Number(e.target.value)
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCellUpdate(
                  data.year,
                  field as EditableField,
                  Number(e.currentTarget.value)
                );
              } else if (e.key === "Escape") {
                setEditingCell(null);
              }
            }}
            className="w-full text-right border border-primary rounded px-1 focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
        ) : displayValue > 0 ? (
          displayValue.toLocaleString()
        ) : (
          "-"
        )}
      </td>
    );
  };

  const renderRateCell = (
    data: YearlyData,
    targetField: keyof YearlyData,
    actualField: keyof YearlyData
  ) => {
    const targetValue = data[targetField] as number;
    const actualValue = data[actualField] as number;
    const rate = targetValue > 0 ? (actualValue / targetValue) * 100 : 0;
    return (
      <td
        key={data.year}
        className={`py-2 sm:py-3 px-1 sm:px-2 text-right font-medium ${
          rate >= 100
            ? "text-success"
            : rate >= 90
            ? "text-warning"
            : "text-error"
        }`}
      >
        {actualValue > 0 ? `${rate.toFixed(1)}%` : "-"}
      </td>
    );
  };

  const tableData = [
    {
      label: "売上",
      targetField: "revenueTarget",
      actualField: "revenueActual",
    },
    {
      label: "粗利益",
      targetField: "grossProfitTarget",
      actualField: "grossProfitActual",
    },
    {
      label: "営業利益",
      targetField: "operatingProfitTarget",
      actualField: "operatingProfitActual",
    },
    {
      label: "純資産",
      targetField: "netWorthTarget",
      actualField: "netWorthActual",
    },
  ];

  return (
    <div className="space-y-6">
      {/* タイトル */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Navigation className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-heading font-bold text-text">年次PL</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 10年進捗 */}
        <div className="card">
          <h3 className="text-body font-semibold text-text mb-4">
            10年目標進捗
          </h3>
          <div className="flex justify-center">
            <div>
              <div className="w-full h-64 flex items-center justify-center">
                <div className="relative w-56 h-56">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E0E0E0"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#13AE67"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${
                        (tenYearProgress * 251.2) / 100
                      } 251.2`}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-heading font-bold text-primary">
                        {tenYearProgress === 0
                          ? "0.0%"
                          : `${tenYearProgress.toFixed(1)}%`}
                      </div>
                      <div className="text-body" style={{ color: "#1E1F1F" }}>
                        10年進捗
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-note text-text/70">
                  {tenYearData.actual}万 / {tenYearData.target}万
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4 space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-note text-text/70">達成</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-note text-text/70">未達成</span>
            </div>
          </div>
        </div>

        {/* 純資産推移予測 */}
        <div className="card">
          <h3 className="text-body font-semibold text-text mb-4">
            純資産推移予測
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={targets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="year"
                stroke="#1E1F1F"
                tickFormatter={(value) => `${value}年`}
              />
              <YAxis
                stroke="#1E1F1F"
                domain={[0, 50000000]}
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
              />
              <Tooltip
                formatter={(value: number, _key, item) => [
                  `${(value / 10000).toLocaleString()}万円`,
                  item && item.name,
                ]}
                labelFormatter={(label) => `${label}年`}
                labelStyle={{ color: "#1E1F1F" }}
              />
              {/* 目標（グレー） */}
              <Line
                type="monotone"
                dataKey="netWorthTarget"
                stroke="#E0E0E0"
                strokeWidth={3}
                dot={{ fill: "#E0E0E0", strokeWidth: 2, r: 4 }}
                name="純資産目標"
              />
              {/* 実績（グリーン） */}
              <Line
                type="monotone"
                dataKey="netWorthActual"
                stroke="#13AE67"
                strokeWidth={3}
                dot={{ fill: "#13AE67", strokeWidth: 1, r: 3 }}
                name="純資産実績"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 10年間の目標設定テーブル */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h3 className="text-body font-semibold text-text">
              10年間の目標設定
            </h3>
            <div className="text-note text-text/70">
              💡 各種目標はダブルクリックで編集できます
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <select
              value={tableViewPeriod}
              onChange={(e) =>
                setTableViewPeriod(e.target.value as "1-5" | "6-10")
              }
              className="text-body border border-border rounded px-2 py-1 pr-8 appearance-none bg-background"
              style={{
                backgroundImage:
                  'url(\'data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>\')',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "calc(100% - 4px) center",
                backgroundSize: "16px",
              }}
            >
              <option value="1-5">1〜5年</option>
              <option value="6-10">6〜10年</option>
            </select>
          </div>
        </div>

        {hasChanges() && (
          <div className="my-4 text-left">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center space-x-2 text-sm px-4 py-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "保存中..." : "変更を保存"}</span>
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-medium w-24"></th>
                <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-medium">
                  項目
                </th>
                {getTableDisplayData().map((data) => (
                  <th
                    key={data.year}
                    className="text-right py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap"
                  >
                    {data.year}年目
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <React.Fragment key={item.label}>
                  <tr className="border-b border-border/50">
                    <td
                      rowSpan={3}
                      className="py-2 sm:py-3 px-1 sm:px-2 font-medium whitespace-nowrap text-left align-middle border-r"
                    >
                      {item.label}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium whitespace-nowrap text-left">
                      目標
                    </td>
                    {getTableDisplayData().map((data) =>
                      renderDataCell(
                        data,
                        item.targetField as EditableField,
                        true
                      )
                    )}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium whitespace-nowrap text-left">
                      実績
                    </td>
                    {getTableDisplayData().map((data) =>
                      renderDataCell(
                        data,
                        item.actualField as keyof YearlyData,
                        true
                      )
                    )}
                  </tr>
                  <tr className="border-b-2 border-border/80">
                    <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium whitespace-nowrap text-left">
                      達成率
                    </td>
                    {getTableDisplayData().map((data) =>
                      renderRateCell(
                        data,
                        item.targetField as keyof YearlyData,
                        item.actualField as keyof YearlyData
                      )
                    )}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YearlyBudgetActual;
