import React, { useState } from "react";
import { ArrowRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import complate_icon from "../../public/complate_icon.png";

type MandalaMajorCell = {
  id: string;
  title: string;
  achievement: number;
  status: "not_started" | "in_progress" | "achieved";
};

// マンダラチャートの9マスデータを取得
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
    majorCells: majorCells.slice(0, 8), // 8つだけ
  };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {} = useAuth();
  const [currentDate] = useState(new Date());

  // マンダラグリッドデータを取得
  const mandalaGrid = getMandalaGrid();

  // ★ 年間の予実データ（ダミー）
  const currentYearData = {
    year: currentDate.getFullYear(),
    // 売上（年間）
    revenueTarget: 120_000_000,
    revenueActual: 98_000_000,
    // 粗利益（年間）
    grossProfitTarget: 48_000_000,
    grossProfitActual: 40_000_000,
    // 営業利益（年間）
    operatingProfitTarget: 24_000_000,
    operatingProfitActual: 20_000_000,
  };

  const revenueRate = Math.round(
    (currentYearData.revenueActual / currentYearData.revenueTarget) * 100
  );
  const grossProfitRate = Math.round(
    (currentYearData.grossProfitActual / currentYearData.grossProfitTarget) *
      100
  );
  const operatingProfitRate = Math.round(
    (currentYearData.operatingProfitActual /
      currentYearData.operatingProfitTarget) *
      100
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* メインコンテンツ：マンダラとPLを並列表示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* マンダラチャート セクション */}
          <div
            className="card cursor-pointer hover:shadow-card-hover transition-all group"
            onClick={() => navigate("/mandalaChart")}
          >
            <h2 className="text-heading font-bold text-text mb-6">
              Check it !
            </h2>

            {/* 3x3 マンダラグリッド */}
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-6">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                if (index === 4) {
                  // 中央
                  return (
                    <div
                      key="center"
                      className="aspect-square bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg flex items-center justify-center p-2"
                    >
                      <p className="text-white text-center text-xs font-semibold line-clamp-3">
                        {mandalaGrid.centerGoal || "目標"}
                      </p>
                    </div>
                  );
                }

                // 中央以外
                const cellIndex = index > 4 ? index - 1 : index;
                const cell = mandalaGrid.majorCells[cellIndex];
                const hasContent = !!cell?.title;
                const isCompleted =
                  !!cell &&
                  (cell.status === "achieved" || cell.achievement >= 100);

                return (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-lg p-2 overflow-hidden flex items-center justify-center border transition-all
          ${
            isCompleted
              ? "bg-pink-50 border-pink-300"
              : hasContent
              ? "bg-emerald-50 border-emerald-300"
              : "bg-gray-50 border-gray-200"
          }`}
                  >
                    {isCompleted && (
                      <img
                        src={complate_icon}
                        alt="達成リング"
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 pointer-events-none"
                        style={{ width: 90, height: 90 }}
                      />
                    )}

                    <p
                      className={`relative z-10 text-center text-xs font-medium line-clamp-3
            ${
              isCompleted
                ? "text-pink-700"
                : hasContent
                ? "text-emerald-700"
                : "text-gray-600"
            }`}
                    >
                      {hasContent ? cell!.title : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 予実管理（年次PL） セクション */}
          <div
            className="card bg-gradient-to-br bg-white to-indigo-50 border-2 cursor-pointer hover:shadow-card-hover transition-all group"
            onClick={() => navigate("/yearlyBudgetActual")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-white p-3 rounded-card-lg">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-body-lg font-bold text-text">年次PL</h2>
                  <p className="text-note text-gray-600">
                    年間の業績をひと目でチェック
                  </p>
                </div>
              </div>
            </div>

            {/* 年間の予実 */}
            <div className="bg-white rounded-card-lg p-4 mb-4 border border-blue-200">
              <div className="text-note text-gray-600 mb-3">
                {currentYearData.year}年の実績
              </div>

              {/* 売上 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body font-semibold text-text">
                    売上（年間）
                  </span>
                  <span className="text-body-lg font-bold text-blue-600">
                    {revenueRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(revenueRate, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-note text-gray-600">
                  <span>
                    実績：¥
                    {(currentYearData.revenueActual / 1_000_000).toFixed(1)}
                    百万円
                  </span>
                  <span>
                    目標：¥
                    {(currentYearData.revenueTarget / 1_000_000).toFixed(1)}
                    百万円
                  </span>
                </div>
              </div>

              {/* 粗利益 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body font-semibold text-text">
                    粗利益（年間）
                  </span>
                  <span className="text-body-lg font-bold text-emerald-600">
                    {grossProfitRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(grossProfitRate, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-note text-gray-600">
                  <span>
                    実績： ¥
                    {(currentYearData.grossProfitActual / 1_000_000).toFixed(1)}
                    百万円
                  </span>
                  <span>
                    目標： ¥
                    {(currentYearData.grossProfitTarget / 1_000_000).toFixed(1)}
                    百万円
                  </span>
                </div>
              </div>

              {/* 営業利益 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body font-semibold text-text">
                    営業利益（年間）
                  </span>
                  <span className="text-body-lg font-bold text-purple-600">
                    {operatingProfitRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(operatingProfitRate, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-note text-gray-600">
                  <span>
                    実績： ¥
                    {(
                      currentYearData.operatingProfitActual / 1_000_000
                    ).toFixed(1)}
                    百万円
                  </span>
                  <span>
                    目標： ¥
                    {(
                      currentYearData.operatingProfitTarget / 1_000_000
                    ).toFixed(1)}
                    百万円
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* In the works セクション */}
        <div className="card">
          <h2 className="text-heading font-bold text-text mb-4">
            In the works...
          </h2>
          <div className="h-40 flex items-center justify-center bg-gray-50 rounded-card-lg border-2 border-dashed border-gray-300">
            <p className="text-body text-gray-400">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
