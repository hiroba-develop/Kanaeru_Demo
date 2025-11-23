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
  ringRatios: number[];
  size?: number;
};

// 🎨 色を primary に統一
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
    if (ratio <= 0) return;

    const radius = size / 2 - strokeWidth / 2 - index * gap;
    if (radius <= 0) return;

    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference;
    const dashOffset = circumference * (1 - ratio);

    circles.push(
      <circle
        key={index}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#13AE67" // 🎨 primary に変更
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
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

// 🎨 色を primary / achieved に統一
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

    // 🎨 完成時は achieved、通常は primary
    const color = isCompleted ? "#EC4899" : "#13AE67";

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

// 🎨 ステータス枠の色を primary / achieved に統一
interface MandalaCellFrameProps {
  status: "not_started" | "in_progress" | "achieved";
  children: React.ReactNode;
}

const MandalaCellFrame: React.FC<MandalaCellFrameProps> = ({
  status,
  children,
}) => {
  const base =
    "aspect-square border-2 rounded-card-lg p-4 flex flex-col transition-all relative";

  // 🎨 achieved はピンク、in_progress は primary 系、未着手は gray
  const statusClass =
    status === "achieved"
      ? "border-achieved bg-achieved/5"
      : status === "in_progress"
      ? "border-primary bg-primary/5"
      : "border-border bg-background";

  return (
    <div className={`${base} ${statusClass}`}>
      {status !== "not_started" && (
        <div className="absolute inset-0 pointer-events-none">
          {status === "in_progress" && (
            <>
              <div className="absolute top-2 left-2 w-3 h-3 border border-primary rounded-full opacity-60" />
              <div className="absolute bottom-3 right-4 w-4 h-4 border border-primary/70 rounded-full opacity-40" />
            </>
          )}
          {status === "achieved" && (
            <>
              <div className="absolute top-2 right-3 w-4 h-4 bg-achieved rounded-full opacity-70" />
              <div
                className="absolute bottom-2 left-3 w-4 h-4 bg-achieved/70 opacity-60"
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
  achievement: number;
  status: "not_started" | "in_progress" | "achieved";
  isChecked?: boolean;
}

interface MandalaSubChart {
  centerId: string;
  centerTitle: string;
  cells: MandalaCell[];
}

type ViewLevel = "major" | "middle" | "minor";

const MandalaChart: React.FC = () => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("major");
  const [selectedMajorCellId, setSelectedMajorCellId] = useState<string | null>(
    null
  );
  const [selectedMiddleCellId, setSelectedMiddleCellId] = useState<
    string | null
  >(null);

  const [isComposing, setIsComposing] = useState(false);

  const [centerGoal, setCenterGoal] = useState(() => {
    const saved = localStorage.getItem("mandala_center_goal_v2");
    return saved || "";
  });

  const [centerFeeling] = useState(() => {
    const saved = localStorage.getItem("mandala_center_feeling_v2");
    return saved || "";
  });

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

  const [achievementPopup, setAchievementPopup] = useState<{
    isOpen: boolean;
    goalTitle: string;
    level: "major" | "middle" | "minor";
  }>({
    isOpen: false,
    goalTitle: "",
    level: "minor",
  });

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
    onMandalaGoalUpdate();
  }, [majorCells]);

  useEffect(() => {
    localStorage.setItem(
      "mandala_middle_charts_v2",
      JSON.stringify(middleCharts)
    );
    onMandalaGoalUpdate();
  }, [middleCharts]);

  useEffect(() => {
    localStorage.setItem(
      "mandala_minor_charts_v2",
      JSON.stringify(minorCharts)
    );
  }, [minorCharts]);

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

  const getCellStatus = (achievement: number): MandalaCell["status"] => {
    if (achievement >= 100) return "achieved";
    if (achievement > 0) return "in_progress";
    return "not_started";
  };

  const handleMajorCellClick = (cellId: string) => {
    setSelectedMajorCellId(cellId);
    setViewLevel("middle");
  };

  const handleMiddleCellClick = (cellId: string) => {
    setSelectedMiddleCellId(cellId);
    setViewLevel("minor");
  };

  const handleBackToMajor = () => {
    setViewLevel("major");
    setSelectedMajorCellId(null);
    setSelectedMiddleCellId(null);
  };

  const handleBackToMiddle = () => {
    setViewLevel("middle");
    setSelectedMiddleCellId(null);
  };

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

    updateMiddleAchievement(selectedMiddleCellId, updatedCells);
  };

  const updateMiddleAchievement = (
    middleCellId: string,
    minorCells: MandalaCell[]
  ) => {
    const checkedCount = minorCells.filter((c) => c.isChecked).length;
    const achievement = Math.round((checkedCount / 10) * 100);

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

        updateMajorAchievement(majorId, updatedCells);

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

  const getMajorRingRatios = (majorCellId: string): number[] => {
    const middleChart = middleCharts[majorCellId];
    if (!middleChart) return [];

    return middleChart.cells.map((middleCell) => {
      const minorChart = minorCharts[middleCell.id];
      if (!minorChart) return 0;

      const checked = minorChart.cells.filter((c) => c.isChecked).length;
      const ratio = checked / 10;

      return Math.max(0, Math.min(1, ratio));
    });
  };

  const getMiddleCellProgress = (middleCellId: string) => {
    const minorChart = minorCharts[middleCellId];
    if (!minorChart) {
      return { filledRings: 0, totalRings: 0, isCompleted: false };
    }

    const checked = minorChart.cells.filter((c) => c.isChecked).length;
    const totalRings = Math.min(checked, 10);

    return {
      filledRings: totalRings,
      totalRings,
      isCompleted: totalRings === 10,
    };
  };

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
              className="flex items-center space-x-2 px-4 py-2 bg-background hover:bg-gray-100 rounded-card transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-body font-medium">大目標に戻る</span>
            </button>
          )}
          {viewLevel === "minor" && (
            <>
              <button
                onClick={handleBackToMajor}
                className="flex items-center space-x-2 px-4 py-2 bg-background hover:bg-gray-100 rounded-card transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-body font-medium">大目標</span>
              </button>
              <button
                onClick={handleBackToMiddle}
                className="flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-card transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-body font-medium">中目標に戻る</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const MAX_CHARS_INPUT = 22;
  const LINE_WIDTH = 8;
  const MAX_LINES = 3;

  const formatText = (text: string): string => {
    const clean = text.replace(/\n/g, "");
    const limited = clean.slice(0, MAX_CHARS_INPUT);

    const parts: string[] = [];
    for (let i = 0; i < limited.length; i += LINE_WIDTH) {
      parts.push(limited.slice(i, i + LINE_WIDTH));
    }

    return parts.slice(0, MAX_LINES).join("\n");
  };

  // 🎨 大目標ビュー：色とフォントを統一
  const renderMajorView = () => {
    const gridOrder = [0, 1, 2, 3, null, 4, 5, 6, 7];

    return (
      <div className="space-y-8">
        <div className="flex justify-center items-start gap-8">
          <div className="grid grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
            {gridOrder.map((cellIndex) => {
              if (cellIndex === null) {
                return (
                  <div
                    key="center"
                    className="aspect-square border-2 border-primary bg-primary/5 rounded-card-lg p-4 flex flex-col items-center justify-center"
                  >
                    <div className="text-center w-full">
                      <p className="text-note text-primary text-15px font-bold mb-2">
                        私が叶える目標
                      </p>
                      <textarea
                        value={centerGoal}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (isComposing) {
                            setCenterGoal(v);
                          } else {
                            setCenterGoal(formatText(v));
                          }
                        }}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={(e) => {
                          setIsComposing(false);
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

              const cell = majorCells[cellIndex];
              const ringRatios = getMajorRingRatios(cell.id);

              return (
                <MandalaCellFrame key={cell.id} status={cell.status}>
                  <div className="flex flex-col items-center h-full">
                    <p className="text-note text-text/70 font-semibold mb-2">
                      大目標 {cellIndex + 1}
                    </p>

                    <div
                      className="relative w-full"
                      style={{ height: "220px" }}
                    >
                      {cell.title && (
                        <>
                          {cell.status === "achieved" ? (
                            <img
                              src={complate_icon}
                              alt="達成リング"
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ width: 190, height: 190 }}
                            />
                          ) : ringRatios.some((r) => r > 0) ? (
                            <MajorRingProgress
                              ringRatios={ringRatios}
                              size={190}
                            />
                          ) : null}
                        </>
                      )}

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
                          className={`bg-transparent border-none text-body text-center focus:outline-none focus:ring-0 focus:border-transparent resize-none
                            ${
                              cell.status === "achieved"
                                ? "text-achieved"
                                : "text-primary"
                            }`}
                          style={{
                            width: "90%",
                            lineHeight: "1.3",
                            whiteSpace: "pre-wrap",
                          }}
                          rows={3}
                          placeholder="ここに22文字まで目標のテキストが入ります。"
                        />
                      </div>
                    </div>

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

          <div className="flex-shrink-0">
            <LevelIndicator />
          </div>
        </div>
      </div>
    );
  };

  // 🎨 中目標ビュー：色とフォントを統一
  const renderMiddleView = () => {
    if (!selectedMajorCellId || !middleCharts[selectedMajorCellId]) {
      return <div className="text-body text-text">データが見つかりません</div>;
    }

    const majorCell = majorCells.find((c) => c.id === selectedMajorCellId)!;
    const middleChart = middleCharts[selectedMajorCellId];

    const gridOrder = [0, 1, 2, 3, null, 4, 5, 6, 7];

    return (
      <div className="space-y-6">
        <div className="flex justify-center items-start gap-8">
          <div className="grid grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
            {gridOrder.map((cellIndex) => {
              if (cellIndex === null) {
                return (
                  <div
                    key="center"
                    className="aspect-square border-2 border-primary bg-primary/5 rounded-card-lg p-4 flex flex-col items-center justify-center"
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

              const cell = middleChart.cells[cellIndex];
              const progress = getMiddleCellProgress(cell.id);

              return (
                <MandalaCellFrame key={cell.id} status={cell.status}>
                  <div className="relative h-full">
                    <div className="relative z-10 text-center flex-1 flex flex-col">
                      <p className="text-note text-text/70 font-semibold mb-2">
                        中目標 {cellIndex + 1}
                      </p>
                      <div
                        className="relative w-full"
                        style={{ height: "180px" }}
                      >
                        {cell.title && (
                          <>
                            {progress.isCompleted ? (
                              <img
                                src={complate_icon}
                                alt="達成リング"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ width: 190, height: 190 }}
                              />
                            ) : (
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
                            className={`bg-transparent border-none text-body text-center focus:outline-none focus:ring-0 focus:border-transparent resize-none
                              ${
                                cell.status === "achieved"
                                  ? "text-achieved"
                                  : "text-primary"
                              }`}
                            style={{
                              width: "85%",
                              lineHeight: "1.3",
                              whiteSpace: "pre-wrap",
                            }}
                            rows={3}
                            placeholder="ここに22文字まで目標のテキストが入ります。"
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

          <div className="flex-shrink-0">
            <LevelIndicator />
          </div>
        </div>
      </div>
    );
  };

  // 🎨 小目標ビュー：色とフォントを統一
  const renderMinorView = () => {
    if (!selectedMiddleCellId || !minorCharts[selectedMiddleCellId]) {
      return <div className="text-body text-text">データが見つかりません</div>;
    }

    const minorChart = minorCharts[selectedMiddleCellId];
    const middleCell = Object.values(middleCharts)
      .flatMap((chart) => chart.cells)
      .find((c) => c.id === selectedMiddleCellId);

    return (
      <div className="flex justify-center items-start gap-8">
        <div className="max-w-xl flex-1 space-y-6">
          <div className="w-full">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-card-lg p-4 border-2 border-primary/20">
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

          <div className="space-y-3">
            {minorChart.cells.map((cell) => (
              <div
                key={cell.id}
                className={`flex items-center space-x-3 p-2 rounded-card-lg border-2 transition-all ${
                  cell.isChecked
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white"
                }`}
              >
                <button
                  onClick={() => handleMinorCheck(cell.id)}
                  disabled={!cell.title}
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    cell.isChecked
                      ? "bg-primary border-primary"
                      : cell.title
                      ? "border-border hover:border-primary cursor-pointer"
                      : "border-border cursor-not-allowed"
                  }`}
                >
                  {cell.isChecked && <Check className="w-5 h-5 text-white" />}
                </button>

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
                        ? "line-through text-text/40"
                        : "text-primary"
                    }`}
                    placeholder="ここに22文字まで目標のテキストが入ります。"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

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
        {viewLevel === "major" && renderMajorView()}
        {viewLevel === "middle" && renderMiddleView()}
        {viewLevel === "minor" && renderMinorView()}
      </div>

      <AchievementPopup
        isOpen={achievementPopup.isOpen}
        onClose={() =>
          setAchievementPopup({ ...achievementPopup, isOpen: false })
        }
        goalTitle={achievementPopup.goalTitle}
        level={achievementPopup.level}
        message="素晴らしい成果です！この調子で次の目標も達成しましょう!"
      />
    </div>
  );
};

export default MandalaChart;
