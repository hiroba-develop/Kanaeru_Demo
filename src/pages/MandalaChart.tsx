import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import GoalInputModal from "../components/GoalInputModal";
import AchievementPopup from "../components/AchievementPopup";
import level1Icon from "../assets/mandalaLevelIcon/level1.png";
import level2Icon from "../assets/mandalaLevelIcon/level2.png";
import level3Icon from "../assets/mandalaLevelIcon/level3.png";
import {type MandalaCell,} from "../utils/mandalaIntegration";
import { ArrowLeft } from "lucide-react";
import complate_icon from "../assets/complate_icon.png";
import heart_icon from "../assets/heart_icon.png";

type MultiRingProgressProps = {
  totalRings: number;
  filledRings: number;
  isCompleted: boolean;
  size?: number;
  offsetY?: number;
};

type MajorRingProgressProps = {
  ringRatios: number[];
  size?: number;
  offsetY?: number;
};

const formatTitleWithLineBreaks = (title: string, chunkSize = 7): string => {
  if (!title) return "";
  const chars = Array.from(title);
  const chunks: string[] = [];
  for (let i = 0; i < chars.length; i += chunkSize) {
    chunks.push(chars.slice(i, i + chunkSize).join(""));
  }
  return chunks.join("<br>");
};

const MajorRingProgress: React.FC<MajorRingProgressProps> = ({
  ringRatios,
  size = 190,
  offsetY = 0,
}) => {
  const strokeWidth = 3;
  const gap = 1.0;
  const cx = size / 2;
  const cy = size / 2;

  const circles: React.ReactNode[] = [];

  const minRadius = 55;
  const maxRadius = size / 2 - strokeWidth / 2 - 5;
  const radiusDecrement = strokeWidth + gap;

  ringRatios.forEach((ratio, index) => {
    if (ratio <= 0) return;

    const radius = maxRadius - index * radiusDecrement;
    if (radius < minRadius) return;

    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference;
    const dashOffset = -circumference * (1 - ratio);

    circles.push(
      <circle
        key={index}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#d9f2e7"
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
      className="absolute pointer-events-none z-10"
      style={{
        top: '50%',
        left: '50%',
        transform: `translate(-50%, calc(-50% + ${offsetY}px))`
      }}
    >
      {circles}
    </svg>
  );
};

const MultiRingProgress: React.FC<MultiRingProgressProps> = ({
  totalRings,
  filledRings,
  size = 120,
  offsetY = 0,
}) => {
  const strokeWidth = 3;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - strokeWidth / 2 - 5;

  // 達成率を計算（0から1の範囲）
  const ratio = totalRings > 0 ? filledRings / totalRings : 0;
  
  const circumference = 2 * Math.PI * radius;
  const dashArray = circumference;
  const dashOffset = -circumference * (1 - ratio);

  return (
    <svg
      width={size}
      height={size}
      className="absolute pointer-events-none"
      style={{
        top: '50%',
        left: '50%',
        transform: `translate(-50%, calc(-50% + ${offsetY}px))`
      }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#d9f2e7"
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
    </svg>
  );
};

interface MandalaCellFrameProps {
  status: "not_started" | "in_progress" | "achieved";
  visualStatus?: "not_started" | "in_progress" | "achieved";
  children: React.ReactNode;
  isHoverable?: boolean;
}

const MandalaCellFrame: React.FC<MandalaCellFrameProps> = ({
  children,
  isHoverable = false,
}) => {

  const base =
    "aspect-square p-4 flex flex-col transition-all relative";

  const hoverClass = isHoverable
    ? "hover:shadow-lg"
    : "";

  return (
    <div 
      className={`${base} ${hoverClass}`}
      style={{
        width: '200px',
        height: '200px',
        borderRadius: '20px',
        boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
        border: 'none',
        background: '#FFFFFF'
      }}
    >
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
};

interface MandalaSubChart {
  centerId: string;
  centerTitle: string;
  cells: MandalaCell[];
}

type ViewLevel = "major" | "middle" | "minor";

const MandalaChart: React.FC = () => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("major");
  const [selectedMajorCellId, setSelectedMajorCellId] = useState<string | null>(null);
  const [selectedMiddleCellId, setSelectedMiddleCellId] = useState<string | null>(null);
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

  // 変更追跡用の状態
  const [savedMinorCharts, setSavedMinorCharts] = useState<{[key: string]: MandalaSubChart}>({});

  // モーダル用のstate
  const [goalInputModal, setGoalInputModal] = useState<{
    isOpen: boolean;
    cellId: string;
    cellType: 'center' | 'major' | 'middle' | 'minor';
    currentValue: string;
  }>({
    isOpen: false,
    cellId: '',
    cellType: 'center',
    currentValue: ''
  });

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

  // 保存状態を更新する関数
  const updateSavedState = useCallback(() => {
    setSavedMinorCharts(JSON.parse(JSON.stringify(minorCharts)));
  }, [minorCharts]);

  // 初期保存状態を設定
  useEffect(() => {
    setSavedMinorCharts(JSON.parse(JSON.stringify(minorCharts)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // カスタムイベントリスナーを追加
  useEffect(() => {
    const handleGoalUpdate = () => {
      console.log("保存状態を更新します");
      updateSavedState();
    };

    window.addEventListener('mandalaGoalUpdated', handleGoalUpdate);

    return () => {
      window.removeEventListener('mandalaGoalUpdated', handleGoalUpdate);
    };
  }, [updateSavedState]);

  useEffect(() => {
    localStorage.setItem("mandala_center_goal_v2", centerGoal);
  }, [centerGoal]);

  useEffect(() => {
    if (centerFeeling) {
      localStorage.setItem("mandala_center_feeling_v2", centerFeeling);
    }
  }, [centerFeeling]);

  useEffect(() => {
    localStorage.setItem("mandala_major_cells_v2", JSON.stringify(majorCells));
  }, [majorCells]);

  useEffect(() => {
    majorCells.forEach((cell) => {
      const element = document.querySelector(`[data-cell-id="${cell.id}"]`);
      if (element && cell.title) {
        element.innerHTML = formatTitleWithLineBreaks(cell.title);
      }
    });
  }, [majorCells]);

  useEffect(() => {
    localStorage.setItem(
      "mandala_middle_charts_v2",
      JSON.stringify(middleCharts)
    );
  }, [middleCharts]);

  useEffect(() => {
    localStorage.setItem(
      "mandala_minor_charts_v2",
      JSON.stringify(minorCharts)
    );
  }, [minorCharts]);

  const location = useLocation();
  // マンダラページに来たときにデータを再読み込み
  // ページ遷移時のデータ読み込み
  useEffect(() => {
    console.log('=== Mandala Page Loaded/Navigated ===');
    
    const savedMajorCells = localStorage.getItem("mandala_major_cells_v2");
    const savedMiddleCharts = localStorage.getItem("mandala_middle_charts_v2");
    const savedMinorCharts = localStorage.getItem("mandala_minor_charts_v2");
    
    if (savedMajorCells) {
      const parsed = JSON.parse(savedMajorCells);
      console.log('Reloaded major cells:', parsed);
      setMajorCells(parsed);
    }
    if (savedMiddleCharts) {
      const parsed = JSON.parse(savedMiddleCharts);
      console.log('Reloaded middle charts:', parsed);
      setMiddleCharts(parsed);
    }
    if (savedMinorCharts) {
      const parsed = JSON.parse(savedMinorCharts);
      console.log('🔍 Reloaded minor charts:', parsed);
      
      // 該当のセルを探す
      Object.entries(parsed).forEach(([, chart]: [string, any]) => {
        chart.cells.forEach((cell: any) => {
          if (cell.title === "1年目に売上100万円") {
            console.log('🎯 Found target cell:', {
              id: cell.id,
              title: cell.title,
              isChecked: cell.isChecked,
              achievement: cell.achievement,
              status: cell.status
            });
          }
        });
      });
      
      setMinorCharts(parsed);
    }
    
    console.log('=== Mandala Data Reloaded ===');
  }, [location]);

  // minorChartsが更新されたとき
  useEffect(() => {
    console.log('📝 minorCharts state updated');
    
    // 該当のセルを確認
    Object.entries(minorCharts).forEach(([, chart]) => {
      chart.cells.forEach((cell) => {
        if (cell.title === "1年目に売上100万円") {
          console.log('🎯 Target cell in state:', {
            id: cell.id,
            title: cell.title,
            isChecked: cell.isChecked,
            achievement: cell.achievement,
            status: cell.status
          });
        }
      });
    });
  }, [minorCharts]); // middleChartsを依存配列から削除

  useEffect(() => {
    const charts: { [key: string]: MandalaSubChart } = {};
    let hasChanges = false;
    
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
          hasChanges = true;
        } else {
          charts[cell.id] = {
            ...minorCharts[cell.id],
            centerTitle: cell.title,
          };
        }
      });
    });
    
    if (hasChanges) {
      setMinorCharts(charts);
    }
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

  // モーダルを開く関数
  const openGoalInputModal = (
    cellId: string, 
    cellType: 'center' | 'major' | 'middle' | 'minor', 
    currentValue: string
  ) => {
    setGoalInputModal({
      isOpen: true,
      cellId,
      cellType,
      currentValue
    });
  };

  // モーダルからの送信処理
  const handleGoalSubmit = (
    goal: string, 
    goalType: 'qualitative' | 'revenue' | 'grossProfit' | 'operatingProfit'
  ) => {
    const { cellId, cellType } = goalInputModal;

    if (cellType === 'center') {
      setCenterGoal(goal);
      
      // 中心セルにもplMetricを保存
      const plMetric = 
        goalType === 'revenue' ? 'revenue' :
        goalType === 'grossProfit' ? 'grossProfit' :
        goalType === 'operatingProfit' ? 'operatingProfit' :
        undefined;
      
      if (plMetric) {
        localStorage.setItem('mandala_center_plMetric_v2', plMetric);
      } else {
        localStorage.removeItem('mandala_center_plMetric_v2');
      }
    } else if (cellType === 'major') {
      // 大目標にもplMetricを設定
      const plMetric = 
        goalType === 'revenue' ? 'revenue' :
        goalType === 'grossProfit' ? 'grossProfit' :
        goalType === 'operatingProfit' ? 'operatingProfit' :
        undefined;

      setMajorCells((prev) =>
        prev.map((c) =>
          c.id === cellId ? { ...c, title: goal, plMetric } : c
        )
      );
    } else if (cellType === 'middle' && selectedMajorCellId) {
      const plMetric = 
        goalType === 'revenue' ? 'revenue' :
        goalType === 'grossProfit' ? 'grossProfit' :
        goalType === 'operatingProfit' ? 'operatingProfit' :
        undefined;

      setMiddleCharts((prev) => ({
        ...prev,
        [selectedMajorCellId]: {
          ...prev[selectedMajorCellId],
          cells: prev[selectedMajorCellId].cells.map((c) =>
            c.id === cellId ? { ...c, title: goal, plMetric } : c
          ),
        },
      }));
    } else if (cellType === 'minor' && selectedMiddleCellId) {
      setMinorCharts({
        ...minorCharts,
        [selectedMiddleCellId]: {
          ...minorCharts[selectedMiddleCellId],
          cells: minorCharts[selectedMiddleCellId].cells.map((c) =>
            c.id === cellId ? { ...c, title: goal } : c
          ),
        },
      });
    }
  };

  // handleMinorCheck関数の前に追加
  const saveMinorCell = (cellId: string) => {
    const chartId = Object.keys(minorCharts).find(key =>
      minorCharts[key].cells.some(c => c.id === cellId)
    );
    if (!chartId) return;

    // 現在のセルの値で保存状態を更新
    const currentCell = minorCharts[chartId].cells.find(c => c.id === cellId);
    if (!currentCell) return;

    setSavedMinorCharts(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        cells: prev[chartId].cells.map(c =>
          c.id === cellId ? { ...currentCell } : c
        )
      }
    }));
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
  
    const updatedChart = {
      ...chart,
      cells: updatedCells,
    };
  
    setMinorCharts({
      ...minorCharts,
      [selectedMiddleCellId]: updatedChart,
    });
  
    // チェック状態変更時に自動的に保存状態も更新
    setSavedMinorCharts(prev => ({
      ...prev,
      [selectedMiddleCellId]: updatedChart,
    }));
  
    updateMiddleAchievement(selectedMiddleCellId, updatedCells);
  };

  const updateMiddleAchievement = (
    middleCellId: string,
    minorCells: MandalaCell[]
  ) => {
    console.log('🔄 updateMiddleAchievement called with:', middleCellId);
    
    const checkedCount = minorCells.filter((c) => c.isChecked).length;
    const achievement = Math.round((checkedCount / 10) * 100);

    // 全ての中目標をチェックして、このminorChartに対応する中目標を全て更新
    Object.entries(middleCharts).forEach(([majorId, middleChart]) => {
      let hasUpdate = false;
      const updatedCells = middleChart.cells.map((cell) => {
        // この中目標のIDが、更新対象のminorChartのIDと一致するかチェック
        if (cell.id === middleCellId) {
          console.log('✅ Found matching middle cell:', {
            majorId,
            middleCellId: cell.id,
            title: cell.title,
            currentAchievement: cell.achievement,
            newAchievement: achievement
          });

          const prevCell = cell;

          // すでに達成済みの場合はスキップ
          if (prevCell.status === "achieved") {
            console.log('⏭️ Skipping already achieved cell:', cell.id);
            return cell;
          }

          const isPLMetric = !!prevCell.plMetric;
          hasUpdate = true;

          const updatedCell = {
            ...prevCell,
            achievement,
            status: isPLMetric ? prevCell.status : getCellStatus(achievement),
          };

          // 達成時のポップアップ表示
          if (
            !isPLMetric &&
            achievement === 100 &&
            updatedCell.title &&
            prevCell.achievement !== 100
          ) {
            setAchievementPopup({
              isOpen: true,
              goalTitle: updatedCell.title,
              level: "middle",
            });
          }

          return updatedCell;
        }
        return cell;
      });

      // 更新があった場合のみsetStateを実行
      if (hasUpdate) {
        console.log('💾 Updating middle chart:', majorId);
        setMiddleCharts((prev) => ({
          ...prev,
          [majorId]: {
            ...middleChart,
            cells: updatedCells,
          },
        }));

        updateMajorAchievement(majorId, updatedCells);
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
          };

          if (
            cell.status !== "achieved" &&
            newCell.achievement === 100 &&
            cell.title
          ) {
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
    if (!middleChart) {
      return [];
    }
  
    const ratios = middleChart.cells.map((middleCell) => {
      const minorChart = minorCharts[middleCell.id];
      if (!minorChart) {
        return 0;
      }
  
      const checked = minorChart.cells.filter((c) => c.isChecked).length;
      const ratio = checked / 10;
  
      return Math.max(0, Math.min(1, ratio));
    });
  
    return ratios;
  };

  const getMiddleCellProgress = (middleCellId: string) => {
    const minorChart = minorCharts[middleCellId];
    if (!minorChart) {
      return { filledRings: 0, totalRings: 10, isCompleted: false };
    }
  
    const checked = minorChart.cells.filter((c) => c.isChecked).length;
    const totalRings = 10; // 小目標は常に10個
    const filledRings = checked; // 達成した数
  
    return {
      filledRings: filledRings,
      totalRings: totalRings,
      isCompleted: filledRings === 10,
    };
  };

  // 変更があるかチェックする関数（小目標のみ）
  const isMinorCellChanged = (cellId: string) => {
    const chartId = Object.keys(minorCharts).find(key =>
      minorCharts[key].cells.some(c => c.id === cellId)
    );
    if (!chartId) return false;

    const currentCell = minorCharts[chartId]?.cells.find(c => c.id === cellId);
    const savedCell = savedMinorCharts[chartId]?.cells.find(c => c.id === cellId);
    return JSON.stringify(currentCell) !== JSON.stringify(savedCell);
  };

  const LevelIndicator: React.FC = () => {
    const getLevelIcon = () => {
      switch (viewLevel) {
        case "major":
          return level1Icon;
        case "middle":
          return level2Icon;
        case "minor":
          return level3Icon;
        default:
          return level1Icon;
      }
    };
  
    return (
      <div 
        className="fixed hidden lg:block" 
        style={{ 
          top: '132px', 
          right: '50px',
          width: '34px',
          height: '32px',
          opacity: 1,
          zIndex: 10
        }}
      >
        <img 
          src={getLevelIcon()} 
          alt={`${viewLevel} level`}
          className="w-full h-full object-contain"
        />
      </div>
    );
  };

  const renderMajorView = () => {
    const gridOrder = [0, 1, 2, 3, null, 4, 5, 6, 7];
  
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8">
          <div 
            className="grid grid-cols-3"
            style={{
              width: '632px',
              height: '632px',
              gap: '16px',
              position: 'relative'
            }}
          >
            {gridOrder.map((cellIndex) => {
              if (cellIndex === null) {
                const isCenterHovered = hoveredCellId === 'center';
                
                return (
                  <div
                    key="center"
                    className="aspect-square p-4 flex flex-col items-center justify-center hover:shadow-lg transition-all group"
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '20px',
                      boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                      border: 'none',
                      background: '#FFFFFF',
                      position: 'relative'
                    }}
                    onMouseEnter={() => setHoveredCellId('center')}
                    onMouseLeave={() => setHoveredCellId(null)}
                  >
                    {isCenterHovered && !centerGoal && (
                      <div
                        className="absolute pointer-events-none transition-opacity duration-200"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '14px',
                          color: 'rgba(19, 174, 103, 0.5)',
                          whiteSpace: 'nowrap',
                          zIndex: 5
                        }}
                      >
                        どんな目標にする？
                      </div>
                    )}
                    
                    <div
                      style={{
                        position: 'absolute',
                        width: '84px',
                        height: '15px',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -85px)',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '12px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        textAlign: 'center',
                        color: '#13AE67'
                      }}
                    >
                      私が叶える目標
                    </div>
              
                    <div
                      onClick={() => openGoalInputModal('center', 'center', centerGoal)}
                      className="bg-transparent border-none text-center cursor-pointer z-20"
                      style={{
                        position: 'absolute',
                        width: '160px',
                        height: '80px', // 高さを増やす
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -40px)', // 中央配置調整
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        fontStyle: 'normal',
                        fontSize: centerGoal.includes('\n') ? '16px' : '20px', // 改行がある場合は小さく
                        lineHeight: centerGoal.includes('\n') ? '22px' : '32px', // 行間も調整
                        letterSpacing: '0%',
                        textAlign: 'center',
                        color: '#13AE67',
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0'
                      }}
                    >
                      {centerGoal || ''}
                    </div>
                  </div>
                );
              }
  
              const cell = majorCells[cellIndex];
              const ringRatios = getMajorRingRatios(cell.id);
              const isCellHovered = hoveredCellId === cell.id;
  
              const mandalaCompleted =
                ringRatios.length > 0 && ringRatios.every((r) => r >= 1);
  
              const isFullyCompleted =
                cell.status === "achieved" && mandalaCompleted;
  
              const visualStatus: MandalaCell["status"] =
                cell.status === "achieved" && !mandalaCompleted
                  ? "in_progress"
                  : cell.status;
  
              return (
                <MandalaCellFrame
                  key={cell.id}
                  status={cell.status}
                  visualStatus={visualStatus}
                  isHoverable={true}
                >
                  <div 
                    className="flex flex-col items-center h-full group"
                    onMouseEnter={() => setHoveredCellId(cell.id)}
                    onMouseLeave={() => setHoveredCellId(null)}
                  >
                    <div className="relative w-full flex-1 min-h-0">
                      {isCellHovered && !cell.title && (
                        <div
                          className="absolute pointer-events-none transition-opacity duration-200 z-30"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: 'rgba(19, 174, 103, 0.5)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          どんな目標にする？
                        </div>
                      )}
                      
                      {cell.title && (
                        <>
                          {isFullyCompleted ? (
                            <img
                              src={complate_icon}
                              alt="達成リング"
                              className="absolute pointer-events-none"
                              style={{
                                width: '180px',
                                height: '180px',
                                objectFit: 'contain',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, calc(-50% + 10px))'
                              }}
                            />
                          ) : ringRatios.length > 0 ? (
                            <MajorRingProgress
                              ringRatios={ringRatios}
                              size={190}
                              offsetY={22}
                            />
                          ) : null}
                        </>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div
                          onClick={() => openGoalInputModal(cell.id, 'major', cell.title)}
                          className="bg-transparent border-none text-center cursor-pointer hover:bg-white/50 transition-colors"
                          style={{
                            position: 'absolute',
                            width: '103px',
                            height: '69px',
                            fontFamily: 'Inter',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '24px',
                            textAlign: 'center',
                            whiteSpace: 'pre-wrap',
                            overflow: 'hidden',
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, calc(-50% + 10px))',
                            color: visualStatus === "achieved" ? '#F2A1A0' : '#13AE67'
                          }}  
                        >
                          {cell.title || ''}
                        </div>
                      </div>
                    </div>

                    {cell.title && (
                      <button
                        onClick={() => handleMajorCellClick(cell.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-note text-primary hover:text-primary/80 font-semibold bg-white/90 rounded-full px-4 py-2 shadow-md cursor-pointer z-30 mt-2"
                        style={{ width: '140px' }}
                      >
                        中目標を設定 →
                      </button>
                    )}
                  </div>
                </MandalaCellFrame>
              );
            })}
          </div>
          <div className="hidden lg:flex fixed items-start" style={{ gap: '8px', right: '50px', top: '132px' }}>
            <p style={{
              position: 'absolute',
              right: '70px',
              top: '14px',
              fontFamily: 'Inter',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '100%',
              color: '#9CA3AF',
              whiteSpace: 'nowrap',
              visibility: 'hidden'
            }}>
              今は大目標を表示しています
            </p>
            <div style={{ width: '40px', height: '40px', visibility: 'hidden' }}></div>
            <LevelIndicator />
          </div>
        </div>
      </div>
    );
  };

  const renderMiddleView = () => {
    if (!selectedMajorCellId || !middleCharts[selectedMajorCellId]) {
      return <div className="text-body text-text">データが見つかりません</div>;
    }
  
    const majorCell = majorCells.find((c) => c.id === selectedMajorCellId)!;
    const middleChart = middleCharts[selectedMajorCellId];
  
    const gridOrder = [0, 1, 2, 3, null, 4, 5, 6, 7];
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8 relative">
          <div 
            className="grid grid-cols-3"
            style={{
              width: '632px',
              height: '632px',
              gap: '16px',
              position: 'relative'
            }}
          >
            {gridOrder.map((cellIndex) => {
                if (cellIndex === null) {
                  return (
                    <div
                      key="center"
                      className="aspect-square p-4 flex flex-col items-center justify-center"
                      style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '20px',
                        boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                        border: 'none',
                        background: '#FFFFFF',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          width: '84px',
                          height: '15px',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -85px)',
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontStyle: 'normal',
                          fontSize: '12px',
                          lineHeight: '100%',
                          letterSpacing: '0%',
                          textAlign: 'center',
                          color: '#13AE67'
                        }}
                      >
                        私が叶える目標
                      </div>
  
                      <div
                        style={{
                          position: 'absolute',
                          width: '160px',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -32px)',
                          fontFamily: 'Inter',
                          fontWeight: 600,
                          fontStyle: 'normal',
                          fontSize: '14px',
                          lineHeight: '24px',
                          letterSpacing: '0%',
                          textAlign: 'center',
                          color: '#13AE67',
                          whiteSpace: 'normal',
                          overflow: 'hidden',
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word',
                          display: 'block'
                        }}
                      >
                        {majorCell.title}
                      </div>
                    </div>
                  );
                }
  
                const cell = middleChart.cells[cellIndex];
                const progress = getMiddleCellProgress(cell.id);
                const isCellHovered = hoveredCellId === cell.id;
  
                const mandalaCompleted = progress.isCompleted;
  
                const isFullyCompleted =
                  mandalaCompleted && cell.status === "achieved";
  
                const visualStatus: MandalaCell["status"] =
                  cell.status === "achieved" && !mandalaCompleted
                    ? "in_progress"
                    : cell.status;
  
                return (
                  <MandalaCellFrame
                    key={cell.id}
                    status={cell.status}
                    visualStatus={visualStatus}
                    isHoverable={true}
                  >
                    <div 
                      className="relative z-10 text-center flex flex-col items-center h-full group"
                      onMouseEnter={() => setHoveredCellId(cell.id)}
                      onMouseLeave={() => setHoveredCellId(null)}
                    >
                      <div className="relative w-full flex-1 min-h-0">
                        {isCellHovered && !cell.title && (
                          <div
                            className="absolute pointer-events-none transition-opacity duration-200 z-30"
                            style={{
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontFamily: 'Inter',
                              fontWeight: 400,
                              fontSize: '14px',
                              color: 'rgba(19, 174, 103, 0.5)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            どんな目標にする？
                          </div>
                        )}
                        
                        {cell.title && (
                          <>
                            {isFullyCompleted ? (
                              <img
                                src={complate_icon}
                                alt="達成リング"
                                className="absolute pointer-events-none"
                                style={{
                                  width: '190px',
                                  height: '190px',
                                  objectFit: 'contain',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, calc(-50% + 10px))'
                                }}
                              />
                            ) : progress.totalRings > 0 ? (
                              <MultiRingProgress
                                totalRings={progress.totalRings}
                                filledRings={progress.filledRings}
                                isCompleted={false}
                                size={190}
                                offsetY={22}
                              />
                            ) : null}
                          </>
                        )}
  
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            onClick={() => openGoalInputModal(cell.id, 'middle', cell.title)}
                            className="bg-transparent border-none text-center cursor-pointer hover:bg-white/50 transition-colors"
                            style={{
                              position: 'absolute',
                              width: '103px',
                              height: '69px',
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              fontSize: '14px',
                              lineHeight: '24px',
                              textAlign: 'center',
                              whiteSpace: 'pre-wrap',
                              overflow: 'hidden',
                              wordBreak: 'break-all',
                              overflowWrap: 'break-word',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, calc(-50% + 10px))',
                              color: visualStatus === "achieved" ? '#F2A1A0' : '#13AE67'
                            }}
                          >
                            {cell.title || ''}
                          </div>
                        </div>
                      </div>
  
                      {cell.title && (
                        <button
                          onClick={() => handleMiddleCellClick(cell.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-note text-primary hover:text-primary/80 font-semibold bg-white/90 rounded-full px-4 py-2 shadow-md cursor-pointer z-30 mt-2"
                          style={{ width: '140px' }}
                        >
                          小目標を設定 →
                        </button>
                      )}
                    </div>
                  </MandalaCellFrame>
                );
              })}
            </div>

            <div className="hidden lg:flex fixed items-start" style={{ gap: '8px', right: '120px', top: '132px' }}>
              <p style={{
                position: 'absolute',
                right: '70px',
                top: '14px',
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '100%',
                color: '#9CA3AF',
                whiteSpace: 'nowrap'
              }}>
                今は中目標を表示しています
              </p>
              <button
                onClick={handleBackToMajor}
                className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-md transition-colors cursor-pointer"
                title="大目標に戻る"
              >
                <ArrowLeft className="w-5 h-5 text-primary" style={{ transform: 'rotate(90deg)' }} />
              </button>
              <LevelIndicator />
            </div>
        </div>
      </div>
    );
  };

  const renderMinorView = () => {
    if (
      !selectedMiddleCellId ||
      !minorCharts[selectedMiddleCellId] ||
      !selectedMajorCellId ||
      !middleCharts[selectedMajorCellId]
    ) {
      return <div className="text-body text-text">データが見つかりません</div>;
    }
  
    const minorChart = minorCharts[selectedMiddleCellId];
    const middleChartOfSelectedMajor = middleCharts[selectedMajorCellId];
  
    const middleCellIndex = middleChartOfSelectedMajor.cells.findIndex(
      (c) => c.id === selectedMiddleCellId
    );
    const middleCell =
      middleCellIndex !== -1
        ? middleChartOfSelectedMajor.cells[middleCellIndex]
        : null;
  
        return (
          <div className="flex flex-col lg:flex-row justify-center items-start gap-8 relative">
            <div className="flex-1 space-y-6" style={{ maxWidth: '660px' }}>
              <div className="w-full">
                <div 
                  style={{
                    width: '660px',
                  height: '96px',
                  borderRadius: '20px',
                  background: '#FFFFFF',
                  boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px'
                }}
              >
              <p
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  fontSize: '20px',
                  lineHeight: '32px',
                  letterSpacing: '0%',
                  textAlign: 'center',
                  color: '#13AE67',
                  whiteSpace: 'pre-wrap',
                  margin: 0
                }}
              >
                {middleCell?.title || ""}
              </p>
            </div>
          </div>
  
          <div className="space-y-4">
          {minorChart.cells.map((cell) => {
            const isCellHovered = hoveredCellId === cell.id;
            const cellChanged = isMinorCellChanged(cell.id);

            return (
              <div
                key={cell.id}
                className="flex items-center transition-all relative group"
                style={{
                  width: '660px',
                  height: '48px',
                  borderRadius: '20px',
                  background: cellChanged ? 'rgba(19, 174, 103, 0.05)' : '#FFFFFF',
                  boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                  padding: '8px 12px',
                  gap: '12px'
                }}
                onMouseEnter={() => setHoveredCellId(cell.id)}
                onMouseLeave={() => setHoveredCellId(null)}
              >
                {isCellHovered && !cell.title && (
                  <div
                    className="absolute pointer-events-none transition-opacity duration-200"
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                      color: 'rgba(19, 174, 103, 0.5)',
                      whiteSpace: 'nowrap',
                      zIndex: 20
                    }}
                  >
                    どんな目標にする？
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMinorCheck(cell.id);
                  }}
                  disabled={!cell.title}
                  className="flex-shrink-0 flex items-center justify-center transition-all relative"
                  style={{
                    width: '24px',
                    height: '24px',
                    cursor: cell.title ? 'pointer' : 'not-allowed',
                    opacity: !cell.title ? 0.5 : 1
                  }}
                >
                  {cell.isChecked ? (
                    <>
                      <div 
                        style={{
                          position: 'absolute',
                          width: '24px',
                          height: '24px',
                          background: '#13AE6773',
                          borderRadius: '50%',
                          opacity: 0.45
                        }}
                      />
                      <img 
                        src={heart_icon} 
                        alt="完了" 
                        style={{
                          width: '14px',
                          height: '12px',
                          objectFit: 'contain',
                          position: 'relative',
                          zIndex: 1
                        }}
                      />
                    </>
                  ) : (
                    <div 
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '50%'
                      }}
                    />
                  )}
                </button>

                <div className="flex-1 min-w-0 flex items-center">
                  <input
                    type="text"
                    value={cell.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setMinorCharts({
                        ...minorCharts,
                        [selectedMiddleCellId!]: {
                          ...minorCharts[selectedMiddleCellId!],
                          cells: minorCharts[selectedMiddleCellId!].cells.map((c) =>
                            c.id === cell.id ? { ...c, title: newTitle } : c
                          ),
                        },
                      });
                    }}
                    placeholder=""
                    className="w-full bg-transparent font-medium"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 700,
                      fontSize: '16px',
                      lineHeight: '32px',
                      letterSpacing: '0%',
                      color: '#13AE67',
                      padding: '0',
                      textAlign: 'left',
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* 保存するボタン - 変更がある場合のみ表示 */}
                {cellChanged && (               
                  <button
                  onClick={() => {
                    // 個別のセルを保存
                    saveMinorCell(cell.id);
                  }}
                  className="flex-shrink-0 transition-all hover:bg-green-600"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    fontSize: '12px',
                    color: '#FFFFFF',
                    background: '#13AE67',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  保存する
                </button>
                )}
                </div>
              );
            })}
          </div>
        </div>
  
        <div className="hidden lg:flex fixed items-start" style={{ gap: '8px', right: '120px', top: '132px' }}>
          <p style={{
            position: 'absolute',
            right: '70px',
            top: '14px',
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '100%',
            color: '#9CA3AF',
            whiteSpace: 'nowrap'
          }}>
            今は小目標を表示しています
          </p>
          <button
            onClick={handleBackToMiddle}
            className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-md transition-colors cursor-pointer"
            title="中目標に戻る"
          >
            <ArrowLeft className="w-5 h-5 text-primary" style={{ transform: 'rotate(90deg)' }} />
          </button>
          <LevelIndicator />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <div 
        className="w-full max-w-6xl mx-auto"
        style={{
          paddingTop: viewLevel === "minor" ? '60px' : '60px'
        }}
      >
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
        message="素晴らしい成果です!この調子で次の目標も達成しましょう!"
      />

      {/* 目標入力モーダル */}
      <GoalInputModal
        isOpen={goalInputModal.isOpen}
        onClose={() => setGoalInputModal({ ...goalInputModal, isOpen: false })}
        onSubmit={handleGoalSubmit}
        initialValue={goalInputModal.currentValue}
        cellType={goalInputModal.cellType}
      />
    </div>
  );
};

export default MandalaChart;