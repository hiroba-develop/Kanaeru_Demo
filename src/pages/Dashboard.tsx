import React, { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import complate_icon from "../assets/complate_icon.png";
import { loadPlPlan, loadPlActual } from "../utils/mandalaIntegration";

type MandalaMajorCell = {
  id: string;
  title: string;
  achievement: number;
  status: "not_started" | "in_progress" | "achieved";
};

const getMandalaGrid = () => {
  const centerGoal = localStorage.getItem("mandala_center_goal_v2") || "";

  let majorCells: MandalaMajorCell[] = [];
  const stored = localStorage.getItem("mandala_major_cells_v2");

  if (stored) {
    try {
      majorCells = JSON.parse(stored) as MandalaMajorCell[];
    } catch (e) {
      console.error("mandala_major_cells_v2 のパースに失敗しました", e);
    }
  }

  return {
    centerGoal,
    majorCells: majorCells.slice(0, 8),
  };
};

// 8文字ごとに改行コードを入れる
const formatTitleBy8Chars = (text: string): string => {
  if (!text) return "";
  
  // すでに改行が含まれている場合はそのまま返す
  if (text.includes('\n')) {
    return text;
  }
  
  // 改行がない場合のみ8文字ごとに改行を追加
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += 8) {
    chunks.push(text.slice(i, i + 8));
  }
  return chunks.join("\n");
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {} = useAuth();
  const [currentDate] = useState(new Date());
  const [currentYearData, setCurrentYearData] = useState({
    year: 1,
    revenueTarget: 0,
    revenueActual: 0,
    grossProfitTarget: 0,
    grossProfitActual: 0,
    operatingProfitTarget: 0,
    operatingProfitActual: 0,
  });

  const mandalaGrid = getMandalaGrid();

  const formatCurrency = (amount: number): string => {
    const manyen = Math.round(amount / 10000); // 万円単位に変換
    return manyen.toLocaleString('ja-JP'); // カンマ区切りで表示
  };

  // PL データを読み込んで表示用データを設定
  useEffect(() => {
    const plan = loadPlPlan();
    const actual = loadPlActual();

    // 当年を「1年目」として表示
    const targetYear = 1;

    const yearPlan = plan?.yearly.find((y) => y.year === targetYear);
    const yearActual = actual?.yearly.find((a) => a.year === targetYear);

    setCurrentYearData({
      year: currentDate.getFullYear(),
      revenueTarget: yearPlan?.revenueTarget || 0,
      revenueActual: yearActual?.revenueActual || 0,
      grossProfitTarget: yearPlan?.grossProfitTarget || 0,
      grossProfitActual: yearActual?.grossProfitActual || 0,
      operatingProfitTarget: yearPlan?.operatingProfitTarget || 0,
      operatingProfitActual: yearActual?.operatingProfitActual || 0,
    });
  }, [currentDate]);

  const revenueRate =
    currentYearData.revenueTarget > 0
      ? Math.round(
          (currentYearData.revenueActual / currentYearData.revenueTarget) * 100
        )
      : 0;

  const grossProfitRate =
    currentYearData.grossProfitTarget > 0
      ? Math.round(
          (currentYearData.grossProfitActual /
            currentYearData.grossProfitTarget) *
            100
        )
      : 0;

  const operatingProfitRate =
    currentYearData.operatingProfitTarget > 0
      ? Math.round(
          (currentYearData.operatingProfitActual /
            currentYearData.operatingProfitTarget) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="bg-background rounded-card-lg p-6" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <h2 className="text-heading font-bold text-text text-center mb-6">
            今日、どっちチェックする?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-">
            {/* マンダラチャート セクション */}
            <div
              className="bg-background cursor-pointer hover:shadow-card-hover transition-all group p-6 rounded-card-lg"
              style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}
              onClick={() => navigate("/mandalaChart")}
            >
              <h2 className="text-heading font-bold text-text mb-6">
                Check it !
              </h2>

              {/* 3x3 マンダラグリッド */}
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-6">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                  if (index === 4) {
                    return (
                      <div
                        key="center"
                        className="aspect-square flex items-center justify-center p-2"
                        style={{
                          borderRadius: '20px',
                          boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                          border: 'none',
                          background: '#F067A6'
                        }}
                      >
                        <p className="text-white text-center text-note font-semibold line-clamp-3 whitespace-pre-line">
                          {formatTitleBy8Chars(
                            mandalaGrid.centerGoal || "目標"
                          )}
                        </p>
                      </div>
                    );
                  }

                  const cellIndex = index > 4 ? index - 1 : index;
                  const cell = mandalaGrid.majorCells[cellIndex];
                  const hasContent = !!cell?.title;
                  const isCompleted =
                    !!cell &&
                    (cell.status === "achieved" || cell.achievement >= 100);

                  return (
                    <div
                      key={index}
                      className="relative aspect-square p-2 overflow-hidden flex items-center justify-center transition-all"
                      style={{
                        borderRadius: '20px',
                        boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                        border: 'none',
                        background: '#FFFFFF'
                      }}
                    >
                      {isCompleted && (
                        <img
                          src={complate_icon}
                          alt="達成リング"
                          className="
                          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                          opacity-80 pointer-events-none
                          w-2/3 h-2/3 max-w-[80px] max-h-[80px]
                          md:max-w-[100px] md:max-h-[100px]
                        "
                        />
                      )}

                      <p
                        className={`relative z-10 text-center text-note font-medium line-clamp-3 whitespace-pre-line
                        ${
                          isCompleted
                            ? "text-achieved"
                            : hasContent
                            ? "text-primary"
                            : "text-text/50"
                        }`}
                      >
                        {hasContent ? formatTitleBy8Chars(cell!.title) : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 予実管理（年次PL） セクション */}
            <div
              className="bg-gradient-to-br bg-background to-primary/5 cursor-pointer hover:shadow-card-hover transition-all group p-6 rounded-card-lg"
              style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}
              onClick={() => navigate("/yearlyBudgetActual")}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                <div className="bg-primary text-white p-3 rounded-full">
                  <BarChart3 className="w-6 h-6" />
                </div>
                  <div>
                    <h2 className="text-heading font-bold text-text">年次PL</h2>
                  </div>
                </div>
              </div>

              {/* 年間の予実 */}
              <div className="bg-background rounded-card-lg p-4 mb-4" style={{ boxShadow: '0 1px 6px rgba(0, 0, 0, 0.06)' }}>
                <div className="text-note text-text/70 mb-3">
                  {currentYearData.year}年の実績
                </div>

                {/* 売上 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body font-semibold text-text">
                      売上(年間)
                    </span>
                    <span className="text-body font-bold text-primary">
                      {revenueRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(revenueRate, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-note text-text/70">
                    <span>
                      実績: {formatCurrency(currentYearData.revenueActual)}万円
                    </span>
                    <span>
                      目標: {formatCurrency(currentYearData.revenueTarget)}万円
                    </span>
                  </div>
                </div>

                {/* 粗利益 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body font-semibold text-text">
                      粗利益(年間)
                    </span>
                    <span className="text-body font-bold text-primary">
                      {grossProfitRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(grossProfitRate, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-note text-text/70">
                    <span>
                      実績: {formatCurrency(currentYearData.grossProfitActual)}万円
                    </span>
                    <span>
                      目標: {formatCurrency(currentYearData.grossProfitTarget)}万円
                    </span>
                  </div>
                </div>

                {/* 営業利益 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body font-semibold text-text">
                      営業利益(年間)
                    </span>
                    <span className="text-body font-bold text-primary">
                      {operatingProfitRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(operatingProfitRate, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-note text-text/70">
                    <span>
                      実績: {formatCurrency(currentYearData.operatingProfitActual)}万円
                    </span>
                    <span>
                      目標: {formatCurrency(currentYearData.operatingProfitTarget)}万円
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* In the works セクション */}        
        <div className="p-6 rounded-card-lg" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <h2 className="text-heading font-bold text-text mb-4">
            In the works...
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 flex items-center justify-center bg-background rounded-card-lg" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
              <p className="text-body text-text/40">Coming Soon</p>
            </div>
            <div className="h-40 flex items-center justify-center bg-background rounded-card-lg" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
              <p className="text-body text-text/40">Coming Soon</p>
            </div>
            <div className="h-40 flex items-center justify-center bg-background rounded-card-lg" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
              <p className="text-body text-text/40">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
