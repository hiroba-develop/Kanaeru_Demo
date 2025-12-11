import React, { useState, useEffect, useCallback } from "react";
import { Save, Map } from "lucide-react";
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

  return {
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

const YearlyBudgetActual: React.FC = () => {
  const { selectedUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [targets, setTargets] = useState<YearlyData[]>([]);

  const [tableViewPeriod, setTableViewPeriod] = useState<"1-5" | "6-10">("1-5");
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const [pendingEdits, setPendingEdits] = useState<PendingEdits>({});
  const [chartType, setChartType] = useState<"revenue" | "grossProfit" | "operatingProfit">("revenue");

  // グラフのY軸最大値を動的に計算
  const yAxisDomain = React.useMemo((): [number, number] => {
    if (targets.length === 0) {
      console.log('targets is empty');
      return [0, 70000000];
    }
    
    let maxValue = 0;
    targets.forEach((t) => {
      if (chartType === "revenue") {
        maxValue = Math.max(maxValue, t.revenueTarget || 0, t.revenueActual || 0);
      } else if (chartType === "grossProfit") {
        maxValue = Math.max(maxValue, t.grossProfitTarget || 0, t.grossProfitActual || 0);
      } else {
        maxValue = Math.max(maxValue, t.operatingProfitTarget || 0, t.operatingProfitActual || 0);
      }
    });
    
    console.log('maxValue:', maxValue);
    
    // 最大値に20%の余裕を持たせ、100万単位で切り上げ
    const upperBound = Math.ceil(maxValue * 1.2 / 1000000) * 1000000;
    const finalBound = Math.max(upperBound, 10000000); // 最低でも1000万
    
    console.log('finalBound:', finalBound);
    return [0, finalBound];
  }, [targets, chartType]);

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
        } else {
          // マンダラ連動が無い場合はデモデータ
          const data = getDemoDataForUser(selectedUser.id);
          setTargets(JSON.parse(JSON.stringify(data.yearlyTargets)));
        }
      } catch (err) {
        setError("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedUser]);
  
  useEffect(() => {
    const handlePlPlanUpdate = () => {
      console.log('pl-plan-updated event received, reloading...');
      
      if (!selectedUser) return;
      
      setIsLoading(true);
      
      const loadData = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          
          const plPlan = loadPlPlan();
          const plActual = loadPlActual();
          
          console.log('Reloaded plPlan:', plPlan);
          console.log('Reloaded plActual:', plActual);

          if (plPlan) {
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
          } else {
            const data = getDemoDataForUser(selectedUser.id);
            setTargets(JSON.parse(JSON.stringify(data.yearlyTargets)));
          }
        } catch (err) {
          console.error('Reload error:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    };

    window.addEventListener('pl-plan-updated', handlePlPlanUpdate);
    
    return () => {
      window.removeEventListener('pl-plan-updated', handlePlPlanUpdate);
    };
  }, [selectedUser]);

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
  
      // 既存のPL計画と実績データを読み込む
      let plPlan = loadPlPlan();
      let plActual = loadPlActual();
      
      // plPlanが存在しない場合は、現在のtargetsから初期化
      if (!plPlan) {
        plPlan = {
          yearly: targets.map(t => ({
            year: t.year,
            revenueTarget: t.revenueTarget,
            grossProfitTarget: t.grossProfitTarget,
            operatingProfitTarget: t.operatingProfitTarget,
            netWorthTarget: t.netWorthTarget,
          })),
          tenYearTargetNetWorth: targets[9]?.netWorthTarget || 50000000, // 10年目の純資産目標
        };
      }
      
      if (!plActual) {
        plActual = { yearly: [] };
      }
  
      let mandalaUpdated = false;
      let targetUpdated = false;
  
      // pendingEditsを反映
      Object.entries(pendingEdits).forEach(([yearStr, edits]) => {
        const year = parseInt(yearStr, 10);
        const currentData = targets.find((t) => t.year === year);
        if (!currentData) return;
  
        // 目標値フィールドが編集されているかチェック
        const hasTargetEdit =
          edits.revenueTarget !== undefined ||
          edits.grossProfitTarget !== undefined ||
          edits.operatingProfitTarget !== undefined ||
          edits.netWorthTarget !== undefined;
  
        if (hasTargetEdit) {
          targetUpdated = true;
          
          // pl_plan_v1に保存
          const updatedPlan = {
            year,
            revenueTarget: edits.revenueTarget ?? currentData.revenueTarget,
            grossProfitTarget: edits.grossProfitTarget ?? currentData.grossProfitTarget,
            operatingProfitTarget: edits.operatingProfitTarget ?? currentData.operatingProfitTarget,
            netWorthTarget: edits.netWorthTarget ?? currentData.netWorthTarget,
          };
  
          const existingPlanIndex = plPlan!.yearly.findIndex((p) => p.year === year);
          if (existingPlanIndex >= 0) {
            plPlan!.yearly[existingPlanIndex] = updatedPlan;
          } else {
            plPlan!.yearly.push(updatedPlan);
          }
          
          // 10年目の純資産目標が更新された場合
          if (year === 10 && edits.netWorthTarget !== undefined) {
            plPlan!.tenYearTargetNetWorth = edits.netWorthTarget;
          }
        }
  
        // 実績値の処理
        const hasActualEdit =
          edits.revenueActual !== undefined ||
          edits.grossProfitActual !== undefined ||
          edits.operatingProfitActual !== undefined ||
          edits.netWorthActual !== undefined;
  
        if (hasActualEdit) {
          const updatedActual = {
            year,
            revenueActual: edits.revenueActual ?? currentData.revenueActual,
            grossProfitActual: edits.grossProfitActual ?? currentData.grossProfitActual,
            operatingProfitActual: edits.operatingProfitActual ?? currentData.operatingProfitActual,
            netWorthActual: edits.netWorthActual ?? currentData.netWorthActual,
          };
  
          // pl_actual_v1に保存
          const existingActualIndex = plActual!.yearly.findIndex((a) => a.year === year);
          if (existingActualIndex >= 0) {
            plActual!.yearly[existingActualIndex] = updatedActual;
          } else {
            plActual!.yearly.push(updatedActual);
          }
          // マンダラ連動
          console.log('=== Mandala Update Debug ===');
          console.log('Year:', year);
          console.log('Updated Actual:', updatedActual);
          const result = onYearlyActualUpdate(year, updatedActual);
          console.log('Update Result:', result);
          console.log('===========================');
          mandalaUpdated = true;
        }
      });
  
      // localStorageに保存
      if (targetUpdated) {
        localStorage.setItem('pl_plan_v1', JSON.stringify(plPlan));
      }
      savePlActual(plActual);
  
      // pendingEditsをクリア
      setPendingEdits({});
  
      if (mandalaUpdated) {
        alert("保存しました!\n\n✨ マンダラチャートの目標も自動更新されました!");
      } else if (targetUpdated) {
        alert("保存しました!\n\n目標値が更新されました。");
      } else {
        alert("保存しました!");
      }
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

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
  ];

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* タイトル */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Map className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-heading font-bold text-text">年次PL</h1>
        </div>
      </div>

      <div className="flex justify-center">
        {/* 推移予測グラフ */}
        <div className="card w-full max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h3 className="text-body font-semibold text-text">
              {chartType === "revenue" ? "売上推移予測" : 
              chartType === "grossProfit" ? "粗利益推移予測" : 
              "営業利益推移予測"}
            </h3>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as "revenue" | "grossProfit" | "operatingProfit")}
              className="text-body border border-border rounded px-3 py-2 pr-8 appearance-none bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              style={{
                backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>\')',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "calc(100% - 4px) center",
                backgroundSize: "16px",
              }}
            >
              <option value="revenue">売上</option>
              <option value="grossProfit">粗利益</option>
              <option value="operatingProfit">営業利益</option>
            </select>
          </div>
    
          {(() => {
              console.log('targets:', targets);
              console.log('yAxisDomain:', yAxisDomain);
              console.log('chartType:', chartType);
              return null;
            })()}
            
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={targets} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="year"
                  stroke="#1E1F1F"
                  tickFormatter={(value) => {
                    const fiscalYear = 2025 + value - 1;
                    return `FY${fiscalYear}`;
                  }}
                  dy={10}
                />
                <YAxis
                  stroke="#1E1F1F"
                  domain={yAxisDomain}
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) => `${(value / 10000).toLocaleString()}万円`}
                  labelFormatter={(label) => {
                    const fiscalYear = 2025 + label - 1;
                    return `FY${fiscalYear}`;
                  }}
                  labelStyle={{ color: "#1E1F1F" }}
                />
                
                {/* 売上 */}
                <Line
                  type="monotone"
                  dataKey="revenueTarget"
                  stroke="#9CA3AF"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="売上目標"
                  hide={chartType !== "revenue"}
                />
                <Line
                  type="monotone"
                  dataKey="revenueActual"
                  stroke="#13AE67"
                  strokeWidth={3}
                  name="売上実績"
                  hide={chartType !== "revenue"}
                />
                
                {/* 粗利益 */}
                <Line
                  type="monotone"
                  dataKey="grossProfitTarget"
                  stroke="#9CA3AF"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="粗利益目標"
                  hide={chartType !== "grossProfit"}
                />
                <Line
                  type="monotone"
                  dataKey="grossProfitActual"
                  stroke="#13AE67"
                  strokeWidth={3}
                  name="粗利益実績"
                  hide={chartType !== "grossProfit"}
                />
                
                {/* 営業利益 */}
                <Line
                  type="monotone"
                  dataKey="operatingProfitTarget"
                  stroke="#9CA3AF"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="営業利益目標"
                  hide={chartType !== "operatingProfit"}
                />
                <Line
                  type="monotone"
                  dataKey="operatingProfitActual"
                  stroke="#13AE67"
                  strokeWidth={3}
                  name="営業利益実績"
                  hide={chartType !== "operatingProfit"}
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
                {getTableDisplayData().map((data) => {
                  const fiscalYear = 2025 + data.year - 1;
                  return (
                    <th
                      key={data.year}
                      className="text-right py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap font-medium"
                    >
                      FY{fiscalYear}
                    </th>
                  );
                })}
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
