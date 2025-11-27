// import React, { useState } from "react";
// import { Calendar, MessageCircle, Clock, User, Send } from "lucide-react";

// const Support: React.FC = () => {
//   const [chatMessage, setChatMessage] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");

//   const faqData = [
//     {
//       question: "弥生会計との連携方法を教えてください",
//       answer:
//         "設定画面から弥生会計連携を選択し、APIキーを入力することで自動連携が可能です。",
//     },
//     {
//       question: "目標設定はどのように行えばよいですか？",
//       answer:
//         "ロードマップ設定画面で、各年度の売上・利益・従業員数を入力し、事業フェーズを選択してください。",
//     },
//     {
//       question: "実績データの入力頻度はどのくらいが良いですか？",
//       answer:
//         "月次での入力をお勧めします。より詳細な分析のため、週次入力も可能です。",
//     },
//   ];

//   const consultationHistory = [
//     {
//       date: "2024-06-10",
//       advisor: "田中税理士",
//       topic: "消費税の計算方法について",
//       status: "完了",
//     },
//     {
//       date: "2024-05-15",
//       advisor: "佐藤会計士",
//       topic: "決算書の見方と改善点",
//       status: "完了",
//     },
//     {
//       date: "2024-04-20",
//       advisor: "田中税理士",
//       topic: "経費計上のポイント",
//       status: "完了",
//     },
//   ];

//   const timeSlots = ["10:00", "11:00", "14:00", "15:00", "16:00"];

//   const handleBooking = () => {
//     if (selectedDate && selectedTime) {
//       alert(`${selectedDate} ${selectedTime}での相談予約を受け付けました。`);
//     } else {
//       alert("日時を選択してください。");
//     }
//   };

//   const handleSendMessage = () => {
//     if (chatMessage.trim()) {
//       alert(
//         "メッセージを送信しました。サポートスタッフが確認後、回答いたします。"
//       );
//       setChatMessage("");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl sm:text-3xl font-bold text-text">
//         相談・サポート
//       </h1>

//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         {/* 税理士相談予約 */}
//         <div className="card">
//           <div className="flex items-center space-x-2 mb-4">
//             <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//             <h3 className="text-base sm:text-lg font-semibold text-text">
//               税理士相談予約
//             </h3>
//           </div>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm text-text/70 mb-1">相談日</label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="input-field w-full"
//                 min={new Date().toISOString().split("T")[0]}
//               />
//             </div>

//             <div>
//               <label className="block text-sm text-text/70 mb-1">時間帯</label>
//               <select
//                 value={selectedTime}
//                 onChange={(e) => setSelectedTime(e.target.value)}
//                 className="input-field w-full"
//               >
//                 <option value="">時間を選択</option>
//                 {timeSlots.map((time) => (
//                   <option key={time} value={time}>
//                     {time}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm text-text/70 mb-1">
//                 相談内容（簡単に）
//               </label>
//               <textarea
//                 className="input-field w-full h-20"
//                 placeholder="相談したい内容を簡単にお書きください"
//               />
//             </div>

//             <button onClick={handleBooking} className="btn-primary w-full">
//               予約を申し込む
//             </button>
//           </div>
//         </div>

//         {/* チャット機能 */}
//         <div className="card">
//           <div className="flex items-center space-x-2 mb-4">
//             <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//             <h3 className="text-base sm:text-lg font-semibold text-text">
//               チャット相談
//             </h3>
//           </div>

//           <div className="border border-border rounded-lg h-64 p-3 mb-4 overflow-y-auto bg-sub2/30">
//             <div className="space-y-3">
//               <div className="flex items-start space-x-2">
//                 <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
//                   <User className="h-4 w-4 text-white" />
//                 </div>
//                 <div className="bg-white rounded-lg p-2 shadow-sm max-w-xs">
//                   <p className="text-sm">
//                     こんにちは！何かご質問はありますか？
//                   </p>
//                   <p className="text-xs text-text/50 mt-1">
//                     サポートスタッフ - 10:30
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex space-x-2">
//             <input
//               type="text"
//               value={chatMessage}
//               onChange={(e) => setChatMessage(e.target.value)}
//               className="input-field flex-1"
//               placeholder="メッセージを入力..."
//               onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//             />
//             <button onClick={handleSendMessage} className="btn-primary px-3">
//               <Send className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* よくある質問 */}
//       <div className="card">
//         <h3 className="text-base sm:text-lg font-semibold text-text mb-4">
//           よくある質問
//         </h3>
//         <div className="space-y-4">
//           {faqData.map((faq, index) => (
//             <details key={index} className="border border-border rounded-lg">
//               <summary className="p-4 cursor-pointer hover:bg-sub2/30 font-medium text-text">
//                 {faq.question}
//               </summary>
//               <div className="px-4 pb-4 text-text/70">{faq.answer}</div>
//             </details>
//           ))}
//         </div>
//       </div>

//       {/* 相談履歴 */}
//       <div className="card">
//         <h3 className="text-base sm:text-lg font-semibold text-text mb-4">
//           過去の相談履歴
//         </h3>
//         <div className="space-y-3">
//           {consultationHistory.map((consultation, index) => (
//             <div
//               key={index}
//               className="flex items-center justify-between p-3 border border-border rounded-lg"
//             >
//               <div className="flex items-center space-x-3">
//                 <Clock className="h-4 w-4 text-text/50" />
//                 <div>
//                   <p className="font-medium text-text">{consultation.topic}</p>
//                   <p className="text-sm text-text/70">
//                     {consultation.advisor} - {consultation.date}
//                   </p>
//                 </div>
//               </div>
//               <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
//                 {consultation.status}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Support;
