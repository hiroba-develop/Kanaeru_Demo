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
  const [ringSize, setRingSize] = useState(size);
  
  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 768) {
        const padding = 32;
        const gap = Math.max(4, Math.min(window.innerWidth * 0.02, 16));
        const cellWidth = (window.innerWidth - padding - gap * 2) / 3;
        const cellPadding = Math.max(8, Math.min(window.innerWidth * 0.02, 16));
        setRingSize((cellWidth - cellPadding * 2) * 0.85);
      } else {
        setRingSize(size);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size]);

  const strokeWidth = window.innerWidth < 768 ? 2 : 3;
  const gap = window.innerWidth < 768 ? 0.5 : 1.0;
  const cx = ringSize / 2;
  const cy = ringSize / 2;

  const circles: React.ReactNode[] = [];

  const minRadius = ringSize * 0.29;
  const maxRadius = ringSize / 2 - strokeWidth / 2 - (window.innerWidth < 768 ? 3 : 5);
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
      width={ringSize}
      height={ringSize}
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
  const [ringSize, setRingSize] = useState(size);
  
  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 768) {
        const padding = 32;
        const gap = Math.max(4, Math.min(window.innerWidth * 0.02, 16));
        const cellWidth = (window.innerWidth - padding - gap * 2) / 3;
        const cellPadding = Math.max(8, Math.min(window.innerWidth * 0.02, 16));
        setRingSize((cellWidth - cellPadding * 2) * 0.85);
      } else {
        setRingSize(size);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size]);

  const strokeWidth = window.innerWidth < 768 ? 2 : 3;
  const cx = ringSize / 2;
  const cy = ringSize / 2;
  const radius = ringSize / 2 - strokeWidth / 2 - (window.innerWidth < 768 ? 3 : 5);

  const ratio = totalRings > 0 ? filledRings / totalRings : 0;
  
  const circumference = 2 * Math.PI * radius;
  const dashArray = circumference;
  const dashOffset = -circumference * (1 - ratio);

  return (
    <svg
      width={ringSize}
      height={ringSize}
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
    "aspect-square flex flex-col transition-all relative";

  const hoverClass = isHoverable
    ? "hover:shadow-lg"
    : "";

  return (
    <div 
      className={`${base} ${hoverClass}`}
      style={{
        width: '100%',
        height: '100%',
        padding: 'clamp(6px, 1.5vw, 16px)',
        borderRadius: 'clamp(10px, 3vw, 20px)',
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
  const [isVisible, setIsVisible] = useState(false); // アニメーション用

  const [savedMinorCharts, setSavedMinorCharts] = useState<{[key: string]: MandalaSubChart}>({});

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

  // アニメーション制御
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // viewLevelが変わったときにアニメーションをリセット
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [viewLevel]);

  const updateSavedState = useCallback(() => {
    setSavedMinorCharts(JSON.parse(JSON.stringify(minorCharts)));
  }, [minorCharts]);

  useEffect(() => {
    setSavedMinorCharts(JSON.parse(JSON.stringify(minorCharts)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    console.log('📝 minorCharts state updated');
    
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
  }, [minorCharts]);

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

  const handleGoalSubmit = (
    goal: string, 
    goalType: 'qualitative' | 'revenue' | 'grossProfit' | 'operatingProfit'
  ) => {
    const { cellId, cellType } = goalInputModal;

    if (cellType === 'center') {
      setCenterGoal(goal);
      
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

  const saveMinorCell = (cellId: string) => {
    const chartId = Object.keys(minorCharts).find(key =>
      minorCharts[key].cells.some(c => c.id === cellId)
    );
    if (!chartId) return;

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

    Object.entries(middleCharts).forEach(([majorId, middleChart]) => {
      let hasUpdate = false;
      const updatedCells = middleChart.cells.map((cell) => {
        if (cell.id === middleCellId) {
          console.log('✅ Found matching middle cell:', {
            majorId,
            middleCellId: cell.id,
            title: cell.title,
            currentAchievement: cell.achievement,
            newAchievement: achievement
          });

          const prevCell = cell;

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
    const totalRings = 10;
    const filledRings = checked;
  
    return {
      filledRings: filledRings,
      totalRings: totalRings,
      isCompleted: filledRings === 10,
    };
  };

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
        style={{ 
          width: '34px',
          height: '32px',
          opacity: 1,
          flexShrink: 0
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
    
    // 時計回りのアニメーション順序（中心が0、その周りを時計回り）
    // 上: 1, 右上: 2, 右: 4, 右下: 7, 下: 6, 左下: 5, 左: 3, 左上: 0
    const animationOrder = [null, 1, 2, 4, 7, 6, 5, 3, 0];
  
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8">
        <div 
          className="grid grid-cols-3 w-full max-w-[632px]"
          style={{
            aspectRatio: '1/1',
            gap: 'clamp(4px, 2vw, 16px)',
          }}
        >
            {gridOrder.map((cellIndex) => {
              // アニメーションの遅延を計算
              const animationIndex = animationOrder.indexOf(cellIndex);
              const delay = animationIndex * 100;

              if (cellIndex === null) {
                const isCenterHovered = hoveredCellId === 'center';
                
                return (
                  <div
                    key="center"
                    className={`aspect-square p-4 flex flex-col items-center justify-center hover:shadow-lg transition-all group duration-500 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 'clamp(10px, 3vw, 20px)',
                      boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                      border: 'none',
                      background: '#FFFFFF',
                      position: 'relative',
                      transitionDelay: '0ms'
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
                          fontSize: 'clamp(8px, 1.6vw, 14px)',
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
                        width: 'auto',
                        height: 'auto',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, clamp(-48px, -6vw, -75px))',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: 'clamp(8px, 1.6vw, 12px)',
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
                        width: 'min(140px, 80%)',
                        height: 'auto',
                        maxHeight: '45%',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, clamp(-26px, -3vw, -38px))',
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        fontStyle: 'normal',
                        fontSize: centerGoal.includes('\n') 
                          ? 'clamp(10px, 2.4vw, 16px)' 
                          : 'clamp(12px, 3vw, 20px)',
                        lineHeight: centerGoal.includes('\n') ? 'clamp(15px, 3vw, 22px)' : 'clamp(18px, 4vw, 30px)',
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
                        padding: '0 2px'
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
                <div
                  key={cell.id}
                  className={`transition-all duration-500 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}
                  style={{
                    transitionDelay: `${delay}ms`
                  }}
                >
                  <MandalaCellFrame
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
                              fontSize: 'clamp(7px, 1.4vw, 14px)',
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
                              className="absolute pointer-events-none z-10"
                              style={{
                                width: window.innerWidth < 768 ? '100%' : '210px',
                                height: window.innerWidth < 768 ? '100%' : '210px',
                                objectFit: 'contain',
                                top: '50%',
                                left: '50%',
                                transform: `translate(-50%, calc(-50% + ${window.innerWidth < 768 ? '8px' : '22px'}))`
                              }}
                            />
                          ) : ringRatios.length > 0 ? (
                            <MajorRingProgress
                              ringRatios={ringRatios}
                              size={190}
                              offsetY={window.innerWidth < 768 ? 8 : 22}
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
                              width: 'min(100px, 65%)',
                              height: 'auto',
                              maxHeight: '50%',
                              fontFamily: 'Inter',
                              fontStyle: 'normal',
                              fontWeight: 600,
                              fontSize: 'clamp(9px, 1.8vw, 14px)',
                              lineHeight: 'clamp(13px, 2.6vw, 20px)',
                              textAlign: 'center',
                              whiteSpace: 'pre-wrap',
                              overflow: 'hidden',
                              wordBreak: 'break-all',
                              overflowWrap: 'break-word',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, calc(-50% + clamp(3px, 1vw, 8px)))',
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
                          className="md:opacity-0 md:group-hover:opacity-100 transition-opacity text-note text-primary hover:text-primary/80 font-semibold bg-white/90 rounded-full shadow-md cursor-pointer z-30"
                          style={{ 
                            width: 'clamp(90px, 22vw, 140px)',
                            fontSize: 'clamp(8px, 1.6vw, 12px)',
                            padding: 'clamp(3px, 0.8vw, 8px) clamp(6px, 1.5vw, 16px)',
                            marginTop: 'clamp(2px, 0.5vw, 8px)'
                          }}
                        >
                          中目標を設定 →
                        </button>
                      )}
                    </div>
                  </MandalaCellFrame>
                </div>
              );
            })}
          </div>
          <div 
            className="fixed top-[70px] right-4 lg:right-8 lg:top-[100px]"
            style={{ 
              zIndex: 20
            }}
          >
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
    const animationOrder = [null, 1, 2, 4, 7, 6, 5, 3, 0];
  
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8 relative">
        <div 
          className="grid grid-cols-3 w-full max-w-[632px]"
          style={{
            aspectRatio: '1/1',
            gap: 'clamp(4px, 2vw, 16px)',
            position: 'relative'
          }}
        >
            {gridOrder.map((cellIndex) => {
              const animationIndex = animationOrder.indexOf(cellIndex);
              const delay = animationIndex * 100;

              if (cellIndex === null) {
                return (
                  <div
                    key="center"
                    className={`aspect-square p-4 flex flex-col items-center justify-center transition-all duration-500 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 'clamp(10px, 3vw, 20px)',
                      boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                      border: 'none',
                      background: '#FFFFFF',
                      position: 'relative',
                      transitionDelay: '0ms'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        width: 'auto',
                        height: 'auto',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, clamp(-48px, -6vw, -75px))',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: 'clamp(8px, 1.6vw, 12px)',
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
                        width: 'min(140px, 80%)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, clamp(-22px, -2.8vw, -30px))',
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        fontStyle: 'normal',
                        fontSize: 'clamp(9px, 1.8vw, 14px)',
                        lineHeight: 'clamp(13px, 2.6vw, 20px)',
                        letterSpacing: '0%',
                        textAlign: 'center',
                        color: '#13AE67',
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                        display: 'block',
                        padding: '0 2px'
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
                <div
                  key={cell.id}
                  className={`transition-all duration-500 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}
                  style={{
                    transitionDelay: `${delay}ms`
                  }}
                >
                  <MandalaCellFrame
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
                              fontSize: 'clamp(12px, 2.5vw, 14px)',
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
                              className="absolute pointer-events-none z-10"
                              style={{
                                width: window.innerWidth < 768 ? '100%' : '210px',
                                height: window.innerWidth < 768 ? '100%' : '210px',
                                objectFit: 'contain',
                                top: '50%',
                                left: '50%',
                                transform: `translate(-50%, calc(-50% + ${window.innerWidth < 768 ? '8px' : '22px'}))`
                              }}
                            />
                          ) : progress.totalRings > 0 ? (
                            <MultiRingProgress
                              totalRings={progress.totalRings}
                              filledRings={progress.filledRings}
                              isCompleted={false}
                              size={190}
                              offsetY={window.innerWidth < 768 ? 8 : 22}
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
                              width: 'min(100px, 65%)',
                              height: 'auto',
                              maxHeight: '50%',
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              fontSize: 'clamp(9px, 1.8vw, 14px)',
                              lineHeight: 'clamp(13px, 2.6vw, 20px)',
                              textAlign: 'center',
                              whiteSpace: 'pre-wrap',
                              overflow: 'hidden',
                              wordBreak: 'break-all',
                              overflowWrap: 'break-word',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, calc(-50% + clamp(3px, 1vw, 8px)))',
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
                          className="md:opacity-0 md:group-hover:opacity-100 transition-opacity text-note text-primary hover:text-primary/80 font-semibold bg-white/90 rounded-full shadow-md cursor-pointer z-30"
                          style={{ 
                            width: 'clamp(90px, 22vw, 140px)',
                            fontSize: 'clamp(8px, 1.6vw, 12px)',
                            padding: 'clamp(3px, 0.8vw, 8px) clamp(6px, 1.5vw, 16px)',
                            marginTop: 'clamp(2px, 0.5vw, 8px)'
                          }}
                        >
                          小目標を設定 →
                        </button>
                      )}
                    </div>
                  </MandalaCellFrame>
                </div>
              );
            })}
          </div>

          <div 
            className="fixed top-[70px] right-4 lg:right-8 lg:top-[100px]"
            style={{ 
              zIndex: 20
            }}
          >
            <LevelIndicator />
          </div>

          <div 
            className="fixed top-[70px] right-[60px] lg:right-[84px] lg:top-[100px]"
            style={{ 
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <p 
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: 'clamp(10px, 2vw, 12px)',
                lineHeight: '100%',
                color: '#9CA3AF',
                whiteSpace: 'nowrap'
              }}
            >
              今は中目標を表示しています
            </p>
            
            <button
              onClick={handleBackToMajor}
              className="flex items-center justify-center bg-white hover:bg-gray-50 rounded-full shadow-md transition-colors cursor-pointer"
              title="大目標に戻る"
              style={{
                width: '40px',
                height: '40px'
              }}
            >
              <ArrowLeft 
                className="text-primary" 
                style={{ 
                  transform: 'rotate(90deg)', 
                  width: '20px', 
                  height: '20px' 
                }} 
              />
            </button>
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
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8 relative">
          <div className="flex-1 space-y-4 md:space-y-6" style={{ maxWidth: '660px', width: '100%' }}>
            <div 
              className={`w-full transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{
                transitionDelay: '0ms'
              }}
            >
              <div 
                style={{
                  width: '100%',
                  maxWidth: '660px',
                  height: 'auto',
                  minHeight: 'clamp(64px, 12vw, 96px)',
                  borderRadius: 'clamp(12px, 3vw, 20px)',
                  background: '#FFFFFF',
                  boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'clamp(12px, 2.5vw, 16px)'
                }}
              >
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: 'clamp(14px, 3vw, 20px)',
                    lineHeight: 'clamp(22px, 4vw, 32px)',
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
              {minorChart.cells.map((cell, index) => {
                const isCellHovered = hoveredCellId === cell.id;
                const cellChanged = isMinorCellChanged(cell.id);
                const delay = (index + 1) * 80;

                return (
                  <div
                    key={cell.id}
                    className={`flex items-center transition-all duration-500 relative group ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    }`}
                    style={{
                      width: '100%',
                      maxWidth: '660px',
                      height: 'clamp(40px, 8vw, 48px)',
                      borderRadius: 'clamp(12px, 3vw, 20px)',
                      background: cellChanged ? 'rgba(19, 174, 103, 0.05)' : '#FFFFFF',
                      boxShadow: '0px 4px 12px 0px rgba(72, 82, 84, 0.1)',
                      padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
                      gap: 'clamp(8px, 2vw, 12px)',
                      transitionDelay: `${delay}ms`
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
                          fontSize: 'clamp(10px, 2vw, 14px)',
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
                      className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{
                        width: 'clamp(20px, 4vw, 24px)',
                        height: 'clamp(20px, 4vw, 24px)',
                        cursor: cell.title ? 'pointer' : 'not-allowed',
                        opacity: !cell.title ? 0.5 : 1
                      }}
                    >
                      {cell.isChecked ? (
                        <>
                          <div 
                            className="transition-all duration-300"
                            style={{
                              position: 'absolute',
                              width: 'clamp(20px, 4vw, 24px)',
                              height: 'clamp(20px, 4vw, 24px)',
                              background: '#13AE6773',
                              borderRadius: '50%',
                              opacity: 0.45
                            }}
                          />
                          <img 
                            src={heart_icon} 
                            alt="完了"
                            className="transition-all duration-300"
                            style={{
                              width: 'clamp(12px, 2.5vw, 14px)',
                              height: 'clamp(10px, 2vw, 12px)',
                              objectFit: 'contain',
                              position: 'relative',
                              zIndex: 1
                            }}
                          />
                        </>
                      ) : (
                        <div 
                          className="transition-all duration-300 hover:border-primary"
                          style={{
                            width: 'clamp(20px, 4vw, 24px)',
                            height: 'clamp(20px, 4vw, 24px)',
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
                          fontSize: 'clamp(12px, 2.5vw, 16px)',
                          lineHeight: 'clamp(20px, 4vw, 32px)',
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

                    {cellChanged && (               
                      <button
                        onClick={() => {
                          saveMinorCell(cell.id);
                        }}
                        className="flex-shrink-0 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-0.5"
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 600,
                          fontSize: 'clamp(10px, 2vw, 12px)',
                          color: '#FFFFFF',
                          background: '#13AE67',
                          padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
                          borderRadius: 'clamp(12px, 3vw, 20px)',
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
    
          <div 
            className="fixed top-[70px] right-4 lg:right-8 lg:top-[100px]"
            style={{ 
              zIndex: 20
            }}
          >
            <LevelIndicator />
          </div>

          <div 
            className="fixed top-[70px] right-[60px] lg:right-[84px] lg:top-[100px]"
            style={{ 
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <p 
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: 'clamp(10px, 2vw, 12px)',
                lineHeight: '100%',
                color: '#9CA3AF',
                whiteSpace: 'nowrap'
              }}
            >
              今は小目標を表示しています
            </p>
            
            <button
              onClick={handleBackToMiddle}
              className="flex items-center justify-center bg-white hover:bg-gray-50 rounded-full shadow-md transition-colors cursor-pointer"
              title="中目標に戻る"
              style={{
                width: '40px',
                height: '40px'
              }}
            >
              <ArrowLeft 
                className="text-primary" 
                style={{ 
                  transform: 'rotate(90deg)', 
                  width: '20px', 
                  height: '20px' 
                }} 
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <div 
        className="w-full max-w-6xl mx-auto"
        style={{
          paddingLeft: 'clamp(16px, 4vw, 32px)',
          paddingRight: 'clamp(16px, 4vw, 32px)',
          paddingTop: 'clamp(40px, 10vh, 60px)',
          paddingBottom: 'clamp(20px, 5vh, 40px)'
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