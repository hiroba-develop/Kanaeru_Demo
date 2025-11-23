import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import AchievementPopup from "../components/AchievementPopup";
import MandalaLevelIcon from "../components/MandalaLecelIcon";
import { onMandalaGoalUpdate } from "../utils/mandalaIntegration";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import complate_icon from "../../public/complate_icon.png";

// 多重リング進捗表示コンポーネント
type MultiRingProgressProps = {
  totalRings: number;
  filledRings: number;
  isCompleted: boolean;
  size?: number;
};

type MajorRingProgressProps = {
  ringRatios: number[]; // 各中目標ごとの進捗 0〜1（0.5 なら半円）
  size?: number;
};

const MajorRingProgress: React.FC<MajorRingProgressProps> = ({
  ringRatios,
  size = 190,
}) => {
  const strokeWidth = 4;
  const gap = 6;
  const cx = size / 2;
  const cy = size / 2;

  const circles: React.ReactNode[] = [];

  ringRatios.forEach((ratio, index) => {
    if (ratio <= 0) return; // 0 のものは描かない

    const radius = size / 2 - strokeWidth / 2 - index * gap;
    if (radius <= 0) return;

    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference;
    const dashOffset = circumference * (1 - ratio); // ratio 分だけ円を描く

    circles.push(
      <circle
        key={index}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#22c55e"
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        // 上からスタートさせるために -90 度回転
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
    );
  });

  return (
    <svg
      width={size}
      height={size}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
      {circles}
    </svg>
  );
};

const MultiRingProgress: React.FC<MultiRingProgressProps> = ({
  totalRings,
  filledRings,
  isCompleted,
  size = 120,
}) => {
  const rings: React.ReactNode[] = [];
  const strokeWidth = 2;
  const gap = 4;

  for (let i = 0; i < totalRings; i++) {
    const radius = size / 2 - strokeWidth / 2 - i * gap;
    if (radius <= 0) break;

    // 🔽 色を決定するポイント
    const color = isCompleted
      ? "#fb7185" // 🎉 完成 → ピンク
      : "#22c55e"; // 通常 → 緑

    rings.push(
      <circle
        key={i}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={i < filledRings ? 1 : 0.35}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
      {rings}
    </svg>
  );
};

// ステータスに応じたセル枠コンポーネント
interface MandalaCellFrameProps {
  status: "not_started" | "in_progress" | "achieved";
  children: React.ReactNode;
}

const MandalaCellFrame: React.FC<MandalaCellFrameProps> = ({
  status,
  children,
}) => {
  const base =
    "aspect-square border-2 rounded-lg p-4 flex flex-col transition-all relative";

  const statusClass =
    status === "achieved"
      ? "border-pink-300 bg-pink-50"
      : status === "in_progress"
      ? "border-emerald-300 bg-emerald-50"
      : "border-gray-200 bg-gray-50";

  return (
    <div className={`${base} ${statusClass}`}>
      {/* 周囲のちょっとした飾り（お好みで調整可） */}
      {status !== "not_started" && (
        <div className="absolute inset-0 pointer-events-none">
          {status === "in_progress" && (
            <>
              <div className="absolute top-2 left-2 w-3 h-3 border border-emerald-400 rounded-full opacity-60" />
              <div className="absolute bottom-3 right-4 w-4 h-4 border border-emerald-300 rounded-full opacity-40" />
            </>
          )}
          {status === "achieved" && (
            <>
              <div className="absolute top-2 right-3 w-4 h-4 bg-pink-400 rounded-full opacity-70" />
              <div
                className="absolute bottom-2 left-3 w-4 h-4 bg-pink-300 opacity-60"
                style={{
                  clipPath:
                    "polygon(50% 0%, 0% 38%, 10% 100%, 90% 100%, 100% 38%)",
                }}
              />
            </>
          )}
        </div>
      )}
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
};

interface MandalaCell {
  id: string;
  title: string;
  description?: string;
  achievement: number; // 0-100
  status: "not_started" | "in_progress" | "achieved";
  isChecked?: boolean; // 小目標用
}

interface MandalaSubChart {
  centerId: string;
  centerTitle: string;
  cells: MandalaCell[];
}

type ViewLevel = "major" | "middle" | "minor";

const MandalaChart: React.FC = () => {
  // 現在の表示レベル（大目標/中目標/小目標）
  const [viewLevel, setViewLevel] = useState<ViewLevel>("major");

  // 選択中のセルID（中目標表示時）
  const [selectedMajorCellId, setSelectedMajorCellId] = useState<string | null>(
    null
  );

  // 選択中のセルID（小目標表示時）
  const [selectedMiddleCellId, setSelectedMiddleCellId] = useState<
    string | null
  >(null);

  const [isComposing, setIsComposing] = useState(false);

  // 中央の最終目標
  const [centerGoal, setCenterGoal] = useState(() => {
    const saved = localStorage.getItem("mandala_center_goal_v2");
    return saved || "";
  });

  const [centerFeeling] = useState(() => {
    const saved = localStorage.getItem("mandala_center_feeling_v2");
    return saved || "";
  });

  // 大目標（8つ）
  const [majorCells, setMajorCells] = useState<MandalaCell[]>(() => {
    const saved = localStorage.getItem("mandala_major_cells_v2");
    if (saved) {
      return JSON.parse(saved);
    }
    return Array.from({ length: 8 }, (_, i) => ({
      id: `major_${i + 1}`,
      title: "",
      achievement: 0,
      status: "not_started" as const,
    }));
  });

  // 中目標（各大目標ごとに8つ）
  const [middleCharts, setMiddleCharts] = useState<{
    [key: string]: MandalaSubChart;
  }>(() => {
    const saved = localStorage.getItem("mandala_middle_charts_v2");
    if (saved) {
      return JSON.parse(saved);
    }
    const charts: { [key: string]: MandalaSubChart } = {};
    majorCells.forEach((cell) => {
      charts[cell.id] = {
        centerId: cell.id,
        centerTitle: cell.title,
        cells: Array.from({ length: 8 }, (_, i) => ({
          id: `${cell.id}_middle_${i + 1}`,
          title: "",
          achievement: 0,
          status: "not_started" as const,
        })),
      };
    });
    return charts;
  });

  // 小目標（各中目標ごとに10個）
  const [minorCharts, setMinorCharts] = useState<{
    [key: string]: MandalaSubChart;
  }>(() => {
    const saved = localStorage.getItem("mandala_minor_charts_v2");
    if (saved) {
      return JSON.parse(saved);
    }
    const charts: { [key: string]: MandalaSubChart } = {};
    Object.values(middleCharts).forEach((middleChart) => {
      middleChart.cells.forEach((cell) => {
        charts[cell.id] = {
          centerId: cell.id,
          centerTitle: cell.title,
          cells: Array.from({ length: 10 }, (_, i) => ({
            id: `${cell.id}_minor_${i + 1}`,
            title: "",
            achievement: 0,
            status: "not_started" as const,
            isChecked: false,
          })),
        };
      });
    });
    return charts;
  });

  // 達成ポップアップ
  const [achievementPopup, setAchievementPopup] = useState<{
    isOpen: boolean;
    goalTitle: string;
    level: "major" | "middle" | "minor";
  }>({
    isOpen: false,
    goalTitle: "",
    level: "minor",
  });

  // LocalStorage保存
  useEffect(() => {
    if (centerGoal) {
      localStorage.setItem("mandala_center_goal_v2", centerGoal);
    }
  }, [centerGoal]);

  useEffect(() => {
    if (centerFeeling) {
      localStorage.setItem("mandala_center_feeling_v2", centerFeeling);
    }
  }, [centerFeeling]);

  useEffect(() => {
    localStorage.setItem("mandala_major_cells_v2", JSON.stringify(majorCells));
    // 大目標が変更されたら年次予実管理の目標値を更新
    onMandalaGoalUpdate();
  }, [majorCells]);

  useEffect(() => {
    localStorage.setItem(
      "mandala_middle_charts_v2",
      JSON.stringify(middleCharts)
    );
    // 中目標が変更されたら年次予実管理の目標値を更新
    onMandalaGoalUpdate();
  }, [middleCharts]);

  useEffect(() => {
    localStorage.setItem(
      "mandala_minor_charts_v2",
      JSON.stringify(minorCharts)
    );
  }, [minorCharts]);

  // 中目標の初期化（大目標が変更されたら）
  useEffect(() => {
    const charts: { [key: string]: MandalaSubChart } = {};
    majorCells.forEach((cell) => {
      if (!middleCharts[cell.id]) {
        charts[cell.id] = {
          centerId: cell.id,
          centerTitle: cell.title,
          cells: Array.from({ length: 8 }, (_, i) => ({
            id: `${cell.id}_middle_${i + 1}`,
            title: "",
            achievement: 0,
            status: "not_started" as const,
          })),
        };
      } else {
        charts[cell.id] = {
          ...middleCharts[cell.id],
          centerTitle: cell.title,
        };
      }
    });
    setMiddleCharts(charts);
  }, [majorCells]);

  // 小目標の初期化（中目標が変更されたら）
  useEffect(() => {
    const charts: { [key: string]: MandalaSubChart } = {};
    Object.values(middleCharts).forEach((middleChart) => {
      middleChart.cells.forEach((cell) => {
        if (!minorCharts[cell.id]) {
          charts[cell.id] = {
            centerId: cell.id,
            centerTitle: cell.title,
            cells: Array.from({ length: 10 }, (_, i) => ({
              id: `${cell.id}_minor_${i + 1}`,
              title: "",
              achievement: 0,
              status: "not_started" as const,
              isChecked: false,
            })),
          };
        } else {
          charts[cell.id] = {
            ...minorCharts[cell.id],
            centerTitle: cell.title,
          };
        }
      });
    });
    setMinorCharts(charts);
  }, [middleCharts]);

  // セルのステータスを取得
  const getCellStatus = (achievement: number): MandalaCell["status"] => {
    if (achievement >= 100) return "achieved";
    if (achievement > 0) return "in_progress";
    return "not_started";
  };

  // 大目標のセルクリックハンドラ
  const handleMajorCellClick = (cellId: string) => {
    setSelectedMajorCellId(cellId);
    setViewLevel("middle");
  };

  // 中目標のセルクリックハンドラ
  const handleMiddleCellClick = (cellId: string) => {
    setSelectedMiddleCellId(cellId);
    setViewLevel("minor");
  };

  // 大目標画面に戻る
  const handleBackToMajor = () => {
    setViewLevel("major");
    setSelectedMajorCellId(null);
    setSelectedMiddleCellId(null);
  };

  // 中目標画面に戻る
  const handleBackToMiddle = () => {
    setViewLevel("middle");
    setSelectedMiddleCellId(null);
  };

  // 小目標のチェック切り替え
  const handleMinorCheck = (minorCellId: string) => {
    if (!selectedMiddleCellId || !minorCharts[selectedMiddleCellId]) return;

    const chart = minorCharts[selectedMiddleCellId];
    const updatedCells = chart.cells.map((cell) => {
      if (cell.id === minorCellId) {
        const newChecked = !cell.isChecked;
        const newStatus: MandalaCell["status"] = newChecked
          ? "achieved"
          : "not_started";
        const newAchievement = newChecked ? 100 : 0;

        // 達成時にポップアップ表示
        if (newChecked && cell.title) {
          setAchievementPopup({
            isOpen: true,
            goalTitle: cell.title,
            level: "minor",
          });
        }

        return {
          ...cell,
          isChecked: newChecked,
          status: newStatus,
          achievement: newAchievement,
        };
      }
      return cell;
    });

    setMinorCharts({
      ...minorCharts,
      [selectedMiddleCellId]: {
        ...chart,
        cells: updatedCells,
      },
    });

    // 中目標の達成度を更新
    updateMiddleAchievement(selectedMiddleCellId, updatedCells);
  };

  // 中目標の達成度を更新
  const updateMiddleAchievement = (
    middleCellId: string,
    minorCells: MandalaCell[]
  ) => {
    // ✅ 実際にチェックが付いている小目標の数（0〜10）
    const checkedCount = minorCells.filter((c) => c.isChecked).length;

    // ✅ 10個のチェックを前提に達成率を計算
    //    例) 3個チェック → 30%, 7個 → 70%, 10個 → 100%
    const achievement = Math.round((checkedCount / 10) * 100);

    // 中目標を探して更新
    Object.entries(middleCharts).forEach(([majorId, middleChart]) => {
      const cellIndex = middleChart.cells.findIndex(
        (c) => c.id === middleCellId
      );
      if (cellIndex !== -1) {
        const updatedCells = [...middleChart.cells];
        updatedCells[cellIndex] = {
          ...updatedCells[cellIndex],
          achievement,
          status: getCellStatus(achievement),
        };

        setMiddleCharts({
          ...middleCharts,
          [majorId]: {
            ...middleChart,
            cells: updatedCells,
          },
        });

        // 大目標の達成度を更新
        updateMajorAchievement(majorId, updatedCells);

        // 中目標が「本当に」100%達成されたらポップアップ
        if (achievement === 100 && updatedCells[cellIndex].title) {
          setAchievementPopup({
            isOpen: true,
            goalTitle: updatedCells[cellIndex].title,
            level: "middle",
          });
        }
      }
    });
  };

  // 大目標の達成度を更新
  const updateMajorAchievement = (
    majorId: string,
    middleCells: MandalaCell[]
  ) => {
    const totalAchievement = middleCells.reduce(
      (sum, c) => sum + c.achievement,
      0
    );
    const achievement = Math.round(totalAchievement / middleCells.length);

    setMajorCells((prev) =>
      prev.map((cell) => {
        if (cell.id === majorId) {
          const newCell = {
            ...cell,
            achievement,
            status: getCellStatus(achievement),
          };

          // 大目標が達成されたらポップアップ表示
          if (achievement === 100 && cell.achievement < 100 && cell.title) {
            setAchievementPopup({
              isOpen: true,
              goalTitle: cell.title,
              level: "major",
            });
          }

          return newCell;
        }
        return cell;
      })
    );
  };

  // const getMajorCellProgress = (majorCellId: string) => {
  //   const middleChart = middleCharts[majorCellId];
  //   if (!middleChart) {
  //     return { filledRings: 0, totalRings: 0, isCompleted: false };
  //   }

  //   const totalRings = middleChart.cells.length || 8; // 普段は 8 個の中目標

  //   // 🔽 10個すべてチェックされた「中目標」の数を数える
  //   let completedMiddleCount = 0;

  //   middleChart.cells.forEach((middleCell) => {
  //     const minorChart = minorCharts[middleCell.id];
  //     if (!minorChart) return;

  //     const checkedCount = minorChart.cells.filter((c) => c.isChecked).length;

  //     // 🔽 小目標10/10チェックで、その中目標はコンプリート
  //     if (checkedCount === 10) {
  //       completedMiddleCount += 1;
  //     }
  //   });

  //   const filledRings = completedMiddleCount;
  //   const isCompleted = filledRings >= totalRings && totalRings > 0;

  //   return {
  //     filledRings,
  //     totalRings,
  //     isCompleted,
  //   };
  // };

  // 🔽 大目標セル用：各中目標ごとに「チェック数 / 10」の割合を配列で返す
  const getMajorRingRatios = (majorCellId: string): number[] => {
    const middleChart = middleCharts[majorCellId];
    if (!middleChart) return [];

    // middleChart.cells の順番 = 外側から内側に向かうリングの順 というイメージ
    return middleChart.cells.map((middleCell) => {
      const minorChart = minorCharts[middleCell.id];
      if (!minorChart) return 0;

      const checked = minorChart.cells.filter((c) => c.isChecked).length; // 0〜10
      const ratio = checked / 10; // 0〜1

      // 念のため 0〜1 に clamp
      return Math.max(0, Math.min(1, ratio));
    });
  };

  // 中目標セル用：小目標の達成状況からリング数を計算
  const getMiddleCellProgress = (middleCellId: string) => {
    const minorChart = minorCharts[middleCellId];
    if (!minorChart) {
      return { filledRings: 0, totalRings: 0, isCompleted: false };
    }

    // ✅ チェック済みの小目標の数（0〜10）
    const checked = minorChart.cells.filter((c) => c.isChecked).length;

    // ✅ チェック数ぶんだけ円を描画（最大10本）
    const totalRings = Math.min(checked, 10);

    return {
      filledRings: totalRings, // 追加された円は全部埋まった扱い
      totalRings,
      isCompleted: totalRings === 10, // 10本でその中目標はコンプリート
    };
  };
  // 階層インジケーター
  const LevelIndicator: React.FC = () => {
    return (
      <div className="flex flex-col items-center space-y-3">
        <MandalaLevelIcon level={viewLevel} size={64} />
      </div>
    );
  };

  const NavigationBar: React.FC = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {viewLevel === "middle" && (
            <button
              onClick={handleBackToMajor}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">大目標に戻る</span>
            </button>
          )}
          {viewLevel === "minor" && (
            <>
              <button
                onClick={handleBackToMajor}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">大目標</span>
              </button>
              <button
                onClick={handleBackToMiddle}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">中目標に戻る</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // 入力は最大22文字、表示は8文字ごと改行、最大3行
  const MAX_CHARS_INPUT = 22;
  const LINE_WIDTH = 8;
  const MAX_LINES = 3;

  const formatText = (text: string): string => {
    // 入力中の改行は除去
    const clean = text.replace(/\n/g, "");

    // 入力上限：22文字に制限
    const limited = clean.slice(0, MAX_CHARS_INPUT);

    // 8文字ごとに改行を挿入
    const parts: string[] = [];
    for (let i = 0; i < limited.length; i += LINE_WIDTH) {
      parts.push(limited.slice(i, i + LINE_WIDTH));
    }

    // 最大3行まで
    return parts.slice(0, MAX_LINES).join("\n");
  };

  // 大目標ビュー（9マスグリッド）
  const renderMajorView = () => {
    // マンダラチャートのレイアウト: 中央に最終目標、周りに8つの大目標
    // [0] [1] [2]
    // [3] [中] [4]
    // [5] [6] [7]
    const gridOrder = [0, 1, 2, 3, null, 4, 5, 6, 7]; // nullは中央セル

    return (
      <div className="space-y-8">
        {/* マンダラチャートと階層インジケーター */}
        <div className="flex justify-center items-start gap-8">
          {/* 9マスグリッド */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
            {gridOrder.map((cellIndex) => {
              if (cellIndex === null) {
                // 中央セル（最終目標）
                return (
                  <div
                    key="center"
                    className="aspect-square border-2 border-primary bg-primary/5 rounded-lg p-4 flex flex-col items-center justify-center"
                  >
                    <div className="text-center w-full">
                      <p className="text-note text-primary font-bold mb-2">
                        私が叶える目標
                      </p>
                      <textarea
                        value={centerGoal}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (isComposing) {
                            // 変換中はそのまま入れる（切り詰めない）
                            setCenterGoal(v);
                          } else {
                            // 確定済みのときだけ 22文字＆11文字改行に整形
                            setCenterGoal(formatText(v));
                          }
                        }}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={(e) => {
                          setIsComposing(false);
                          // 変換確定後の文字列に対して整形
                          setCenterGoal(formatText(e.currentTarget.value));
                        }}
                        className="w-full bg-transparent border-none text-body font-bold text-primary text-center focus:outline-none resize-none"
                        placeholder="最終目標を入力"
                        rows={3}
                        style={{
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.3",
                        }}
                      />
                    </div>
                  </div>
                );
              }

              // 大目標セル
              const cell = majorCells[cellIndex];
              const ringRatios = getMajorRingRatios(cell.id);

              return (
                <MandalaCellFrame key={cell.id} status={cell.status}>
                  <div className="flex flex-col items-center h-full">
                    {/* 上：ラベル */}
                    <p className="text-note text-gray-600 font-semibold mb-2">
                      大目標 {cellIndex + 1}
                    </p>

                    {/* 中央：リング＋タイトル入力（高さ固定） */}
                    <div
                      className="relative w-full"
                      style={{ height: "220px" }}
                    >
                      {cell.title && (
                        <>
                          {cell.status === "achieved" ? (
                            // ✅ 大目標が達成されたら画像リングで表示
                            <img
                              src={complate_icon}
                              alt="達成リング"
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ width: 190, height: 190 }}
                            />
                          ) : ringRatios.some((r) => r > 0) ? (
                            // 途中までは今まで通りの進捗リング
                            <MajorRingProgress
                              ringRatios={ringRatios}
                              size={190}
                            />
                          ) : null}
                        </>
                      )}

                      {/* 入力欄を絶対配置で中央に配置 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <textarea
                          value={cell.title}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (isComposing) {
                              setMajorCells((prev) =>
                                prev.map((c) =>
                                  c.id === cell.id ? { ...c, title: v } : c
                                )
                              );
                            } else {
                              const formatted = formatText(v);
                              setMajorCells((prev) =>
                                prev.map((c) =>
                                  c.id === cell.id
                                    ? { ...c, title: formatted }
                                    : c
                                )
                              );
                            }
                          }}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={(e) => {
                            setIsComposing(false);
                            const formatted = formatText(e.currentTarget.value);
                            setMajorCells((prev) =>
                              prev.map((c) =>
                                c.id === cell.id
                                  ? { ...c, title: formatted }
                                  : c
                              )
                            );
                          }}
                          className="bg-transparent border-none text-body text-primary text-center 
              focus:outline-none focus:ring-0 focus:border-transparent resize-none"
                          style={{
                            width: "90%",
                            fontSize: "14px",
                            lineHeight: "1.3",
                            whiteSpace: "pre-wrap",
                          }}
                          rows={3}
                          placeholder={`ここに22文字まで目標のテキストが入ります。`}
                        />
                      </div>
                    </div>

                    {/* 下：ボタン */}
                    {cell.title && (
                      <button
                        onClick={() => handleMajorCellClick(cell.id)}
                        className="mt-2 text-note text-primary hover:text-primary/80 font-semibold bg-white/80 rounded px-3 py-2"
                      >
                        中目標を設定 →
                      </button>
                    )}
                  </div>
                </MandalaCellFrame>
              );
            })}
          </div>

          {/* 階層インジケーター */}
          <div className="flex-shrink-0">
            <LevelIndicator />
          </div>
        </div>
      </div>
    );
  };

  // 中目標ビュー（9マスグリッド）
  const renderMiddleView = () => {
    if (!selectedMajorCellId || !middleCharts[selectedMajorCellId]) {
      return <div>データが見つかりません</div>;
    }

    const majorCell = majorCells.find((c) => c.id === selectedMajorCellId)!;
    const middleChart = middleCharts[selectedMajorCellId];

    // マンダラチャートのレイアウト: 中央に大目標、周りに8つの中目標
    const gridOrder = [0, 1, 2, 3, null, 4, 5, 6, 7]; // nullは中央セル

    return (
      <div className="space-y-6">
        {/* マンダラチャートと階層インジケーター */}
        <div className="flex justify-center items-start gap-8">
          {/* 9マスグリッド */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
            {gridOrder.map((cellIndex) => {
              if (cellIndex === null) {
                // 中央セル（大目標）
                return (
                  <div
                    key="center"
                    className="aspect-square border-2 border-primary bg-primary/5 rounded-lg p-4 flex flex-col items-center justify-center"
                  >
                    <div className="text-center w-full">
                      <p className="text-note text-primary font-bold mb-2">
                        私が叶える目標
                      </p>
                      <p
                        className="text-body font-bold text-primary"
                        style={{
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.3",
                        }}
                      >
                        {majorCell.title}
                      </p>
                    </div>
                  </div>
                );
              }

              // 中目標セル
              const cell = middleChart.cells[cellIndex];
              const progress = getMiddleCellProgress(cell.id);

              return (
                <MandalaCellFrame key={cell.id} status={cell.status}>
                  <div className="relative h-full">
                    {/* テキスト部分 */}
                    <div className="relative z-10 text-center flex-1 flex flex-col">
                      <p className="text-note text-gray-600 font-semibold mb-2">
                        中目標 {cellIndex + 1}
                      </p>
                      <div
                        className="relative w-full"
                        style={{ height: "180px" }}
                      >
                        {cell.title && (
                          <>
                            {progress.isCompleted ? (
                              // ✅ 達成時は画像リング
                              <img
                                src={complate_icon}
                                alt="達成リング"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ width: 190, height: 190 }}
                              />
                            ) : (
                              // 途中までは今まで通りのリング
                              <MultiRingProgress
                                totalRings={progress.totalRings}
                                filledRings={progress.filledRings}
                                isCompleted={progress.isCompleted}
                                size={190}
                              />
                            )}
                          </>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center">
                          <textarea
                            value={cell.title}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (isComposing) {
                                setMiddleCharts((prev) => ({
                                  ...prev,
                                  [selectedMajorCellId]: {
                                    ...prev[selectedMajorCellId],
                                    cells: prev[selectedMajorCellId].cells.map(
                                      (c) =>
                                        c.id === cell.id
                                          ? { ...c, title: v }
                                          : c
                                    ),
                                  },
                                }));
                              } else {
                                const formatted = formatText(v);
                                setMiddleCharts((prev) => ({
                                  ...prev,
                                  [selectedMajorCellId]: {
                                    ...prev[selectedMajorCellId],
                                    cells: prev[selectedMajorCellId].cells.map(
                                      (c) =>
                                        c.id === cell.id
                                          ? { ...c, title: formatted }
                                          : c
                                    ),
                                  },
                                }));
                              }
                            }}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={(e) => {
                              setIsComposing(false);
                              const formatted = formatText(
                                e.currentTarget.value
                              );
                              setMiddleCharts((prev) => ({
                                ...prev,
                                [selectedMajorCellId]: {
                                  ...prev[selectedMajorCellId],
                                  cells: prev[selectedMajorCellId].cells.map(
                                    (c) =>
                                      c.id === cell.id
                                        ? { ...c, title: formatted }
                                        : c
                                  ),
                                },
                              }));
                            }}
                            className="bg-transparent border-none text-body text-primary text-center 
        focus:outline-none focus:ring-0 focus:border-transparent resize-none"
                            style={{
                              width: "85%",
                              fontSize: "15px",
                              lineHeight: "1.3",
                              whiteSpace: "pre-wrap",
                            }}
                            rows={3}
                            placeholder={`ここに22文字まで目標のテキストが入ります。`}
                          />
                        </div>
                      </div>
                      {cell.title && (
                        <button
                          onClick={() => handleMiddleCellClick(cell.id)}
                          className="mt-2 text-note text-primary hover:text-primary/80 font-semibold bg-white/80 rounded px-2 py-1"
                        >
                          小目標を設定 →
                        </button>
                      )}
                    </div>
                  </div>
                </MandalaCellFrame>
              );
            })}
          </div>

          {/* 階層インジケーター */}
          <div className="flex-shrink-0">
            <LevelIndicator />
          </div>
        </div>
      </div>
    );
  };

  // 小目標ビュー（リスト形式）
  const renderMinorView = () => {
    if (!selectedMiddleCellId || !minorCharts[selectedMiddleCellId]) {
      return <div>データが見つかりません</div>;
    }

    const minorChart = minorCharts[selectedMiddleCellId];
    const middleCell = Object.values(middleCharts)
      .flatMap((chart) => chart.cells)
      .find((c) => c.id === selectedMiddleCellId);

    return (
      <div className="flex justify-center items-start gap-8">
        {/* リストコンテンツ */}
        <div className="max-w-xl flex-1 space-y-6">
          {/* 現在の中目標表示 */}
          <div className="w-full">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border-2 border-primary/20">
              <p
                className="text-body font-bold text-primary text-center"
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.3",
                }}
              >
                {middleCell?.title ||
                  "ここに22文字まで目標のテキストが入ります。"}
              </p>
            </div>
          </div>

          {/* 小目標リスト（チェックボックス形式） */}
          <div className="space-y-3">
            {minorChart.cells.map((cell) => (
              <div
                key={cell.id}
                className={`flex items-center space-x-3 p-2 rounded-lg border-2 transition-all ${
                  cell.isChecked
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* チェックボックス（丸） */}
                <button
                  onClick={() => handleMinorCheck(cell.id)}
                  disabled={!cell.title}
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    cell.isChecked
                      ? "bg-primary border-primary"
                      : cell.title
                      ? "border-gray-300 hover:border-primary cursor-pointer"
                      : "border-gray-200 cursor-not-allowed"
                  }`}
                >
                  {cell.isChecked && <Check className="w-5 h-5 text-white" />}
                </button>

                {/* 入力エリア */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={cell.title}
                    onChange={(e) => {
                      setMinorCharts({
                        ...minorCharts,
                        [selectedMiddleCellId]: {
                          ...minorChart,
                          cells: minorChart.cells.map((c) =>
                            c.id === cell.id
                              ? { ...c, title: e.target.value.slice(0, 22) }
                              : c
                          ),
                        },
                      });
                    }}
                    className={`w-full bg-transparent border-none focus:outline-none text-body font-medium ${
                      cell.isChecked
                        ? "line-through text-gray-400"
                        : "text-primary"
                    }`}
                    placeholder="ここに22文字まで目標のテキストが入ります。"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 階層インジケーター */}
        <div className="flex-shrink-0">
          <LevelIndicator />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background px-2 py-3 md:px-3 md:py-4">
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <NavigationBar />
        {/* メインコンテンツ */}
        {viewLevel === "major" && renderMajorView()}
        {viewLevel === "middle" && renderMiddleView()}
        {viewLevel === "minor" && renderMinorView()}
      </div>

      {/* 達成ポップアップ */}
      <AchievementPopup
        isOpen={achievementPopup.isOpen}
        onClose={() =>
          setAchievementPopup({ ...achievementPopup, isOpen: false })
        }
        goalTitle={achievementPopup.goalTitle}
        level={achievementPopup.level}
        message="素晴らしい成果です！この調子で次の目標も達成しましょう！"
      />
    </div>
  );
};

export default MandalaChart;
