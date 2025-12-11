import React, { useEffect, useState } from "react";
import { Award, Heart, Sparkles, X } from "lucide-react";
import achieveBoy from "../assets/achieve_boy.png";
import achieveGirl from "../assets/achieve_girl.png";

interface AchievementPopupProps {
  isOpen: boolean;
  onClose: () => void;
  goalTitle: string;
  level: "major" | "middle" | "minor";
  message?: string;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  isOpen,
  onClose,
  level,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getLevelConfig = () => {
    switch (level) {
      case "major":
        return {
          title: "🎉 大目標達成！",
          color: "from-pink-500 to-rose-500",
          icon: <Award className="w-6 h-6 text-white" />,
          confettiColor: "bg-gradient-to-br from-pink-400 to-rose-400",
        };
      case "middle":
        return {
          title: "🌟 中目標達成！",
          color: "from-purple-500 to-indigo-500",
          icon: <Sparkles className="w-6 h-6 text-white" />,
          confettiColor: "bg-gradient-to-br from-purple-400 to-indigo-400",
        };
      case "minor":
        return {
          title: "💖 小目標達成！",
          color: "from-achieved to-pink-600",
          icon: <Heart className="w-6 h-6 text-white fill-current" />,
          confettiColor: "bg-gradient-to-br from-achieved to-pink-400",
        };
      default:
        return null;
    }
  };

  const baseConfig = {
    title: "",
    color: "from-pink-500 to-rose-500",
    icon: null as React.ReactNode,
    confettiColor: "bg-pink-400",
  };
  const _config = getLevelConfig();
  const config = { ...baseConfig, ...(_config || {}) };

  const petals = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 18 + Math.random() * 16,
    duration: 7 + Math.random() * 4,
    delay: Math.random() * -8,
  }));

  return (
    <>
      {/* オーバーレイ（中央寄せもここで） */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
        onClick={onClose}
      >
        {/* 紙吹雪 & 桜（背景レイヤー） */}
        {showConfetti && (
          <>
            {/* 紙吹雪（元の仕様イメージ） */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-3 h-3 ${config.confettiColor} rounded-full`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10px`,
                    animation: `fall ${2 + Math.random() * 2}s linear ${
                      Math.random() * 2
                    }s`,
                    opacity: Math.random(),
                  }}
                />
              ))}
            </div>

            {/* 桜ふぶき（全画面） */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
              {petals.map((p) => (
                <span
                  key={p.id}
                  className="sakura-petal"
                  style={{
                    left: `${p.left}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* ポップアップコンテンツ（前面レイヤー） */}
        <div
          className="
            bg-white rounded-card-xl shadow-2xl
            w-[min(92vw,900px)] max-w-3xl
            overflow-hidden
            animate-scaleIn
            relative z-20
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-30"
          >
            <X className="w-6 h-6" />
          </button>

          {/* ===== 上部：Congratulations! バナー ===== */}
          <div className="pt-10 pb-6 px-8 bg-white flex flex-col items-center">
            {/* レベルラベル */}
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${config.color}`}
            >
              {config.icon}
              <span>{config.title}</span>
            </span>

            {/* バナー本体 */}
            <div className="relative w-[480px] h-[260px] md:w-[600px] md:h-[300px] mx-auto">
              {/* 白背景＋青枠のカード */}
              <div className="absolute inset-0 rounded-[18px] border-[3px] border-sky-300 bg-white flex flex-col items-center justify-start pt-7 z-[5]">
                <p className="text-[26px] md:text-[30px] font-bold text-[#ff91a4] leading-none">
                  Congratulations!
                </p>
                <p className="mt-2 text-[11px] md:text-xs text-[#ff91a4]">
                  今日は宴にしよう！
                </p>
              </div>

              {/* 女子イラスト（左下） */}
              <img
                src={achieveGirl}
                alt="girl"
                className="
    absolute bottom-4 left-6
    w-[110px] md:w-[150px]
    animate-banner-girl
    pointer-events-none
    z-[10]
  "
                style={{ transform: "rotate(-6deg)" }}
              />

              {/* 男子イラスト（右下） */}
              <img
                src={achieveBoy}
                alt="boy"
                className="
    absolute bottom-3 right-6
    w-[140px] md:w-[180px]
    animate-banner-boy
    pointer-events-none
    z-[10]
  "
                style={{ transform: "rotate(8deg)" }}
              />
            </div>
          </div>
          {/* ===== バナーここまで ===== */}

          {/* コンテンツ部分 */}
          <div className="pt-4 pb-8 px-8 space-y-5">
            {/* ボタン */}
            <button
              onClick={onClose}
              className="w-full bg-primary text-white py-3 rounded-card font-bold text-body hover:bg-primary/90 transition-all shadow-subtle hover:shadow-card"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>

      {/* 紙吹雪・桜・バナー用アニメーション */}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes sakura-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotateZ(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
          }
          100% {
            transform: translate3d(-40px, 110vh, 0) rotateZ(360deg);
            opacity: 0;
          }
        }

        .sakura-petal {
          position: absolute;
          top: -10%;
          background: radial-gradient(circle at 30% 30%, #ffffff 0, #fecaca 40%, #fb7185 75%);
          border-radius: 999px;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
          opacity: 0.9;
          animation-name: sakura-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          pointer-events: none;
        }

        @keyframes banner-boy {
          0%, 100% {
            transform: translateY(0) rotate(8deg);
          }
          50% {
            transform: translateY(-6px) rotate(4deg);
          }
        }

        @keyframes banner-girl {
          0%, 100% {
            transform: translateY(0) rotate(-6deg);
          }
          50% {
            transform: translateY(4px) rotate(-2deg);
          }
        }

        .animate-banner-boy {
          animation: banner-boy 2.2s ease-in-out infinite;
        }

        .animate-banner-girl {
          animation: banner-girl 2.4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default AchievementPopup;
