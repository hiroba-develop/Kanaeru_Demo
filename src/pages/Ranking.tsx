// import React, { useState } from "react";
// import {
//   Trophy,
//   Medal,
//   Crown,
//   TrendingUp,
//   Target,
//   Users,
//   Award,
//   Star,
//   Filter,
//   Eye,
//   EyeOff,
// } from "lucide-react";
// import type { CompanyRanking, RankingType, UserRankingData } from "../types";

// // サンプルデータ
// const sampleUserRankingData: UserRankingData = {
//   currentRank: 15,
//   totalParticipants: 1247,
//   totalScore: 82.3,
//   scoreBreakdown: {
//     netWorthFormationRate: 85.2,
//     revenueGrowthRate: 78.5,
//     profitMarginImprovement: 88.1,
//     targetAchievementRate: 77.8,
//   },
//   categoryRankings: [
//     { category: "industry", rank: 8, totalParticipants: 234 },
//     { category: "size", rank: 12, totalParticipants: 156 },
//     { category: "revenue", rank: 22, totalParticipants: 1247 },
//     { category: "profit", rank: 7, totalParticipants: 1247 },
//   ],
//   earnedBadges: [
//     {
//       id: "1",
//       name: "成長王",
//       description: "3ヶ月連続で売上成長率トップ10入り",
//       category: "performance",
//       rarity: "rare",
//       unlockedAt: new Date("2024-05-15"),
//     },
//     {
//       id: "2",
//       name: "目標達成バッジ",
//       description: "月次目標を100%達成",
//       category: "achievement",
//       rarity: "common",
//       unlockedAt: new Date("2024-06-01"),
//     },
//     {
//       id: "3",
//       name: "継続利用バッジ",
//       description: "6ヶ月間継続利用",
//       category: "achievement",
//       rarity: "common",
//       unlockedAt: new Date("2024-04-01"),
//     },
//   ],
//   recentAwards: [
//     {
//       id: "1",
//       name: "業界別ランキング 3位",
//       category: "industry",
//       period: "monthly",
//       year: 2024,
//       month: 5,
//       rank: 3,
//       companyId: "user",
//       isAnonymous: false,
//     },
//   ],
//   benchmarkData: {
//     industry: "IT・ソフトウェア",
//     companySize: "法人（従業員1-5名）",
//     averageScore: 72.5,
//     medianScore: 70.2,
//     topPercentileScore: 89.3,
//     averageRevenueGrowth: 15.2,
//     averageProfitMargin: 12.8,
//     averageNetWorthFormation: 18.5,
//     averageTargetAchievement: 68.3,
//     participantCount: 234,
//   },
// };

// const sampleRankings: CompanyRanking[] = [
//   {
//     id: "1",
//     rank: 1,
//     companyName: "A社",
//     isAnonymous: true,
//     industry: "IT・ソフトウェア",
//     companySize: "法人（従業員6-20名）",
//     foundingYear: 2020,
//     totalScore: 94.2,
//     netWorthFormationRate: 95.8,
//     revenueGrowthRate: 92.3,
//     profitMarginImprovement: 96.1,
//     targetAchievementRate: 92.8,
//   },
//   {
//     id: "2",
//     rank: 2,
//     companyName: "B社",
//     isAnonymous: true,
//     industry: "サービス業",
//     companySize: "法人（従業員1-5名）",
//     foundingYear: 2021,
//     totalScore: 91.8,
//     netWorthFormationRate: 88.9,
//     revenueGrowthRate: 95.2,
//     profitMarginImprovement: 91.7,
//     targetAchievementRate: 91.4,
//   },
//   // ... 他のランキングデータ
// ];

// const Ranking: React.FC = () => {
//   const [selectedCategory, setSelectedCategory] =
//     useState<RankingType>("overall");
//   const [showBenchmark, setShowBenchmark] = useState(false);
//   const [selectedBadgeCategory, setSelectedBadgeCategory] =
//     useState<string>("all");

//   const rankingCategories = [
//     { id: "overall", name: "総合ランキング", icon: Trophy },
//     { id: "industry", name: "業界別", icon: Users },
//     { id: "size", name: "規模別", icon: Target },
//     { id: "revenue", name: "売上成長率", icon: TrendingUp },
//     { id: "profit", name: "利益率改善", icon: Medal },
//     { id: "net_worth", name: "純資産形成率", icon: Crown },
//     { id: "target", name: "目標達成率", icon: Award },
//   ];

//   const getRankIcon = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return <Crown className="h-6 w-6 text-yellow-500" />;
//       case 2:
//         return <Medal className="h-6 w-6 text-gray-400" />;
//       case 3:
//         return <Award className="h-6 w-6 text-amber-600" />;
//       default:
//         return <span className="text-lg font-bold text-text/70">#{rank}</span>;
//     }
//   };

//   const getBadgeRarityColor = (rarity: string) => {
//     switch (rarity) {
//       case "common":
//         return "bg-gray-100 text-gray-800 border-gray-300";
//       case "rare":
//         return "bg-blue-100 text-blue-800 border-blue-300";
//       case "epic":
//         return "bg-purple-100 text-purple-800 border-purple-300";
//       case "legendary":
//         return "bg-yellow-100 text-yellow-800 border-yellow-300";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-300";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <h1 className="text-2xl sm:text-3xl font-bold text-text">
//           ランキング・表彰
//         </h1>
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={() => setShowBenchmark(!showBenchmark)}
//             className="btn-secondary flex items-center space-x-2"
//           >
//             {showBenchmark ? (
//               <EyeOff className="h-4 w-4" />
//             ) : (
//               <Eye className="h-4 w-4" />
//             )}
//             <span>ベンチマーク{showBenchmark ? "を隠す" : "を表示"}</span>
//           </button>
//         </div>
//       </div>

//       {/* 現在の順位サマリー */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="card bg-gradient-to-r from-primary to-primary/80 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm opacity-90">総合順位</p>
//               <p className="text-2xl font-bold">
//                 #{sampleUserRankingData.currentRank}
//               </p>
//               <p className="text-xs opacity-80">
//                 / {sampleUserRankingData.totalParticipants}社中
//               </p>
//             </div>
//             <Trophy className="h-8 w-8 opacity-80" />
//           </div>
//         </div>

//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-text/70">総合スコア</p>
//               <p className="text-2xl font-bold text-text">
//                 {sampleUserRankingData.totalScore}
//               </p>
//               <p className="text-xs text-success">平均より+9.8pt</p>
//             </div>
//             <Star className="h-8 w-8 text-warning" />
//           </div>
//         </div>

//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-text/70">獲得バッジ</p>
//               <p className="text-2xl font-bold text-text">
//                 {sampleUserRankingData.earnedBadges.length}
//               </p>
//               <p className="text-xs text-text/70">個</p>
//             </div>
//             <Medal className="h-8 w-8 text-primary" />
//           </div>
//         </div>

//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-text/70">今月の表彰</p>
//               <p className="text-2xl font-bold text-text">
//                 {sampleUserRankingData.recentAwards.length}
//               </p>
//               <p className="text-xs text-text/70">件</p>
//             </div>
//             <Award className="h-8 w-8 text-warning" />
//           </div>
//         </div>
//       </div>

//       {/* ベンチマーク情報 */}
//       {showBenchmark && (
//         <div className="card">
//           <h3 className="text-lg font-semibold text-text mb-4">
//             業界ベンチマーク
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="bg-sub2 rounded-lg p-4">
//               <p className="text-sm text-text/70">平均スコア</p>
//               <p className="text-xl font-bold text-text">
//                 {sampleUserRankingData.benchmarkData.averageScore}
//               </p>
//               <p className="text-xs text-text/70">
//                 {sampleUserRankingData.benchmarkData.industry}
//               </p>
//             </div>
//             <div className="bg-sub2 rounded-lg p-4">
//               <p className="text-sm text-text/70">売上成長率</p>
//               <p className="text-xl font-bold text-text">
//                 {sampleUserRankingData.benchmarkData.averageRevenueGrowth}%
//               </p>
//               <p className="text-xs text-text/70">業界平均</p>
//             </div>
//             <div className="bg-sub2 rounded-lg p-4">
//               <p className="text-sm text-text/70">利益率</p>
//               <p className="text-xl font-bold text-text">
//                 {sampleUserRankingData.benchmarkData.averageProfitMargin}%
//               </p>
//               <p className="text-xs text-text/70">業界平均</p>
//             </div>
//             <div className="bg-sub2 rounded-lg p-4">
//               <p className="text-sm text-text/70">参加企業数</p>
//               <p className="text-xl font-bold text-text">
//                 {sampleUserRankingData.benchmarkData.participantCount}
//               </p>
//               <p className="text-xs text-text/70">社</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* カテゴリー選択 */}
//       <div className="card">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-text">
//             ランキングカテゴリー
//           </h3>
//           <Filter className="h-5 w-5 text-text/50" />
//         </div>
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
//           {rankingCategories.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => setSelectedCategory(category.id as RankingType)}
//               className={`p-3 rounded-lg border-2 transition-all ${
//                 selectedCategory === category.id
//                   ? "border-primary bg-primary/10 text-primary"
//                   : "border-border hover:border-primary/50"
//               }`}
//             >
//               <category.icon className="h-5 w-5 mx-auto mb-1" />
//               <span className="text-xs block">{category.name}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ランキング表示 */}
//       <div className="card">
//         <h3 className="text-lg font-semibold text-text mb-4">
//           {rankingCategories.find((c) => c.id === selectedCategory)?.name}
//         </h3>
//         <div className="space-y-3">
//           {sampleRankings.slice(0, 10).map((company) => (
//             <div
//               key={company.id}
//               className={`flex items-center justify-between p-4 rounded-lg border ${
//                 company.rank <= 3
//                   ? "border-warning bg-warning/5"
//                   : "border-border bg-white"
//               }`}
//             >
//               <div className="flex items-center space-x-4">
//                 <div className="flex-shrink-0">{getRankIcon(company.rank)}</div>
//                 <div>
//                   <p className="font-semibold text-text">
//                     {company.companyName}
//                   </p>
//                   <p className="text-sm text-text/70">
//                     {company.industry} • {company.companySize}
//                   </p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <p className="text-lg font-bold text-text">
//                   {company.totalScore}
//                 </p>
//                 <p className="text-sm text-text/70">スコア</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* バッジコレクション */}
//       <div className="card">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-text">獲得バッジ</h3>
//           <select
//             value={selectedBadgeCategory}
//             onChange={(e) => setSelectedBadgeCategory(e.target.value)}
//             className="input-field w-auto"
//           >
//             <option value="all">すべて</option>
//             <option value="performance">パフォーマンス</option>
//             <option value="achievement">達成</option>
//             <option value="rare">レア</option>
//             <option value="special">特別賞</option>
//           </select>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {sampleUserRankingData.earnedBadges.map((badge) => (
//             <div
//               key={badge.id}
//               className={`p-4 rounded-lg border-2 ${getBadgeRarityColor(
//                 badge.rarity
//               )}`}
//             >
//               <div className="flex items-center space-x-3">
//                 <Medal className="h-8 w-8" />
//                 <div>
//                   <p className="font-semibold">{badge.name}</p>
//                   <p className="text-sm opacity-80">{badge.description}</p>
//                   <p className="text-xs opacity-70">
//                     {badge.unlockedAt?.toLocaleDateString("ja-JP")}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Ranking;
