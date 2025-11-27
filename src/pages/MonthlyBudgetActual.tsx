// import React, { useState, useEffect, useCallback } from "react";
// import { Download, Save, Upload } from "lucide-react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import * as pdfjs from "pdfjs-dist";
// import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
// import { useAuth } from "../contexts/AuthContext";

// pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// interface PlItem {
//   line: string;
//   isDataRow: boolean;
// }

// // PDFから解析された財務データの型
// interface ConvertedFinancialData {
//   売上高: { [key: string]: string };
//   売上総損益金額: { [key: string]: string };
//   営業損益金額: { [key: string]: string };
// }

// interface Sale {
//   userId: string;
//   year: number;
//   month: number;
//   saleTarget: number;
//   saleResult: number;
// }

// interface Profit {
//   userId: string;
//   year: number;
//   month: number;
//   profitTarget: number;
//   profitResult: number;
// }

// interface OperatingProfit {
//   userId: string;
//   year: number;
//   month: number;
//   operatingProfitTarget: number;
//   operatingProfitResult: number;
// }

// interface MonthlyData {
//   id: number;
//   month: string;
//   target: number;
//   actual: number;
//   profit: number;
//   profitTarget: number;
//   operatingProfit: number;
//   operatingProfitTarget: number;
// }

// // デモ用のユーザー設定
// const demoUserSetup = {
//   fiscalYearStartMonth: 4, // 4月開始
//   fiscalYearStartYear: 2020,
// };

// // デモ用の売上データ（10年分）
// const demoSales: Sale[] = [
//   // 2020年度（2020年4月～2021年3月）
//   {
//     userId: "demo",
//     year: 2020,
//     month: 4,
//     saleTarget: 3000000,
//     saleResult: 2800000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 5,
//     saleTarget: 3200000,
//     saleResult: 3100000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 6,
//     saleTarget: 3500000,
//     saleResult: 3300000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 7,
//     saleTarget: 3800000,
//     saleResult: 3600000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 8,
//     saleTarget: 3600000,
//     saleResult: 3800000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 9,
//     saleTarget: 3300000,
//     saleResult: 3100000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 10,
//     saleTarget: 3400000,
//     saleResult: 3500000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 11,
//     saleTarget: 3700000,
//     saleResult: 3900000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 12,
//     saleTarget: 4200000,
//     saleResult: 4400000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 1,
//     saleTarget: 3900000,
//     saleResult: 3700000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 2,
//     saleTarget: 3500000,
//     saleResult: 3400000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 3,
//     saleTarget: 3600000,
//     saleResult: 3700000,
//   },

//   // 2021年度（2021年4月～2022年3月）
//   {
//     userId: "demo",
//     year: 2021,
//     month: 4,
//     saleTarget: 3500000,
//     saleResult: 3300000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 5,
//     saleTarget: 3700000,
//     saleResult: 3800000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 6,
//     saleTarget: 4000000,
//     saleResult: 3900000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 7,
//     saleTarget: 4300000,
//     saleResult: 4100000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 8,
//     saleTarget: 4100000,
//     saleResult: 4300000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 9,
//     saleTarget: 3800000,
//     saleResult: 3600000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 10,
//     saleTarget: 3900000,
//     saleResult: 4000000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 11,
//     saleTarget: 4200000,
//     saleResult: 4400000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 12,
//     saleTarget: 4700000,
//     saleResult: 4900000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 1,
//     saleTarget: 4400000,
//     saleResult: 4200000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 2,
//     saleTarget: 4000000,
//     saleResult: 3900000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 3,
//     saleTarget: 4100000,
//     saleResult: 4200000,
//   },

//   // 2022年度（2022年4月～2023年3月）
//   {
//     userId: "demo",
//     year: 2022,
//     month: 4,
//     saleTarget: 4000000,
//     saleResult: 3800000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 5,
//     saleTarget: 4200000,
//     saleResult: 4300000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 6,
//     saleTarget: 4500000,
//     saleResult: 4400000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 7,
//     saleTarget: 4800000,
//     saleResult: 4600000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 8,
//     saleTarget: 4600000,
//     saleResult: 4800000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 9,
//     saleTarget: 4300000,
//     saleResult: 4100000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 10,
//     saleTarget: 4400000,
//     saleResult: 4500000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 11,
//     saleTarget: 4700000,
//     saleResult: 4900000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 12,
//     saleTarget: 5200000,
//     saleResult: 5400000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 1,
//     saleTarget: 4900000,
//     saleResult: 4700000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 2,
//     saleTarget: 4500000,
//     saleResult: 4400000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 3,
//     saleTarget: 4600000,
//     saleResult: 4700000,
//   },

//   // 2023年度（2023年4月～2024年3月）
//   {
//     userId: "demo",
//     year: 2023,
//     month: 4,
//     saleTarget: 5000000,
//     saleResult: 4800000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 5,
//     saleTarget: 5200000,
//     saleResult: 5100000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 6,
//     saleTarget: 5500000,
//     saleResult: 5300000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 7,
//     saleTarget: 6000000,
//     saleResult: 5800000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 8,
//     saleTarget: 5800000,
//     saleResult: 6200000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 9,
//     saleTarget: 5300000,
//     saleResult: 5100000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 10,
//     saleTarget: 5600000,
//     saleResult: 5900000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 11,
//     saleTarget: 6200000,
//     saleResult: 6500000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 12,
//     saleTarget: 7000000,
//     saleResult: 7200000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 1,
//     saleTarget: 6500000,
//     saleResult: 6300000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 2,
//     saleTarget: 5800000,
//     saleResult: 5600000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 3,
//     saleTarget: 6000000,
//     saleResult: 6100000,
//   },

//   // 2024年度（2024年4月～2025年3月）
//   {
//     userId: "demo",
//     year: 2024,
//     month: 4,
//     saleTarget: 5500000,
//     saleResult: 5200000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 5,
//     saleTarget: 5800000,
//     saleResult: 5900000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 6,
//     saleTarget: 6200000,
//     saleResult: 6000000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 7,
//     saleTarget: 6500000,
//     saleResult: 6800000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 8,
//     saleTarget: 6000000,
//     saleResult: 6200000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 9,
//     saleTarget: 5700000,
//     saleResult: 5500000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 10,
//     saleTarget: 6100000,
//     saleResult: 6300000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 11,
//     saleTarget: 6800000,
//     saleResult: 7000000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 12,
//     saleTarget: 7500000,
//     saleResult: 7800000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 1,
//     saleTarget: 7000000,
//     saleResult: 6800000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 2,
//     saleTarget: 6200000,
//     saleResult: 6100000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 3,
//     saleTarget: 6500000,
//     saleResult: 6400000,
//   },

//   // 2025年度（2025年4月～2026年3月）
//   {
//     userId: "demo",
//     year: 2025,
//     month: 4,
//     saleTarget: 6000000,
//     saleResult: 5900000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 5,
//     saleTarget: 6300000,
//     saleResult: 6200000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 6,
//     saleTarget: 6700000,
//     saleResult: 6500000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 7,
//     saleTarget: 7000000,
//     saleResult: 6900000,
//   },
//   { userId: "demo", year: 2025, month: 8, saleTarget: 6500000, saleResult: 0 },
//   { userId: "demo", year: 2025, month: 9, saleTarget: 6200000, saleResult: 0 },
//   { userId: "demo", year: 2025, month: 10, saleTarget: 6600000, saleResult: 0 },
//   { userId: "demo", year: 2025, month: 11, saleTarget: 7300000, saleResult: 0 },
//   { userId: "demo", year: 2025, month: 12, saleTarget: 8000000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 1, saleTarget: 7500000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 2, saleTarget: 6800000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 3, saleTarget: 7000000, saleResult: 0 },

//   // 2026年度（2026年4月～2027年3月）
//   { userId: "demo", year: 2026, month: 4, saleTarget: 6500000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 5, saleTarget: 6800000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 6, saleTarget: 7200000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 7, saleTarget: 7500000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 8, saleTarget: 7000000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 9, saleTarget: 6700000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 10, saleTarget: 7100000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 11, saleTarget: 7800000, saleResult: 0 },
//   { userId: "demo", year: 2026, month: 12, saleTarget: 8500000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 1, saleTarget: 8000000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 2, saleTarget: 7300000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 3, saleTarget: 7500000, saleResult: 0 },

//   // 2027年度（2027年4月～2028年3月）
//   { userId: "demo", year: 2027, month: 4, saleTarget: 7000000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 5, saleTarget: 7300000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 6, saleTarget: 7700000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 7, saleTarget: 8000000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 8, saleTarget: 7500000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 9, saleTarget: 7200000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 10, saleTarget: 7600000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 11, saleTarget: 8300000, saleResult: 0 },
//   { userId: "demo", year: 2027, month: 12, saleTarget: 9000000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 1, saleTarget: 8500000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 2, saleTarget: 7800000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 3, saleTarget: 8000000, saleResult: 0 },

//   // 2028年度（2028年4月～2029年3月）
//   { userId: "demo", year: 2028, month: 4, saleTarget: 7500000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 5, saleTarget: 7800000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 6, saleTarget: 8200000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 7, saleTarget: 8500000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 8, saleTarget: 8000000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 9, saleTarget: 7700000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 10, saleTarget: 8100000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 11, saleTarget: 8800000, saleResult: 0 },
//   { userId: "demo", year: 2028, month: 12, saleTarget: 9500000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 1, saleTarget: 9000000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 2, saleTarget: 8300000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 3, saleTarget: 8500000, saleResult: 0 },

//   // 2029年度（2029年4月～2030年3月）
//   { userId: "demo", year: 2029, month: 4, saleTarget: 8000000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 5, saleTarget: 8300000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 6, saleTarget: 8700000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 7, saleTarget: 9000000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 8, saleTarget: 8500000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 9, saleTarget: 8200000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 10, saleTarget: 8600000, saleResult: 0 },
//   { userId: "demo", year: 2029, month: 11, saleTarget: 9300000, saleResult: 0 },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 12,
//     saleTarget: 10000000,
//     saleResult: 0,
//   },
//   { userId: "demo", year: 2030, month: 1, saleTarget: 9500000, saleResult: 0 },
//   { userId: "demo", year: 2030, month: 2, saleTarget: 8800000, saleResult: 0 },
//   { userId: "demo", year: 2030, month: 3, saleTarget: 9000000, saleResult: 0 },
// ];

// // デモ用の利益データ（10年分）
// const demoProfits: Profit[] = [
//   // 2020年度（2020年4月～2021年3月）
//   {
//     userId: "demo",
//     year: 2020,
//     month: 4,
//     profitTarget: 450000,
//     profitResult: 420000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 5,
//     profitTarget: 480000,
//     profitResult: 470000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 6,
//     profitTarget: 520000,
//     profitResult: 500000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 7,
//     profitTarget: 570000,
//     profitResult: 540000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 8,
//     profitTarget: 540000,
//     profitResult: 570000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 9,
//     profitTarget: 500000,
//     profitResult: 470000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 10,
//     profitTarget: 510000,
//     profitResult: 530000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 11,
//     profitTarget: 560000,
//     profitResult: 590000,
//   },
//   {
//     userId: "demo",
//     year: 2020,
//     month: 12,
//     profitTarget: 630000,
//     profitResult: 660000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 1,
//     profitTarget: 590000,
//     profitResult: 560000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 2,
//     profitTarget: 530000,
//     profitResult: 510000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 3,
//     profitTarget: 540000,
//     profitResult: 560000,
//   },

//   // 2021年度（2021年4月～2022年3月）
//   {
//     userId: "demo",
//     year: 2021,
//     month: 4,
//     profitTarget: 520000,
//     profitResult: 500000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 5,
//     profitTarget: 560000,
//     profitResult: 570000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 6,
//     profitTarget: 600000,
//     profitResult: 590000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 7,
//     profitTarget: 640000,
//     profitResult: 620000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 8,
//     profitTarget: 620000,
//     profitResult: 650000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 9,
//     profitTarget: 570000,
//     profitResult: 540000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 10,
//     profitTarget: 590000,
//     profitResult: 600000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 11,
//     profitTarget: 630000,
//     profitResult: 660000,
//   },
//   {
//     userId: "demo",
//     year: 2021,
//     month: 12,
//     profitTarget: 710000,
//     profitResult: 740000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 1,
//     profitTarget: 660000,
//     profitResult: 630000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 2,
//     profitTarget: 600000,
//     profitResult: 590000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 3,
//     profitTarget: 620000,
//     profitResult: 630000,
//   },

//   // 2022年度（2022年4月～2023年3月）
//   {
//     userId: "demo",
//     year: 2022,
//     month: 4,
//     profitTarget: 600000,
//     profitResult: 580000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 5,
//     profitTarget: 630000,
//     profitResult: 650000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 6,
//     profitTarget: 680000,
//     profitResult: 660000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 7,
//     profitTarget: 720000,
//     profitResult: 690000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 8,
//     profitTarget: 690000,
//     profitResult: 720000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 9,
//     profitTarget: 650000,
//     profitResult: 620000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 10,
//     profitTarget: 660000,
//     profitResult: 680000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 11,
//     profitTarget: 710000,
//     profitResult: 740000,
//   },
//   {
//     userId: "demo",
//     year: 2022,
//     month: 12,
//     profitTarget: 780000,
//     profitResult: 810000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 1,
//     profitTarget: 740000,
//     profitResult: 710000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 2,
//     profitTarget: 680000,
//     profitResult: 660000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 3,
//     profitTarget: 690000,
//     profitResult: 710000,
//   },

//   // 2023年度（2023年4月～2024年3月）
//   {
//     userId: "demo",
//     year: 2023,
//     month: 4,
//     profitTarget: 800000,
//     profitResult: 750000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 5,
//     profitTarget: 850000,
//     profitResult: 820000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 6,
//     profitTarget: 900000,
//     profitResult: 880000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 7,
//     profitTarget: 1000000,
//     profitResult: 950000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 8,
//     profitTarget: 950000,
//     profitResult: 1020000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 9,
//     profitTarget: 850000,
//     profitResult: 800000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 10,
//     profitTarget: 900000,
//     profitResult: 950000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 11,
//     profitTarget: 1050000,
//     profitResult: 1100000,
//   },
//   {
//     userId: "demo",
//     year: 2023,
//     month: 12,
//     profitTarget: 1200000,
//     profitResult: 1250000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 1,
//     profitTarget: 1100000,
//     profitResult: 1050000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 2,
//     profitTarget: 950000,
//     profitResult: 900000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 3,
//     profitTarget: 1000000,
//     profitResult: 1020000,
//   },

//   // 2024年度（2024年4月～2025年3月）
//   {
//     userId: "demo",
//     year: 2024,
//     month: 4,
//     profitTarget: 900000,
//     profitResult: 850000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 5,
//     profitTarget: 950000,
//     profitResult: 980000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 6,
//     profitTarget: 1020000,
//     profitResult: 1000000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 7,
//     profitTarget: 1100000,
//     profitResult: 1150000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 8,
//     profitTarget: 1000000,
//     profitResult: 1050000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 9,
//     profitTarget: 950000,
//     profitResult: 920000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 10,
//     profitTarget: 1020000,
//     profitResult: 1070000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 11,
//     profitTarget: 1150000,
//     profitResult: 1200000,
//   },
//   {
//     userId: "demo",
//     year: 2024,
//     month: 12,
//     profitTarget: 1300000,
//     profitResult: 1350000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 1,
//     profitTarget: 1200000,
//     profitResult: 1150000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 2,
//     profitTarget: 1050000,
//     profitResult: 1030000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 3,
//     profitTarget: 1100000,
//     profitResult: 1080000,
//   },

//   // 2025年度（2025年4月～2026年3月）
//   {
//     userId: "demo",
//     year: 2025,
//     month: 4,
//     profitTarget: 1000000,
//     profitResult: 980000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 5,
//     profitTarget: 1050000,
//     profitResult: 1030000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 6,
//     profitTarget: 1120000,
//     profitResult: 1100000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 7,
//     profitTarget: 1200000,
//     profitResult: 1180000,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 8,
//     profitTarget: 1100000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 9,
//     profitTarget: 1050000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 10,
//     profitTarget: 1120000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 11,
//     profitTarget: 1250000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2025,
//     month: 12,
//     profitTarget: 1400000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 1,
//     profitTarget: 1300000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 2,
//     profitTarget: 1150000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 3,
//     profitTarget: 1200000,
//     profitResult: 0,
//   },

//   // 2026年度（2026年4月～2027年3月）
//   {
//     userId: "demo",
//     year: 2026,
//     month: 4,
//     profitTarget: 1100000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 5,
//     profitTarget: 1150000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 6,
//     profitTarget: 1220000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 7,
//     profitTarget: 1300000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 8,
//     profitTarget: 1200000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 9,
//     profitTarget: 1150000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 10,
//     profitTarget: 1220000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 11,
//     profitTarget: 1350000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2026,
//     month: 12,
//     profitTarget: 1500000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 1,
//     profitTarget: 1400000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 2,
//     profitTarget: 1250000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 3,
//     profitTarget: 1300000,
//     profitResult: 0,
//   },

//   // 2027年度（2027年4月～2028年3月）
//   {
//     userId: "demo",
//     year: 2027,
//     month: 4,
//     profitTarget: 1200000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 5,
//     profitTarget: 1250000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 6,
//     profitTarget: 1320000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 7,
//     profitTarget: 1400000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 8,
//     profitTarget: 1300000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 9,
//     profitTarget: 1250000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 10,
//     profitTarget: 1320000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 11,
//     profitTarget: 1450000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2027,
//     month: 12,
//     profitTarget: 1600000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 1,
//     profitTarget: 1500000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 2,
//     profitTarget: 1350000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 3,
//     profitTarget: 1400000,
//     profitResult: 0,
//   },

//   // 2028年度（2028年4月～2029年3月）
//   {
//     userId: "demo",
//     year: 2028,
//     month: 4,
//     profitTarget: 1300000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 5,
//     profitTarget: 1350000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 6,
//     profitTarget: 1420000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 7,
//     profitTarget: 1500000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 8,
//     profitTarget: 1400000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 9,
//     profitTarget: 1350000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 10,
//     profitTarget: 1420000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 11,
//     profitTarget: 1550000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2028,
//     month: 12,
//     profitTarget: 1700000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 1,
//     profitTarget: 1600000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 2,
//     profitTarget: 1450000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 3,
//     profitTarget: 1500000,
//     profitResult: 0,
//   },

//   // 2029年度（2029年4月～2030年3月）
//   {
//     userId: "demo",
//     year: 2029,
//     month: 4,
//     profitTarget: 1400000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 5,
//     profitTarget: 1450000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 6,
//     profitTarget: 1520000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 7,
//     profitTarget: 1600000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 8,
//     profitTarget: 1500000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 9,
//     profitTarget: 1450000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 10,
//     profitTarget: 1520000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 11,
//     profitTarget: 1650000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2029,
//     month: 12,
//     profitTarget: 1800000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2030,
//     month: 1,
//     profitTarget: 1700000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2030,
//     month: 2,
//     profitTarget: 1550000,
//     profitResult: 0,
//   },
//   {
//     userId: "demo",
//     year: 2030,
//     month: 3,
//     profitTarget: 1600000,
//     profitResult: 0,
//   },
// ];

// // ユーザーIDに基づいてデモデータを変更するヘルパー
// const getDemoDataForUser = (userId: string | undefined) => {
//   if (!userId) {
//     return {
//       sales: [],
//       profits: [],
//       operatingProfits: [],
//     };
//   }

//   const multiplier =
//     userId === "user-A" ? 0.95 : userId === "user-B" ? 1.05 : 1;

//   const userSales = demoSales.map((s) => ({
//     ...s,
//     saleResult: Math.round(s.saleResult * multiplier),
//     saleTarget: Math.round(s.saleTarget * multiplier),
//   }));

//   const userProfits = demoProfits.map((p) => ({
//     ...p,
//     profitResult: Math.round(p.profitResult * multiplier),
//     profitTarget: Math.round(p.profitTarget * multiplier),
//   }));

//   const userOperatingProfits = userProfits.map((p) => ({
//     userId: p.userId,
//     year: p.year,
//     month: p.month,
//     operatingProfitTarget: Math.round(p.profitTarget * 0.8),
//     operatingProfitResult: Math.round(p.profitResult * 0.8),
//   }));

//   return {
//     sales: userSales,
//     profits: userProfits,
//     operatingProfits: userOperatingProfits,
//   };
// };

// const MonthlyBudgetActual: React.FC = () => {
//   const { selectedUser } = useAuth();
//   // デモデータを状態として管理
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [profits, setProfits] = useState<Profit[]>([]);
//   const [operatingProfits, setOperatingProfits] = useState<OperatingProfit[]>(
//     []
//   );
//   const [userSettings] = useState(demoUserSetup);

//   useEffect(() => {
//     if (selectedUser) {
//       const { sales, profits, operatingProfits } = getDemoDataForUser(
//         selectedUser.id
//       );
//       setSales(sales);
//       setProfits(profits);
//       setOperatingProfits(operatingProfits);
//     }
//   }, [selectedUser]);

//   // 事業年度開始年月（デモデータから取得）
//   const fiscalYearStart = userSettings.fiscalYearStartMonth;
//   const fiscalYearStartYear = userSettings.fiscalYearStartYear;

//   // 現在の事業年度を計算
//   const currentDate = new Date();
//   const currentCalendarYear = currentDate.getFullYear();
//   const currentMonth = currentDate.getMonth() + 1;
//   const currentFiscalYear =
//     currentMonth >= fiscalYearStart
//       ? currentCalendarYear
//       : currentCalendarYear - 1;

//   // グラフ用の年と期間を別に管理
//   const [graphYear, setGraphYear] = useState(currentFiscalYear);
//   const [viewPeriod, setViewPeriod] = useState<"12" | "6H1" | "6H2">("12");

//   const [activeChart, setActiveChart] = useState<
//     "revenue" | "profit" | "operatingProfit"
//   >("revenue");
//   const [editingCell, setEditingCell] = useState<string | null>(null);

//   // 詳細比較表用の独立した状態
//   const [tableYear, setTableYear] = useState(currentFiscalYear);
//   const [tableViewPeriod, setTableViewPeriod] = useState<"6H1" | "6H2">("6H1");

//   const [pendingEdits, setPendingEdits] = useState<{ [key: string]: number }>(
//     {}
//   );

//   type EditableField =
//     | "target"
//     | "actual"
//     | "profitTarget"
//     | "profit"
//     | "operatingProfitTarget"
//     | "operatingProfit";

//   // 月次データを動的に生成する関数（デモデータベース）
//   const generateMonthlyDataFromDemo = useCallback(
//     (year: number) => {
//       const months = [];
//       const monthNames = [
//         "1月",
//         "2月",
//         "3月",
//         "4月",
//         "5月",
//         "6月",
//         "7月",
//         "8月",
//         "9月",
//         "10月",
//         "11月",
//         "12月",
//       ];

//       for (let i = 0; i < 12; i++) {
//         const monthIndex = (fiscalYearStart - 1 + i) % 12;
//         const month = monthIndex + 1;

//         // 事業年度を考慮した実際の年を計算
//         // 事業年度開始月より前の月は翌年になる
//         let actualYear = year;
//         if (month < fiscalYearStart) {
//           actualYear = year + 1;
//         }

//         // 該当年月の売上データを取得
//         const saleData = sales.find(
//           (sale) => sale.year === actualYear && sale.month === month
//         );
//         // 該当年月の利益データを取得
//         const profitData = profits.find(
//           (profit) => profit.year === actualYear && profit.month === month
//         );
//         // 該当年月の営業利益データを取得
//         const operatingProfitData = operatingProfits.find(
//           (op) => op.year === actualYear && op.month === month
//         );

//         months.push({
//           id: i,
//           month: monthNames[monthIndex],
//           target: saleData?.saleTarget || 0,
//           actual: saleData?.saleResult || 0,
//           profit: profitData?.profitResult || 0,
//           profitTarget: profitData?.profitTarget || 0,
//           operatingProfit: operatingProfitData?.operatingProfitResult || 0,
//           operatingProfitTarget:
//             operatingProfitData?.operatingProfitTarget || 0,
//         });
//       }
//       return months;
//     },
//     [fiscalYearStart, sales, profits, operatingProfits]
//   );

//   // 事業年度表示用の関数
//   const getFiscalYearDisplay = useCallback(
//     (year: number) => {
//       const yearOffset = year - fiscalYearStartYear;
//       const startYear = fiscalYearStartYear + yearOffset;
//       const endYear = fiscalYearStart === 1 ? startYear : startYear + 1;
//       const endMonth = fiscalYearStart === 1 ? 12 : fiscalYearStart - 1;

//       if (fiscalYearStart === 1) {
//         return `${year}年度（${startYear}年1月～${startYear}年12月）`;
//       } else {
//         return `${year}年度（${startYear}年${fiscalYearStart}月～${endYear}年${endMonth}月）`;
//       }
//     },
//     [fiscalYearStart, fiscalYearStartYear]
//   );

//   // 年度選択肢を生成（事業年度開始年から10年分）
//   const generateYearOptions = useCallback(() => {
//     const years = [];
//     for (let i = 0; i < 10; i++) {
//       years.push(fiscalYearStartYear + i);
//     }
//     return years;
//   }, [fiscalYearStartYear]);

//   // 詳細比較表用のデータも年度変更時に更新
//   const [tableData, setTableData] = useState<MonthlyData[]>([]);

//   useEffect(() => {
//     setTableData(generateMonthlyDataFromDemo(tableYear));
//   }, [
//     generateMonthlyDataFromDemo,
//     tableYear,
//     sales,
//     profits,
//     operatingProfits,
//   ]);

//   // 表示期間に応じてデータをフィルタリング（グラフ用）
//   const getDisplayData = () => {
//     // graphYearを使用
//     const graphData = generateMonthlyDataFromDemo(graphYear);

//     switch (viewPeriod) {
//       case "12":
//         return graphData.slice(0, 12);
//       case "6H1":
//         return graphData.slice(0, 6);
//       case "6H2":
//         return graphData.slice(6, 12);
//       default:
//         return graphData.slice(0, 12);
//     }
//   };

//   // 詳細比較表用のデータフィルタリング
//   const getTableDisplayData = () => {
//     if (tableViewPeriod === "6H1") {
//       return tableData.slice(0, 6);
//     } else {
//       return tableData.slice(6, 12);
//     }
//   };

//   // セルの値を更新
//   const handleCellUpdate = (
//     id: number,
//     field: EditableField,
//     value: number
//   ) => {
//     const key = `${tableYear}-${id}-${field}`;
//     setPendingEdits((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//     setEditingCell(null);
//   };

//   // セルのダブルクリック処理
//   const handleCellDoubleClick = (id: number, field: EditableField) => {
//     const key = `${tableYear}-${id}-${field}`;
//     setEditingCell(key);
//   };

//   // 編集された目標データの保存（デモ版）
//   const handleTableSave = () => {
//     const newSales = [...sales];
//     const newProfits = [...profits];
//     const newOperatingProfits = [...operatingProfits];

//     Object.entries(pendingEdits).forEach(([itemKey, value]) => {
//       const [yearStr, idStr, field] = itemKey.split("-");
//       const year = parseInt(yearStr, 10);
//       const id = parseInt(idStr, 10);

//       // 月のインデックスから実際の月を計算
//       const monthIndex = (fiscalYearStart - 1 + id) % 12;
//       const month = monthIndex + 1;

//       // 事業年度を考慮した実際の年を計算
//       let actualYear = year;
//       if (month < fiscalYearStart) {
//         actualYear = year + 1;
//       }

//       if (field === "target") {
//         // 売上目標の更新
//         const existingIndex = newSales.findIndex(
//           (s) => s.year === actualYear && s.month === month
//         );
//         if (existingIndex >= 0) {
//           newSales[existingIndex].saleTarget = value;
//         } else {
//           newSales.push({
//             userId: "demo",
//             year: actualYear,
//             month,
//             saleTarget: value,
//             saleResult: 0,
//           });
//         }
//       } else if (field === "actual") {
//         // 売上実績の更新
//         const existingIndex = newSales.findIndex(
//           (s) => s.year === actualYear && s.month === month
//         );
//         if (existingIndex >= 0) {
//           newSales[existingIndex].saleResult = value;
//         } else {
//           newSales.push({
//             userId: "demo",
//             year: actualYear,
//             month,
//             saleTarget: 0,
//             saleResult: value,
//           });
//         }
//       } else if (field === "profitTarget") {
//         // 利益目標の更新
//         const existingIndex = newProfits.findIndex(
//           (p) => p.year === actualYear && p.month === month
//         );
//         if (existingIndex >= 0) {
//           newProfits[existingIndex].profitTarget = value;
//         } else {
//           newProfits.push({
//             userId: "demo",
//             year: actualYear,
//             month,
//             profitTarget: value,
//             profitResult: 0,
//           });
//         }
//       } else if (field === "profit") {
//         // 利益実績の更新
//         const existingIndex = newProfits.findIndex(
//           (p) => p.year === actualYear && p.month === month
//         );
//         if (existingIndex >= 0) {
//           newProfits[existingIndex].profitResult = value;
//         } else {
//           newProfits.push({
//             userId: "demo",
//             year: actualYear,
//             month,
//             profitTarget: 0,
//             profitResult: value,
//           });
//         }
//       } else if (field === "operatingProfitTarget") {
//         // 営業利益目標の更新
//         const existingIndex = newOperatingProfits.findIndex(
//           (op) => op.year === actualYear && op.month === month
//         );
//         if (existingIndex >= 0) {
//           newOperatingProfits[existingIndex].operatingProfitTarget = value;
//         } else {
//           newOperatingProfits.push({
//             userId: "demo",
//             year: actualYear,
//             month,
//             operatingProfitTarget: value,
//             operatingProfitResult: 0,
//           });
//         }
//       } else if (field === "operatingProfit") {
//         // 営業利益実績の更新
//         const existingIndex = newOperatingProfits.findIndex(
//           (op) => op.year === actualYear && op.month === month
//         );
//         if (existingIndex >= 0) {
//           newOperatingProfits[existingIndex].operatingProfitResult = value;
//         } else {
//           newOperatingProfits.push({
//             userId: "demo",
//             year: actualYear,
//             month,
//             operatingProfitTarget: 0,
//             operatingProfitResult: value,
//           });
//         }
//       }
//     });

//     setSales(newSales);
//     setProfits(newProfits);
//     setOperatingProfits(newOperatingProfits);

//     // 編集状態をリセット
//     setPendingEdits({});
//     alert("データを保存しました。（デモ版）");
//   };

//   const detailedTableData = [
//     {
//       label: "売上",
//       targetField: "target",
//       actualField: "actual",
//     },
//     {
//       label: "粗利益",
//       targetField: "profitTarget",
//       actualField: "profit",
//     },
//     {
//       label: "営業利益",
//       targetField: "operatingProfitTarget",
//       actualField: "operatingProfit",
//     },
//   ];

//   const renderEditableCell = (data: MonthlyData, field: EditableField) => {
//     const key = `${tableYear}-${data.id}-${field}`;
//     const hasPendingEdit = key in pendingEdits;
//     const displayValue = hasPendingEdit
//       ? pendingEdits[key]
//       : (data[field as keyof MonthlyData] as number);

//     return (
//       <td
//         key={`${data.id}-${field}`}
//         className={`py-2 sm:py-3 px-1 sm:px-2 text-right cursor-pointer hover:bg-blue-50 transition-colors ${
//           hasPendingEdit ? "bg-yellow-100" : ""
//         }`}
//         onDoubleClick={() => handleCellDoubleClick(data.id, field)}
//         title="ダブルクリックで編集"
//       >
//         {editingCell === key ? (
//           <input
//             type="number"
//             defaultValue={displayValue}
//             onBlur={(e) =>
//               handleCellUpdate(data.id, field, Number(e.target.value))
//             }
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 handleCellUpdate(data.id, field, Number(e.currentTarget.value));
//               } else if (e.key === "Escape") {
//                 setEditingCell(null);
//               }
//             }}
//             className="w-full text-right border border-primary rounded px-1 focus:outline-none focus:ring-1 focus:ring-primary"
//             autoFocus
//           />
//         ) : (
//           displayValue.toLocaleString()
//         )}
//       </td>
//     );
//   };

//   const renderRateCellForTable = (
//     data: MonthlyData,
//     targetField: EditableField,
//     actualField: EditableField
//   ) => {
//     const targetKey = `${tableYear}-${data.id}-${targetField}`;
//     const actualKey = `${tableYear}-${data.id}-${actualField}`;

//     const target =
//       targetKey in pendingEdits
//         ? pendingEdits[targetKey]
//         : (data[targetField as keyof MonthlyData] as number);
//     const actual =
//       actualKey in pendingEdits
//         ? pendingEdits[actualKey]
//         : (data[actualField as keyof MonthlyData] as number);

//     const rate = target > 0 ? (actual / target) * 100 : 0;
//     return (
//       <td
//         key={`${data.id}-rate`}
//         className={`py-2 sm:py-3 px-1 sm:px-2 text-right font-medium ${
//           rate >= 100
//             ? "text-success"
//             : rate >= 90
//             ? "text-warning"
//             : "text-error"
//         }`}
//       >
//         {actual > 0 ? `${rate.toFixed(1)}%` : "-"}
//       </td>
//     );
//   };

//   // CSV出力機能
//   const handleDataExport = () => {
//     try {
//       // 10年分のデータを生成
//       interface ExportData {
//         年: number;
//         月: number;
//         売上目標: number;
//         売上実績: number;
//         売上達成率: string;
//         利益目標: number;
//         利益実績: number;
//         利益達成率: string;
//       }

//       const allYearsData: ExportData[] = [];
//       const yearOptions = generateYearOptions();

//       yearOptions.forEach((year) => {
//         const yearData = generateMonthlyDataFromDemo(year);
//         yearData.forEach((monthData) => {
//           // 月のインデックスから実際の月を計算
//           const monthIndex = (fiscalYearStart - 1 + monthData.id) % 12;
//           const month = monthIndex + 1;

//           // 事業年度を考慮した実際の年を計算
//           let actualYear = year;
//           if (month < fiscalYearStart) {
//             actualYear = year + 1;
//           }

//           // 達成率を計算
//           const revenueRate =
//             monthData.target > 0
//               ? ((monthData.actual / monthData.target) * 100).toFixed(1)
//               : "0.0";
//           const profitRate =
//             monthData.profitTarget > 0
//               ? ((monthData.profit / monthData.profitTarget) * 100).toFixed(1)
//               : "0.0";

//           allYearsData.push({
//             年: actualYear,
//             月: month,
//             売上目標: monthData.target,
//             売上実績: monthData.actual,
//             売上達成率: `${revenueRate}%`,
//             利益目標: monthData.profitTarget,
//             利益実績: monthData.profit,
//             利益達成率: `${profitRate}%`,
//           });
//         });
//       });

//       // CSVヘッダー
//       const headers = [
//         "年",
//         "月",
//         "売上目標",
//         "売上実績",
//         "売上達成率",
//         "利益目標",
//         "利益実績",
//         "利益達成率",
//       ];

//       // CSVデータを作成
//       const csvContent = [
//         headers.join(","),
//         ...allYearsData.map((row) =>
//           [
//             row.年,
//             row.月,
//             row.売上目標,
//             row.売上実績,
//             row.売上達成率,
//             row.利益目標,
//             row.利益実績,
//             row.利益達成率,
//           ].join(",")
//         ),
//       ].join("\n");

//       // BOMを追加してUTF-8で保存（Excelで正しく表示されるように）
//       const bom = "\uFEFF";
//       const blob = new Blob([bom + csvContent], {
//         type: "text/csv;charset=utf-8;",
//       });

//       // ダウンロード処理
//       const link = document.createElement("a");
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute(
//         "download",
//         `予実管理データ_${new Date().toISOString().split("T")[0]}.csv`
//       );
//       link.style.visibility = "hidden";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("データ出力に失敗しました:", error);
//       alert("データ出力中にエラーが発生しました。");
//     }
//   };

//   // lineのデータが数値かどうかを判定する
//   const isNumeric = (str: string): boolean => {
//     if (typeof str !== "string" || str.trim() === "") {
//       return false;
//     }
//     // カンマを除去し、括弧で囲まれた負の数に対応
//     let cleanStr = str.trim().replace(/,/g, "");
//     if (cleanStr.startsWith("(") && cleanStr.endsWith(")")) {
//       cleanStr = "-" + cleanStr.slice(1, -1);
//     }
//     // ハイフンや空文字列自体は数値としない
//     if (cleanStr === "-" || cleanStr === "") {
//       return false;
//     }
//     // 数値であり、かつ有限数であるか
//     return !isNaN(Number(cleanStr)) && isFinite(Number(cleanStr));
//   };

//   // 損益計算書データを解析する関数
//   const parsePLData = (text: string): PlItem[] => {
//     const lines = text.split("\n").filter((line) => line.trim() !== "");
//     const data: PlItem[] = [];

//     for (const line of lines) {
//       // 2つ以上の半角スペースを区切り文字として、行を分割する
//       const parts = line.split(/\s{2,}/);

//       for (const part of parts) {
//         const trimmedPart = part.trim();
//         // 空の文字列は無視
//         if (trimmedPart) {
//           if (trimmedPart.includes("年度")) {
//             console.log("年度", trimmedPart);
//           }
//           if (trimmedPart == "売上高") {
//             console.log("売上高", trimmedPart);
//           }
//           data.push({
//             line: trimmedPart,
//             isDataRow: isNumeric(trimmedPart),
//           });
//         }
//       }
//     }
//     return data;
//   };

//   // 損益計算書PDFの読み込み
//   const handlePLUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) {
//       return;
//     }

//     if (file.type !== "application/pdf") {
//       console.error("エラー: 選択されたファイルはPDFではありません。");
//       alert("PDFファイルのみ選択できます。");
//       return;
//     }

//     /**
//      * 解析後データから財務データを抽出して変換する
//      * @param inputData 解析後データの配列
//      * @returns 変換後の財務データ
//      */
//     function convertFinancialData(inputData: PlItem[]): ConvertedFinancialData {
//       // 出力データの初期化
//       const output: ConvertedFinancialData = {
//         売上高: {},
//         売上総損益金額: {},
//         営業損益金額: {},
//       };

//       // 年度情報と月度情報を格納する変数
//       let fiscalYear = "";
//       let fiscalStartMonth = 0;
//       const monthColumns: string[] = [];

//       // Step 1: 年度情報を探す
//       // "YYYY年度（YYYY/MM/DD ～ YYYY/MM/DD）" のパターンを探す
//       for (const item of inputData) {
//         const yearMatch = item.line.match(
//           /(\d{4})年度（\d{4}\/(\d{2})\/\d{2} ～ \d{4}\/\d{2}\/\d{2}）/
//         );
//         if (yearMatch) {
//           fiscalYear = yearMatch[1];
//           fiscalStartMonth = parseInt(yearMatch[2], 10);
//           console.log(
//             `年度情報を検出: ${fiscalYear}年度, 開始月: ${fiscalStartMonth}月`
//           );
//           break;
//         }
//       }

//       if (!fiscalYear) {
//         console.warn("年度情報がPDFから読み取れませんでした。");
//         return output;
//       }

//       // Step 2: 月度のヘッダー行を探す
//       // "勘定科目／補助科目" の次の行から月度情報を取得
//       for (let i = 0; i < inputData.length; i++) {
//         if (inputData[i].line === "勘定科目／補助科目") {
//           // 次の行から月度情報を収集（"期間残高"が出てくるまで）
//           let j = i + 1;
//           while (j < inputData.length && inputData[j].line !== "期間残高") {
//             const monthMatch = inputData[j].line.match(/(\d+)月度/);
//             if (monthMatch) {
//               monthColumns.push(monthMatch[1]);
//             }
//             j++;
//           }

//           if (monthColumns.length > 0) {
//             console.log(`月度情報を検出: ${monthColumns.join(", ")}月`);
//             break;
//           }
//         }
//       }

//       // Step 3: 各指標のデータを抽出
//       const targetIndicators = [
//         { key: "売上高", pattern: /^売上高$/ },
//         { key: "売上総損益金額", pattern: /^Σ 売上総損益金額$/ },
//         { key: "営業損益金額", pattern: /^Σ 営業損益金額$/ },
//       ];

//       for (const indicator of targetIndicators) {
//         // 指標名の行を探す
//         for (let i = 0; i < inputData.length; i++) {
//           if (indicator.pattern.test(inputData[i].line)) {
//             console.log(`${indicator.key}を検出: 行${i}`);

//             // 次の行から数値データを取得
//             let dataStartIndex = i + 1;

//             // 数値データの行を探す（isDataRow: trueの行）
//             while (
//               dataStartIndex < inputData.length &&
//               !inputData[dataStartIndex].isDataRow
//             ) {
//               dataStartIndex++;
//             }

//             // 月数分のデータを取得
//             for (let j = 0; j < monthColumns.length; j++) {
//               if (
//                 dataStartIndex + j < inputData.length &&
//                 inputData[dataStartIndex + j].isDataRow
//               ) {
//                 const monthStr = monthColumns[j];
//                 const month = parseInt(monthStr, 10);
//                 const value = inputData[dataStartIndex + j].line;

//                 // 年度開始月より月が小さい場合は、年を+1する
//                 const actualYear =
//                   month < fiscalStartMonth
//                     ? parseInt(fiscalYear, 10) + 1
//                     : parseInt(fiscalYear, 10);
//                 const key = `${actualYear}年${month}月`;

//                 output[indicator.key as keyof ConvertedFinancialData][key] =
//                   value;
//                 console.log(`  ${key}: ${value}`);
//               }
//             }

//             break; // この指標の処理は完了
//           }
//         }
//       }

//       return output;
//     }

//     // PDFファイル処理のメインコード
//     try {
//       const reader = new FileReader();
//       reader.onload = async (e) => {
//         if (e.target?.result) {
//           const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
//           const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
//           let fullText = "";
//           for (let i = 1; i <= pdf.numPages; i++) {
//             const page = await pdf.getPage(i);
//             const textContent = await page.getTextContent();
//             const pageText = textContent.items
//               .map((item: any) => ("str" in item ? item.str : ""))
//               .join(" ");
//             fullText += pageText + "\n";
//           }

//           console.log("PDFから抽出したテキスト:", fullText);

//           // 既存の解析処理
//           const parsedData = parsePLData(fullText);
//           console.log("解析後のデータ:", parsedData);

//           try {
//             // 解析後データを財務データ形式に変換
//             const convertedData = convertFinancialData(parsedData);
//             console.log("変換後の財務データ:", convertedData);
//           } catch (conversionError) {
//             console.error("財務データの変換に失敗しました:", conversionError);
//           }
//         }
//       };
//       reader.readAsArrayBuffer(file);
//     } catch (error) {
//       console.error("PDFファイルの解析に失敗しました:", error);
//       alert("PDFファイルの解析に失敗しました。");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <h1 className="text-2xl sm:text-3xl font-bold text-text">
//           予実管理(月次)
//         </h1>
//         <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//           <label className="btn-secondary flex items-center justify-center space-x-2 text-sm cursor-pointer">
//             <Upload className="h-4 w-4" />
//             <span className="hidden sm:inline">損益計算書 読み込み</span>
//             <input
//               type="file"
//               accept=".pdf"
//               className="hidden"
//               onChange={handlePLUpload}
//             />
//           </label>
//           <button
//             onClick={handleDataExport}
//             className="btn-secondary flex items-center justify-center space-x-2 text-sm"
//           >
//             <Download className="h-4 w-4" />
//             <span className="hidden sm:inline">データ出力</span>
//           </button>
//         </div>
//       </div>

//       {/* 予実比較グラフ */}
//       <div className="card">
//         {/* グラフ切り替えボタンと年度・期間選択を2列表示 */}
//         <div className="space-y-3 mb-4">
//           {/* 1行目：グラフ切り替えボタン */}
//           <div className="grid grid-cols-3 gap-2">
//             <button
//               onClick={() => setActiveChart("revenue")}
//               className={`px-4 py-2 rounded transition-colors ${
//                 activeChart === "revenue"
//                   ? "bg-primary text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               月次売上推移
//             </button>
//             <button
//               onClick={() => setActiveChart("profit")}
//               className={`px-4 py-2 rounded transition-colors ${
//                 activeChart === "profit"
//                   ? "bg-primary text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               月次粗利益推移
//             </button>
//             <button
//               onClick={() => setActiveChart("operatingProfit")}
//               className={`px-4 py-2 rounded transition-colors ${
//                 activeChart === "operatingProfit"
//                   ? "bg-primary text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               月次営業利益推移
//             </button>
//           </div>

//           {/* 2行目：年度と期間選択 */}
//           <div className="grid grid-cols-2 gap-2">
//             <select
//               value={graphYear}
//               onChange={(e) => setGraphYear(Number(e.target.value))}
//               className="text-sm border border-border rounded px-2 py-1 pr-8 appearance-none bg-white"
//               style={{
//                 backgroundImage:
//                   'url(\'data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>\')',
//                 backgroundRepeat: "no-repeat",
//                 backgroundPosition: "calc(100% - 4px) center",
//                 backgroundSize: "16px",
//               }}
//             >
//               {generateYearOptions().map((year) => (
//                 <option key={year} value={year}>
//                   {getFiscalYearDisplay(year)}
//                 </option>
//               ))}
//             </select>
//             <select
//               value={viewPeriod}
//               onChange={(e) =>
//                 setViewPeriod(e.target.value as "12" | "6H1" | "6H2")
//               }
//               className="text-sm border border-border rounded px-2 py-1 pr-8 appearance-none bg-white"
//               style={{
//                 backgroundImage:
//                   'url(\'data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>\')',
//                 backgroundRepeat: "no-repeat",
//                 backgroundPosition: "calc(100% - 4px) center",
//                 backgroundSize: "16px",
//               }}
//             >
//               <option value="12">12ヶ月</option>
//               <option value="6H1">上半期</option>
//               <option value="6H2">下半期</option>
//             </select>
//           </div>
//         </div>

//         {/* 売上実績推移グラフ */}
//         {activeChart === "revenue" && (
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={getDisplayData()}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
//               <XAxis dataKey="month" stroke="#333333" />
//               <YAxis
//                 stroke="#333333"
//                 tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
//               />
//               <Tooltip
//                 formatter={(value: number, name: string) => [
//                   `${value.toLocaleString()}円`,
//                   name === "target"
//                     ? "目標"
//                     : name === "actual"
//                     ? "実績"
//                     : name,
//                 ]}
//                 labelStyle={{ color: "#333333" }}
//               />
//               <Legend />
//               <Bar dataKey="target" fill="#B3DBC0" name="目標" />
//               <Bar dataKey="actual" fill="#67BACA" name="実績" />
//             </BarChart>
//           </ResponsiveContainer>
//         )}

//         {/* 月次利益推移グラフ */}
//         {activeChart === "profit" && (
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={getDisplayData()}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
//               <XAxis dataKey="month" stroke="#333333" />
//               <YAxis
//                 stroke="#333333"
//                 tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
//               />
//               <Tooltip
//                 formatter={(value: number, name: string) => [
//                   `${value.toLocaleString()}円`,
//                   name === "profitTarget"
//                     ? "目標"
//                     : name === "profit"
//                     ? "実績"
//                     : name,
//                 ]}
//                 labelStyle={{ color: "#333333" }}
//               />
//               <Legend />
//               <Bar dataKey="profitTarget" fill="#B3DBC0" name="目標" />
//               <Bar dataKey="profit" fill="#67BACA" name="実績" />
//             </BarChart>
//           </ResponsiveContainer>
//         )}

//         {/* 月次営業利益推移グラフ */}
//         {activeChart === "operatingProfit" && (
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={getDisplayData()}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
//               <XAxis dataKey="month" stroke="#333333" />
//               <YAxis
//                 stroke="#333333"
//                 tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
//               />
//               <Tooltip
//                 formatter={(value: number, name: string) => [
//                   `${value.toLocaleString()}円`,
//                   name === "operatingProfitTarget"
//                     ? "目標"
//                     : name === "operatingProfit"
//                     ? "実績"
//                     : name,
//                 ]}
//                 labelStyle={{ color: "#333333" }}
//               />
//               <Legend />
//               <Bar dataKey="operatingProfitTarget" fill="#B3DBC0" name="目標" />
//               <Bar dataKey="operatingProfit" fill="#67BACA" name="実績" />
//             </BarChart>
//           </ResponsiveContainer>
//         )}
//       </div>

//       {/* 詳細比較表 */}
//       <div className="card">
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
//           <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
//             <h3 className="text-base sm:text-lg font-semibold text-text">
//               詳細比較表
//             </h3>
//             <div className="text-xs sm:text-sm text-text/70">
//               💡 各種目標・実績はダブルクリックで編集できます
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-2">
//             <select
//               value={tableYear}
//               onChange={(e) => setTableYear(Number(e.target.value))}
//               className="text-sm border border-border rounded px-2 py-1 pr-8 appearance-none bg-white"
//               style={{
//                 backgroundImage:
//                   'url(\'data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>\')',
//                 backgroundRepeat: "no-repeat",
//                 backgroundPosition: "calc(100% - 4px) center",
//                 backgroundSize: "16px",
//               }}
//             >
//               {generateYearOptions().map((year) => (
//                 <option key={year} value={year}>
//                   {getFiscalYearDisplay(year)}
//                 </option>
//               ))}
//             </select>
//             <select
//               value={tableViewPeriod}
//               onChange={(e) =>
//                 setTableViewPeriod(e.target.value as "6H1" | "6H2")
//               }
//               className="text-sm border border-border rounded px-2 py-1 pr-8 appearance-none bg-white"
//               style={{
//                 backgroundImage:
//                   'url(\'data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>\')',
//                 backgroundRepeat: "no-repeat",
//                 backgroundPosition: "calc(100% - 4px) center",
//                 backgroundSize: "16px",
//               }}
//             >
//               <option value="6H1">上半期</option>
//               <option value="6H2">下半期</option>
//             </select>
//           </div>
//         </div>
//         {Object.keys(pendingEdits).length > 0 && (
//           <div className="mt-4 text-center">
//             <button
//               onClick={handleTableSave}
//               className="btn-primary flex items-center space-x-2 text-sm px-4 py-2"
//             >
//               <Save className="h-4 w-4" />
//               <span>変更を保存</span>
//             </button>
//           </div>
//         )}
//         <div className="overflow-x-auto">
//           <table className="w-full text-xs sm:text-sm">
//             <thead>
//               <tr className="border-b border-border">
//                 <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-medium w-24"></th>
//                 <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-medium">
//                   項目
//                 </th>
//                 {getTableDisplayData().map((data) => (
//                   <th
//                     key={data.id}
//                     className="text-right py-2 sm:py-3 px-1 sm:px-2 whitespace-nowrap"
//                   >
//                     {data.month}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {detailedTableData.map((item) => (
//                 <React.Fragment key={item.label}>
//                   <tr className="border-b border-border/50">
//                     <td
//                       rowSpan={3}
//                       className="py-2 sm:py-3 px-1 sm:px-2 font-medium whitespace-nowrap text-left align-middle border-r"
//                     >
//                       {item.label}
//                     </td>
//                     <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium whitespace-nowrap text-left">
//                       目標
//                     </td>
//                     {getTableDisplayData().map((data) =>
//                       renderEditableCell(
//                         data,
//                         item.targetField as EditableField
//                       )
//                     )}
//                   </tr>
//                   <tr className="border-b border-border/50">
//                     <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium whitespace-nowrap text-left">
//                       実績
//                     </td>
//                     {getTableDisplayData().map((data) =>
//                       renderEditableCell(
//                         data,
//                         item.actualField as EditableField
//                       )
//                     )}
//                   </tr>
//                   <tr className="border-b-2 border-border/80">
//                     <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium whitespace-nowrap text-left">
//                       達成率
//                     </td>
//                     {getTableDisplayData().map((data) =>
//                       renderRateCellForTable(
//                         data,
//                         item.targetField as EditableField,
//                         item.actualField as EditableField
//                       )
//                     )}
//                   </tr>
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MonthlyBudgetActual;
