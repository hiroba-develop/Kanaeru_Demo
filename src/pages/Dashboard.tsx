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

const formatTitleBy8Chars = (text: string): string => {
  if (!text) return "";
  
  if (text.includes('\n')) {
    return text;
  }
  
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
  const [isVisible, setIsVisible] = useState(false);
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
    const manyen = Math.round(amount / 10000);
    return manyen.toLocaleString('ja-JP');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const plan = loadPlPlan();
    const actual = loadPlActual();

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
      <div 
        className="max-w-7xl mx-auto space-y-4 sm:space-y-6"
        style={{
          padding: 'clamp(12px, 3vw, 24px)'
        }}
      >
        {/* タイトル部分 */}
        <div 
          className={`bg-background rounded-card-lg transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ 
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            padding: 'clamp(16px, 4vw, 24px)'
          }}
        >
          <h2 
            className="font-bold text-text text-center"
            style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              marginBottom: 'clamp(16px, 3vw, 24px)'
            }}
          >
            今日、どっちチェックする?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* マンダラチャート セクション */}
            <div
              className={`bg-background cursor-pointer hover:shadow-card-hover transition-all duration-700 group rounded-card-lg ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
              style={{ 
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                transitionDelay: '500ms',
                padding: 'clamp(16px, 4vw, 24px)'
              }}
              onClick={() => navigate("/mandalaChart")}
            >
              <h2 
                className="font-bold text-text"
                style={{
                  fontSize: 'clamp(16px, 3.5vw, 20px)',
                  marginBottom: 'clamp(12px, 3vw, 24px)'
                }}
              >
                Check it !
              </h2>

              {/* 3x3 マンダラグリッド */}
              <div 
                className="grid grid-cols-3 mx-auto"
                style={{
                  gap: 'clamp(4px, 1vw, 8px)',
                  maxWidth: 'min(400px, 100%)',
                  marginBottom: 'clamp(12px, 3vw, 24px)'
                }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                  if (index === 4) {
                    return (
                      <div
                        key="center"
                        className={`aspect-square flex items-center justify-center transition-all duration-500 ${
                          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                        }`}
                        style={{
                          borderRadius: 'clamp(12px, 3vw, 20px)',
                          boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                          border: 'none',
                          background: '#F067A6',
                          transitionDelay: `${300 + index * 50}ms`,
                          padding: 'clamp(4px, 1vw, 8px)'
                        }}
                      >
                        <p 
                          className="text-white text-center font-semibold line-clamp-3 whitespace-pre-line"
                          style={{
                            fontSize: 'clamp(8px, 1.8vw, 12px)',
                            lineHeight: 'clamp(12px, 2.5vw, 16px)'
                          }}
                        >
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
                      className={`relative aspect-square overflow-hidden flex items-center justify-center transition-all duration-500 ${
                        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                      }`}
                      style={{
                        borderRadius: 'clamp(12px, 3vw, 20px)',
                        boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                        border: 'none',
                        background: '#FFFFFF',
                        transitionDelay: `${300 + index * 50}ms`,
                        padding: 'clamp(4px, 1vw, 8px)'
                      }}
                    >
                      {isCompleted && (
                        <img
                          src={complate_icon}
                          alt="達成リング"
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 pointer-events-none"
                          style={{
                            width: 'clamp(40px, 60%, 80px)',
                            height: 'clamp(40px, 60%, 80px)',
                            objectFit: 'contain'
                          }}
                        />
                      )}

                      <p
                        className={`relative z-10 text-center font-medium line-clamp-3 whitespace-pre-line ${
                          isCompleted
                            ? "text-achieved"
                            : hasContent
                            ? "text-primary"
                            : "text-text/50"
                        }`}
                        style={{
                          fontSize: 'clamp(8px, 1.8vw, 12px)',
                          lineHeight: 'clamp(12px, 2.5vw, 16px)'
                        }}
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
              className={`bg-gradient-to-br bg-background to-primary/5 cursor-pointer hover:shadow-card-hover transition-all duration-700 group rounded-card-lg ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{ 
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                transitionDelay: '1000ms',
                padding: 'clamp(16px, 4vw, 24px)'
              }}
              onClick={() => navigate("/yearlyBudgetActual")}
            >
              <div 
                className="flex items-start justify-between"
                style={{
                  marginBottom: 'clamp(12px, 3vw, 16px)'
                }}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div 
                    className="bg-primary text-white rounded-full flex items-center justify-center"
                    style={{
                      padding: 'clamp(8px, 2vw, 12px)'
                    }}
                  >
                    <BarChart3 
                      style={{
                        width: 'clamp(18px, 4vw, 24px)',
                        height: 'clamp(18px, 4vw, 24px)'
                      }}
                    />
                  </div>
                  <div>
                    <h2 
                      className="font-bold text-text"
                      style={{
                        fontSize: 'clamp(16px, 3.5vw, 20px)'
                      }}
                    >
                      年次PL
                    </h2>
                  </div>
                </div>
              </div>

              {/* 年間の予実 */}
              <div 
                className="bg-background rounded-card-lg"
                style={{ 
                  boxShadow: '0 1px 6px rgba(0, 0, 0, 0.06)',
                  padding: 'clamp(12px, 3vw, 16px)',
                  marginBottom: 'clamp(12px, 3vw, 16px)'
                }}
              >
                <div 
                  className="text-text/70"
                  style={{
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    marginBottom: 'clamp(8px, 2vw, 12px)'
                  }}
                >
                  {currentYearData.year}年の実績
                </div>

                {/* 売上 */}
                <div style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}>
                  <div 
                    className="flex items-center justify-between"
                    style={{
                      marginBottom: 'clamp(6px, 1.5vw, 8px)'
                    }}
                  >
                    <span 
                      className="font-semibold text-text"
                      style={{
                        fontSize: 'clamp(12px, 2.8vw, 14px)'
                      }}
                    >
                      売上(年間)
                    </span>
                    <span 
                      className="font-bold text-primary"
                      style={{
                        fontSize: 'clamp(12px, 2.8vw, 14px)'
                      }}
                    >
                      {revenueRate}%
                    </span>
                  </div>
                  <div 
                    className="w-full bg-gray-200 rounded-full overflow-hidden"
                    style={{
                      height: 'clamp(6px, 1.5vw, 8px)'
                    }}
                  >
                    <div
                      className={`bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-1000 ${
                        isVisible ? 'w-full' : 'w-0'
                      }`}
                      style={{ 
                        width: isVisible ? `${Math.min(revenueRate, 100)}%` : '0%',
                        transitionDelay: '500ms'
                      }}
                    />
                  </div>
                  <div 
                    className="flex justify-between text-text/70"
                    style={{
                      marginTop: 'clamp(4px, 1vw, 4px)',
                      fontSize: 'clamp(9px, 2vw, 10px)'
                    }}
                  >
                    <span>
                      実績: {formatCurrency(currentYearData.revenueActual)}万円
                    </span>
                    <span>
                      目標: {formatCurrency(currentYearData.revenueTarget)}万円
                    </span>
                  </div>
                </div>

                {/* 粗利益 */}
                <div style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}>
                  <div 
                    className="flex items-center justify-between"
                    style={{
                      marginBottom: 'clamp(6px, 1.5vw, 8px)'
                    }}
                  >
                    <span 
                      className="font-semibold text-text"
                      style={{
                        fontSize: 'clamp(12px, 2.8vw, 14px)'
                      }}
                    >
                      粗利益(年間)
                    </span>
                    <span 
                      className="font-bold text-primary"
                      style={{
                        fontSize: 'clamp(12px, 2.8vw, 14px)'
                      }}
                    >
                      {grossProfitRate}%
                    </span>
                  </div>
                  <div 
                    className="w-full bg-gray-200 rounded-full overflow-hidden"
                    style={{
                      height: 'clamp(6px, 1.5vw, 8px)'
                    }}
                  >
                    <div
                      className={`bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-1000 ${
                        isVisible ? 'w-full' : 'w-0'
                      }`}
                      style={{ 
                        width: isVisible ? `${Math.min(grossProfitRate, 100)}%` : '0%',
                        transitionDelay: '700ms'
                      }}
                    />
                  </div>
                  <div 
                    className="flex justify-between text-text/70"
                    style={{
                      marginTop: 'clamp(4px, 1vw, 4px)',
                      fontSize: 'clamp(9px, 2vw, 10px)'
                    }}
                  >
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
                  <div 
                    className="flex items-center justify-between"
                    style={{
                      marginBottom: 'clamp(6px, 1.5vw, 8px)'
                    }}
                  >
                    <span 
                      className="font-semibold text-text"
                      style={{
                        fontSize: 'clamp(12px, 2.8vw, 14px)'
                      }}
                    >
                      営業利益(年間)
                    </span>
                    <span 
                      className="font-bold text-primary"
                      style={{
                        fontSize: 'clamp(12px, 2.8vw, 14px)'
                      }}
                    >
                      {operatingProfitRate}%
                    </span>
                  </div>
                  <div 
                    className="w-full bg-gray-200 rounded-full overflow-hidden"
                    style={{
                      height: 'clamp(6px, 1.5vw, 8px)'
                    }}
                  >
                    <div
                      className={`bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-1000 ${
                        isVisible ? 'w-full' : 'w-0'
                      }`}
                      style={{
                        width: isVisible ? `${Math.min(operatingProfitRate, 100)}%` : '0%',
                        transitionDelay: '900ms'
                      }}
                    />
                  </div>
                  <div 
                    className="flex justify-between text-text/70"
                    style={{
                      marginTop: 'clamp(4px, 1vw, 4px)',
                      fontSize: 'clamp(9px, 2vw, 10px)'
                    }}
                  >
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
        <div 
          className={`rounded-card-lg transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ 
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            transitionDelay: '1500ms',
            padding: 'clamp(16px, 4vw, 24px)'
          }}
        >
          <h2 
            className="font-bold text-text"
            style={{
              fontSize: 'clamp(16px, 3.5vw, 20px)',
              marginBottom: 'clamp(12px, 3vw, 16px)'
            }}
          >
            In the works...
          </h2>
          <div 
            className="grid grid-cols-1 md:grid-cols-3"
            style={{
              gap: 'clamp(12px, 3vw, 16px)'
            }}
          >
            {[0, 1, 2].map((index) => (
              <div 
                key={index}
                className={`flex items-center justify-center bg-background rounded-card-lg transition-all duration-500 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  transitionDelay: `${400 + index * 100}ms`,
                  height: 'clamp(120px, 25vw, 160px)'
                }}
              >
                <p 
                  className="text-text/40"
                  style={{
                    fontSize: 'clamp(12px, 2.8vw, 14px)'
                  }}
                >
                  Coming Soon
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;