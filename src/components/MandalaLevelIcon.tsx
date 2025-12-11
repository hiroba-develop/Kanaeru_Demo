// MandalaLevelIcon.tsx
import React from "react";

type Level = "major" | "middle" | "minor";

interface Props {
  level: Level;
  size?: number;
  className?: string;
}

const MandalaLevelIcon: React.FC<Props> = ({ level, size = 24, className }) => {
  const GREEN = "#13AE67";
  const BLACK = "#1E1F1F";

  const topColor = level === "major" ? GREEN : BLACK;
  const middleColor = level === "middle" ? GREEN : BLACK;
  const bottomColor = level === "minor" ? GREEN : BLACK;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
    >
      {/* 上のレイヤー */}
      <path
        d="M5 7L12 4L19 7L12 10L5 7Z"
        stroke={topColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 真ん中のレイヤー */}
      <path
        d="M5 11L12 8L19 11L12 14L5 11Z"
        stroke={middleColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 下のレイヤー */}
      <path
        d="M5 15L12 12L19 15L12 18L5 15Z"
        stroke={bottomColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MandalaLevelIcon;
