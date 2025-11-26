import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Building2,
  Banknote,
  Briefcase,
  BookOpen,
  Calendar,
  ChevronRight,
  ArrowLeft,
  User,
  PlusCircle,
} from "lucide-react";
import type {
  UserPerformanceData,
  RoadmapYear,
  RoadmapQuarter,
  RoadmapAdvice,
  CompanySize,
  Industry,
  FinancialKnowledge,
  SalesTarget,
} from "../types";

const DEMO_CURRENT_DATE = new Date("2025-07-01");

const defaultRoadmapYear1: RoadmapQuarter = {
  1: {
    title: "事業をスタートさせよう",
    advice: "個人事業主の届出や会社設立から始めよう",
    details: [
      "個人事業主の届出や会社設立の手続き",
      "「どんな商品・サービスを誰に売るか」を明確にする",
      "開業資金を準備する（自分のお金や借入）",
      "家計簿のような帳簿をつける仕組みを作る",
    ],
  },
  2: {
    title: "最初のお客様を見つけよう",
    advice: "実際に商品・サービスを売り始めよう",
    details: [
      "実際に商品・サービスを売り始める",
      "「いくら売れたか」を記録する",
      "毎月の売上と支出をチェックする習慣をつける",
      "確定申告の準備を始める",
    ],
  },
  3: {
    title: "売上を伸ばしていこう",
    advice: "お客様を増やす活動に力を入れよう",
    details: [
      "お客様を増やす活動に力を入れる",
      "「今月はいくら売りたいか」目標を決める",
      "お金の出入りを毎月チェックする",
      "税金の申告について勉強し始める",
    ],
  },
  4: {
    title: "1年目の成果を確認しよう",
    advice: "確定申告・決算を行おう",
    details: [
      "確定申告・決算を行う",
      "「1年間でいくら売れたか、いくら残ったか」を計算",
      "来年の目標を立てる",
      "貯金がどれくらい増えたかチェック",
    ],
  },
};

const defaultRoadmapYear2: RoadmapQuarter = {
  1: {
    title: "事業を安定させよう",
    advice: "既存のお客様との関係を大切にしよう",
    details: [
      "既存のお客様との関係を大切にする",
      "「来月はいくら売れそうか」予測の精度を上げる",
      "無駄な出費がないかチェックする",
      "人を雇うかどうか検討する",
    ],
  },
  2: {
    title: "事業を大きくする準備をしよう",
    advice: "スタッフを雇って教育しよう",
    details: [
      "スタッフを雇って教育する",
      "仕事の流れを整理して効率化する",
      "売上管理をもっと詳しくする",
      "3年後の目標を考える",
    ],
  },
  3: {
    title: "事業を広げよう",
    advice: "新しい商品・サービスを考えよう",
    details: [
      "新しい商品・サービスを考える",
      "営業活動を強化する",
      "「売上に対してどれくらい利益が出ているか」を改善",
      "設備投資を検討する",
    ],
  },
  4: {
    title: "経営の基盤を固めよう",
    advice: "2年目の決算・税務申告を行おう",
    details: [
      "2年目の決算・税務申告",
      "お金の流れをもっと詳しく分析",
      "来年の詳しい予算を作る",
      "個人の資産がどれくらい増えたかチェック",
    ],
  },
};

const generateDefaultRoadmap = (): RoadmapYear[] => {
  const roadmap: RoadmapYear[] = [];
  for (let i = 0; i < 11; i++) {
    const year = 2024 + i;
    if (year === 2024) {
      roadmap.push({ year, quarters: defaultRoadmapYear1 });
    } else if (year < 2034) {
      roadmap.push({ year, quarters: defaultRoadmapYear2 });
    } else {
      // 2034
      const goalAdvice: RoadmapAdvice = {
        title: "10年間のゴール",
        advice: "目標に向けて歩むあなたを、この場所で待っています。",
        details: [],
      };
      roadmap.push({
        year: 2034,
        quarters: {
          1: goalAdvice,
          2: goalAdvice,
          3: goalAdvice,
          4: goalAdvice,
        },
      });
    }
  }
  return roadmap;
};

const generateDefaultSalesTargets = (): SalesTarget[] => {
  return [
    { year: 2024, targetAmount: 8000000 },
    { year: 2025, targetAmount: 16000000 },
    { year: 2026, targetAmount: 24000000 },
    { year: 2027, targetAmount: 32000000 },
    { year: 2028, targetAmount: 40000000 },
    { year: 2029, targetAmount: 48000000 },
    { year: 2030, targetAmount: 56000000 },
    { year: 2031, targetAmount: 64000000 },
    { year: 2032, targetAmount: 72000000 },
    { year: 2033, targetAmount: 80000000 },
  ];
};

// デモ用のクライアントデータ
const DEMO_USERS: UserPerformanceData[] = [
  {
    userId: "user001",
    userName: "田中 太郎",
    email: "tanaka@example.com",
    companyName: "田中コンサルティング",
    role: "一般ユーザー",
    phoneNumber: "090-1234-5678",
    capital: 10000000,
    companySize: "法人（従業員6-20名）",
    industry: "IT・ソフトウェア",
    businessStartDate: "2023-04",
    financialKnowledge: "中級レベル",
    lastUpdated: "2025-07-05",
    fiscalYearEndMonth: 3,
    performance: {
      twoMonthsAgo: {
        sales: { target: 1000000, actual: 1050000, achievementRate: 105.0 },
        grossProfit: { target: 400000, actual: 420000, achievementRate: 105.0 },
        operatingProfit: {
          target: 200000,
          actual: 210000,
          achievementRate: 105.0,
        },
      },
      lastMonth: {
        sales: { target: 1000000, actual: 950000, achievementRate: 95.0 },
        grossProfit: { target: 400000, actual: 380000, achievementRate: 95.0 },
        operatingProfit: {
          target: 200000,
          actual: 190000,
          achievementRate: 95.0,
        },
      },
      currentMonth: {
        sales: { target: 1200000, actual: 800000, achievementRate: 66.7 },
        grossProfit: { target: 500000, actual: 320000, achievementRate: 64.0 },
        operatingProfit: {
          target: 250000,
          actual: 160000,
          achievementRate: 64.0,
        },
      },
      yoyCurrentMonth: {
        sales: 5.0,
        grossProfit: 2.0,
        operatingProfit: 1.5,
      },
      yoyLastMonth: {
        sales: 10.0,
        grossProfit: 8.0,
        operatingProfit: 5.0,
      },
      yoyTwoMonthsAgo: {
        sales: 12.0,
        grossProfit: 10.0,
        operatingProfit: 8.0,
      },
    },
    hasComment: true,
    comment:
      "7月は売上が目標を下回っていますが、6月は順調でした。夏季の集客アップと経費管理を見直し、秋に向けて準備を進めることをお勧めします。",
    commentDate: "2025-07-05",
    goodPoint: "6月の実績は目標を上回り、好調を維持しています。",
    cautionPoint: "夏季の集客減に備え、新たなキャンペーンを検討しましょう。",
    badPoint:
      "7月の売上が目標を大幅に下回っています。原因の特定と対策が急務です。",
    commentHistory: [
      {
        id: "comment001",
        comment:
          "年度始めとして順調なスタートです。今後も継続的な成長を目指していきましょう。",
        date: "2025-04-15",
        yearMonth: "2025-04",
      },
      {
        id: "comment002",
        comment:
          "5月は目標を上回る実績でした。この調子を維持しつつ、コスト管理にも注意を払ってください。",
        date: "2025-05-16",
        yearMonth: "2025-05",
      },
      {
        id: "comment003",
        comment:
          "6月の実績も好調を維持しています。夏季に向けてマーケティング強化を検討しましょう。",
        date: "2025-06-14",
        yearMonth: "2025-06",
      },
      {
        id: "comment004",
        comment:
          "7月は売上が目標を下回っていますが、6月は順調でした。夏季の集客アップと経費管理を見直し、秋に向けて準備を進めることをお勧めします。",
        date: "2025-07-05",
        yearMonth: "2025-07",
      },
    ],
    roadmap: generateDefaultRoadmap(),
    salesTargets: generateDefaultSalesTargets(),
    grossProfitMarginTarget: 40,
    operatingProfitMarginTarget: 20,
  },
  {
    userId: "user002",
    userName: "佐藤 花子",
    email: "sato@example.com",
    companyName: "佐藤デザイン事務所",
    role: "一般ユーザー",
    phoneNumber: "080-1111-2222",
    capital: 3000000,
    companySize: "法人（従業員1-5名）",
    industry: "IT・ソフトウェア",
    businessStartDate: "2024-01",
    financialKnowledge: "初心者",
    lastUpdated: "2025-07-04",
    fiscalYearEndMonth: 12,
    performance: {
      twoMonthsAgo: {
        sales: { target: 800000, actual: 820000, achievementRate: 102.5 },
        grossProfit: { target: 320000, actual: 330000, achievementRate: 103.1 },
        operatingProfit: {
          target: 160000,
          actual: 165000,
          achievementRate: 103.1,
        },
      },
      lastMonth: {
        sales: { target: 800000, actual: 920000, achievementRate: 115.0 },
        grossProfit: { target: 320000, actual: 380000, achievementRate: 118.8 },
        operatingProfit: {
          target: 160000,
          actual: 190000,
          achievementRate: 118.8,
        },
      },
      currentMonth: {
        sales: { target: 900000, actual: 750000, achievementRate: 83.3 },
        grossProfit: { target: 360000, actual: 300000, achievementRate: 83.3 },
        operatingProfit: {
          target: 180000,
          actual: 150000,
          achievementRate: 83.3,
        },
      },
      yoyCurrentMonth: {
        sales: -2.5,
        grossProfit: -3.0,
        operatingProfit: -3.5,
      },
      yoyLastMonth: {
        sales: 15.0,
        grossProfit: 18.0,
        operatingProfit: 20.0,
      },
      yoyTwoMonthsAgo: {
        sales: 2.5,
        grossProfit: 3.1,
        operatingProfit: 3.1,
      },
    },
    hasComment: true,
    comment:
      "6月は目標を大幅に上回る結果で素晴らしいです！7月も堅調に推移しています。創意工夫とクライアント満足度の維持を心がけてください。",
    commentDate: "2025-07-04",
    goodPoint:
      "新規クライアントからの評価が高く、リピート受注に繋がっています。",
    cautionPoint:
      "プロジェクトの納期管理に注意し、遅延が発生しないようにしましょう。",
    badPoint: "",
    commentHistory: [
      {
        id: "comment005",
        comment:
          "4月の実績は素晴らしいです。デザイン案件の品質が高いことが評価されています。",
        date: "2025-04-20",
        yearMonth: "2025-04",
      },
      {
        id: "comment006",
        comment:
          "6月は目標を大幅に上回る結果で素晴らしいです！7月も堅調に推移しています。創意工夫とクライアント満足度の維持を心がけてください。",
        date: "2025-07-04",
        yearMonth: "2025-07",
      },
    ],
    roadmap: generateDefaultRoadmap(),
    salesTargets: generateDefaultSalesTargets(),
    grossProfitMarginTarget: 40,
    operatingProfitMarginTarget: 20,
  },
  {
    userId: "user003",
    userName: "山田 一郎",
    email: "yamada@example.com",
    companyName: "山田商事",
    role: "一般ユーザー",
    phoneNumber: "",
    capital: 50000000,
    companySize: "法人（従業員21名以上）",
    industry: "IT・ソフトウェア",
    businessStartDate: "2020-06",
    financialKnowledge: "上級レベル",
    lastUpdated: "2025-07-03",
    fiscalYearEndMonth: 6,
    performance: {
      twoMonthsAgo: {
        sales: { target: 1400000, actual: 1300000, achievementRate: 92.9 },
        grossProfit: { target: 560000, actual: 520000, achievementRate: 92.9 },
        operatingProfit: {
          target: 280000,
          actual: 260000,
          achievementRate: 92.9,
        },
      },
      lastMonth: {
        sales: { target: 1500000, actual: 1350000, achievementRate: 90.0 },
        grossProfit: { target: 600000, actual: 540000, achievementRate: 90.0 },
        operatingProfit: {
          target: 300000,
          actual: 270000,
          achievementRate: 90.0,
        },
      },
      currentMonth: {
        sales: { target: 1600000, actual: 1200000, achievementRate: 75.0 },
        grossProfit: { target: 640000, actual: 480000, achievementRate: 75.0 },
        operatingProfit: {
          target: 320000,
          actual: 240000,
          achievementRate: 75.0,
        },
      },
      yoyCurrentMonth: {
        sales: -10.0,
        grossProfit: -12.0,
        operatingProfit: -15.0,
      },
      yoyLastMonth: {
        sales: -5.0,
        grossProfit: -8.0,
        operatingProfit: -10.0,
      },
      yoyTwoMonthsAgo: {
        sales: -7.1,
        grossProfit: -7.1,
        operatingProfit: -7.1,
      },
    },
    hasComment: true,
    comment:
      "夏の繁忙期に向けて準備を進めましょう。在庫管理と資金繰りに注意が必要です。",
    commentDate: "2025-05-10",
    goodPoint: "主要取引先との関係が良好で、安定した受注が見込めます。",
    cautionPoint:
      "原材料費の上昇が利益を圧迫する可能性があるため、代替案の検討が必要です。",
    badPoint: "",
    commentHistory: [
      {
        id: "comment007",
        comment:
          "夏の繁忙期に向けて準備を進めましょう。在庫管理と資金繰りに注意が必要です。",
        date: "2025-05-10",
        yearMonth: "2025-05",
      },
    ],
    roadmap: generateDefaultRoadmap(),
    salesTargets: generateDefaultSalesTargets(),
    grossProfitMarginTarget: 40,
    operatingProfitMarginTarget: 20,
  },
  {
    userId: "user004",
    userName: "鈴木 美咲",
    email: "suzuki@example.com",
    companyName: "鈴木マーケティング",
    role: "一般ユーザー",
    phoneNumber: "",
    capital: 5000000,
    companySize: "法人（従業員1-5名）",
    industry: "IT・ソフトウェア",
    businessStartDate: "2023-10",
    financialKnowledge: "初心者",
    lastUpdated: "2025-07-05",
    fiscalYearEndMonth: 9,
    performance: {
      twoMonthsAgo: {
        sales: { target: 500000, actual: 550000, achievementRate: 110.0 },
        grossProfit: { target: 200000, actual: 220000, achievementRate: 110.0 },
        operatingProfit: {
          target: 100000,
          actual: 110000,
          achievementRate: 110.0,
        },
      },
      lastMonth: {
        sales: { target: 600000, actual: 680000, achievementRate: 113.3 },
        grossProfit: { target: 240000, actual: 272000, achievementRate: 113.3 },
        operatingProfit: {
          target: 120000,
          actual: 136000,
          achievementRate: 113.3,
        },
      },
      currentMonth: {
        sales: { target: 700000, actual: 520000, achievementRate: 74.3 },
        grossProfit: { target: 280000, actual: 208000, achievementRate: 74.3 },
        operatingProfit: {
          target: 140000,
          actual: 104000,
          achievementRate: 74.3,
        },
      },
      yoyCurrentMonth: {
        sales: 20.0,
        grossProfit: 22.0,
        operatingProfit: 25.0,
      },
      yoyLastMonth: {
        sales: 13.3,
        grossProfit: 13.3,
        operatingProfit: 13.3,
      },
      yoyTwoMonthsAgo: {
        sales: 10.0,
        grossProfit: 10.0,
        operatingProfit: 10.0,
      },
    },
    hasComment: false,
    comment: "",
    commentDate: "",
    goodPoint: "",
    cautionPoint: "",
    badPoint: "",
    commentHistory: [],
    roadmap: generateDefaultRoadmap(),
    salesTargets: generateDefaultSalesTargets(),
    grossProfitMarginTarget: 40,
    operatingProfitMarginTarget: 20,
  },
  {
    userId: "user005",
    userName: "高橋 健太",
    email: "takahashi@example.com",
    companyName: "高橋IT開発",
    role: "一般ユーザー",
    phoneNumber: "",
    capital: 20000000,
    companySize: "法人（従業員6-20名）",
    industry: "IT・ソフトウェア",
    businessStartDate: "2021-02",
    financialKnowledge: "中級レベル",
    lastUpdated: "2025-07-02",
    fiscalYearEndMonth: 12,
    performance: {
      twoMonthsAgo: {
        sales: { target: 1800000, actual: 1900000, achievementRate: 105.6 },
        grossProfit: { target: 720000, actual: 760000, achievementRate: 105.6 },
        operatingProfit: {
          target: 360000,
          actual: 380000,
          achievementRate: 105.6,
        },
      },
      lastMonth: {
        sales: { target: 2000000, actual: 2200000, achievementRate: 110.0 },
        grossProfit: { target: 800000, actual: 880000, achievementRate: 110.0 },
        operatingProfit: {
          target: 400000,
          actual: 440000,
          achievementRate: 110.0,
        },
      },
      currentMonth: {
        sales: { target: 2100000, actual: 1800000, achievementRate: 85.7 },
        grossProfit: { target: 840000, actual: 720000, achievementRate: 85.7 },
        operatingProfit: {
          target: 420000,
          actual: 360000,
          achievementRate: 85.7,
        },
      },
      yoyCurrentMonth: {
        sales: 8.7,
        grossProfit: 8.7,
        operatingProfit: 8.7,
      },
      yoyLastMonth: {
        sales: 10.0,
        grossProfit: 10.0,
        operatingProfit: 10.0,
      },
      yoyTwoMonthsAgo: {
        sales: 5.6,
        grossProfit: 5.6,
        operatingProfit: 5.6,
      },
    },
    hasComment: true,
    comment:
      "IT開発案件の受注が好調です。技術者のスキルアップと品質管理を継続していきましょう。",
    commentDate: "2025-07-02",
    goodPoint: "大規模案件の受注に成功し、売上が大幅に増加しました。",
    cautionPoint:
      "人材不足がボトルネックになる可能性があります。採用計画を前倒しで進めましょう。",
    badPoint: "",
    commentHistory: [
      {
        id: "comment009",
        comment:
          "新技術への投資が売上増につながっています。継続的な学習を推奨します。",
        date: "2025-05-20",
        yearMonth: "2025-05",
      },
      {
        id: "comment010",
        comment:
          "IT開発案件の受注が好調です。技術者のスキルアップと品質管理を継続していきましょう。",
        date: "2025-07-02",
        yearMonth: "2025-07",
      },
    ],
    roadmap: generateDefaultRoadmap(),
    salesTargets: generateDefaultSalesTargets(),
    grossProfitMarginTarget: 40,
    operatingProfitMarginTarget: 20,
  },
];

const ClientManagement: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserPerformanceData | null>(
    null
  );
  const [users, setUsers] = useState<UserPerformanceData[]>(DEMO_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<
    Partial<UserPerformanceData> & {
      password?: string;
      businessStartYear?: string;
      businessStartMonth?: string;
    }
  >({
    role: "一般ユーザー",
    companyName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const companySizeOptions: CompanySize[] = [
    "個人事業主",
    "法人（従業員1-5名）",
    "法人（従業員6-20名）",
    "法人（従業員21名以上）",
  ];

  const industryOptions: Industry[] = [
    "IT・ソフトウェア",
    "製造業",
    "小売業",
    "飲食業",
    "サービス業",
    "建設業",
    "医療・福祉",
    "教育",
    "金融・保険",
    "不動産",
    "その他",
  ];

  const financialKnowledgeOptions: FinancialKnowledge[] = [
    "初心者",
    "基本レベル",
    "中級レベル",
    "上級レベル",
  ];

  const currentYear = DEMO_CURRENT_DATE.getFullYear();
  const currentMonth = DEMO_CURRENT_DATE.getMonth() + 1;

  useEffect(() => {
    // 年月が変更されたときに、選択された年月が未来にならないように調整
    if (
      newUser.businessStartYear &&
      newUser.businessStartMonth &&
      Number(newUser.businessStartYear) === currentYear &&
      Number(newUser.businessStartMonth) > currentMonth
    ) {
      setNewUser((prev) => ({
        ...prev,
        businessStartMonth: String(currentMonth).padStart(2, "0"),
      }));
    }
  }, [
    newUser.businessStartYear,
    newUser.businessStartMonth,
    currentYear,
    currentMonth,
  ]);

  useEffect(() => {
    // デモ用のローディングシミュレーション
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // フィルタリング
  const filteredAndSortedUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddUserModal = () => {
    setNewUser({
      role: "一般ユーザー",
      companyName: "",
      userName: "",
      email: "",
      password: "",
    });
    setErrors({});
    setIsAddUserModalOpen(true);
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleNewUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateNewUserForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!newUser.userName) newErrors.userName = "ユーザー名は必須です。";
    if (!newUser.companyName) newErrors.companyName = "会社名は必須です。";
    if (!newUser.email) {
      newErrors.email = "メールアドレスは必須です。";
    } else if (newUser.email.includes("@")) {
      newErrors.email = "メールアドレスに「@」は含めないでください。";
    }
    if (!newUser.password || newUser.password.length < 8) {
      newErrors.password = "パスワードは8文字以上で入力してください。";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNewUser = () => {
    if (!validateNewUserForm()) return;

    const businessStartDate =
      newUser.businessStartYear && newUser.businessStartMonth
        ? `${newUser.businessStartYear}-${newUser.businessStartMonth.padStart(
            2,
            "0"
          )}`
        : "";

    const newUserPayload = { ...newUser };
    delete (newUserPayload as any).businessStartYear;
    delete (newUserPayload as any).businessStartMonth;

    const newUserWithDefaults: UserPerformanceData = {
      userId: `user_${Date.now()}`,
      lastUpdated: DEMO_CURRENT_DATE.toISOString().split("T")[0],
      performance: {
        currentMonth: {
          sales: { target: 0, actual: 0, achievementRate: 0 },
          grossProfit: { target: 0, actual: 0, achievementRate: 0 },
          operatingProfit: { target: 0, actual: 0, achievementRate: 0 },
        },
        lastMonth: {
          sales: { target: 0, actual: 0, achievementRate: 0 },
          grossProfit: { target: 0, actual: 0, achievementRate: 0 },
          operatingProfit: { target: 0, actual: 0, achievementRate: 0 },
        },
        twoMonthsAgo: {
          sales: { target: 0, actual: 0, achievementRate: 0 },
          grossProfit: { target: 0, actual: 0, achievementRate: 0 },
          operatingProfit: { target: 0, actual: 0, achievementRate: 0 },
        },
      },
      hasComment: false,
      comment: "",
      commentDate: "",
      commentHistory: [],
      roadmap: generateDefaultRoadmap(),
      fiscalYearEndMonth: 12,
      ...newUserPayload,
      businessStartDate,
      role: "一般ユーザー",
      salesTargets: generateDefaultSalesTargets(),
      grossProfitMarginTarget: 40,
      operatingProfitMarginTarget: 20,
    } as UserPerformanceData;

    setUsers((prev) => [...prev, newUserWithDefaults]);
    closeAddUserModal();
  };

  // ユーザー選択時の処理
  const handleUserSelect = (user: UserPerformanceData) => {
    setSelectedUser(user);
  };

  // ユーザー詳細画面
  if (selectedUser) {
    const formatBusinessStartDate = (dateStr?: string) => {
      if (!dateStr) return "未設定";
      const [year, month] = dateStr.split("-");
      return `${year}年${month}月`;
    };

    const formatCapital = (capital?: number) => {
      if (!capital || capital <= 0) return "未設定";
      return capital.toLocaleString("ja-JP") + "円";
    };

    return (
      <div className="space-y-6">
        {/* 戻るボタン */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedUser(null)}
            className="flex items-center space-x-2 text-[#13AE67] hover:text-[#13AE67]/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>クライアント一覧に戻る</span>
          </button>
        </div>

        {/* クライアント情報カード */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#13AE67]/10 flex items-center justify-center">
                <User className="h-6 w-6 text-[#13AE67]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedUser.userName || "未設定"}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedUser.companyName || "会社名 未設定"}
                </p>
              </div>
            </div>
            {selectedUser.industry && (
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {selectedUser.industry}
              </span>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 mt-2" />

          {/* 情報グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            {/* メールアドレス */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                  メールアドレス
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900 break-all">
                  {selectedUser.email || "未設定"}
                </div>
              </div>
            </div>

            {/* ユーザー名 */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                  ユーザー名
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {selectedUser.userName || "未設定"}
                </div>
              </div>
            </div>

            {/* 会社名 */}
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                  会社名
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {selectedUser.companyName || "未設定"}
                </div>
              </div>
            </div>

            {/* 資本金 */}
            <div className="flex items-start gap-3">
              <Banknote className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                  資本金
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {formatCapital(selectedUser.capital)}
                </div>
              </div>
            </div>

            {/* 会社規模 */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                  会社規模
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {selectedUser.companySize || "未設定"}
                  </span>
                </div>
              </div>
            </div>

            {/* 業界 */}
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                  業界
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {selectedUser.industry || "未設定"}
                  </span>
                </div>
              </div>
            </div>

            {/* 事業開始年月 */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                  事業開始年月
                </div>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {formatBusinessStartDate(selectedUser.businessStartDate)}
                </div>
              </div>
            </div>

            {/* 財務・会計の知識レベル */}
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                  財務・会計の知識レベル
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#13AE67]/10 text-[#13AE67]">
                    {selectedUser.financialKnowledge || "未設定"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ユーザー一覧画面
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          クライアント管理 (デモモード)
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={openAddUserModal}
            className="flex items-center justify-center bg-primary text-white font-medium py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            新規クライアント追加
          </button>
          <div className="text-sm text-text/70">
            登録ユーザー数: {users.length}名
            {isLoading && <span className="ml-2">(読み込み中...)</span>}
          </div>
        </div>
      </div>

      {/* ローディング表示 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text/70">データを読み込んでいます...</p>
          <p className="text-sm text-blue-600 mt-2">(デモモード)</p>
        </div>
      ) : (
        <>
          {/* 検索・フィルター */}
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="ユーザー名または事業名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ユーザー一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedUsers.map((user) => (
              <div
                key={user.userId}
                className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-[#13AE67]"
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-text">
                          {user.userName}
                        </h3>
                      </div>
                      <p className="text-sm text-text/70">{user.email}</p>
                      <p className="text-sm text-text/70">{user.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChevronRight className="h-5 w-5 text-text/40" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text/70">事業開始年月</span>
                    <span className="text-sm font-medium text-primary">
                      {user.businessStartDate
                        ? `${user.businessStartDate.split("-")[0]}年${
                            user.businessStartDate.split("-")[1]
                          }月`
                        : "未設定"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedUsers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-text/30 mx-auto mb-4" />
              <p className="text-text/70">
                該当するユーザーが見つかりませんでした
              </p>
            </div>
          )}
        </>
      )}

      {/* 新規ユーザー追加モーダル */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">新規クライアント追加</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  メールアドレス *
                </label>
                <input
                  type="text"
                  name="email"
                  value={newUser.email || ""}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  パスワード *
                </label>
                <input
                  type="text"
                  name="password"
                  value={newUser.password || ""}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              {/* User Name */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  ユーザー名 *
                </label>
                <input
                  type="text"
                  name="userName"
                  value={newUser.userName || ""}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.userName && (
                  <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
                )}
              </div>
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  会社名 *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={newUser.companyName || ""}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.companyName}
                  </p>
                )}
              </div>
              {/* Capital */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  資本金 (円)
                </label>
                <input
                  type="number"
                  name="capital"
                  value={newUser.capital || 0}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  会社規模
                </label>
                <select
                  name="companySize"
                  value={newUser.companySize}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {companySizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  業界
                </label>
                <select
                  name="industry"
                  value={newUser.industry}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {industryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {/* Business Start Date */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  事業開始年月
                </label>
                <div className="flex gap-2">
                  <select
                    name="businessStartYear"
                    value={newUser.businessStartYear || ""}
                    onChange={handleNewUserChange}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {Array.from({ length: 11 }, (_, i) => currentYear - i).map(
                      (year) => (
                        <option key={year} value={year}>
                          {year}年
                        </option>
                      )
                    )}
                  </select>
                  <select
                    name="businessStartMonth"
                    value={newUser.businessStartMonth || ""}
                    onChange={handleNewUserChange}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {Array.from({ length: 12 }, (_, i) =>
                      String(i + 1).padStart(2, "0")
                    ).map((month) => {
                      if (
                        newUser.businessStartYear &&
                        Number(newUser.businessStartYear) === currentYear &&
                        Number(month) > currentMonth
                      ) {
                        return null;
                      }
                      return (
                        <option key={month} value={month}>
                          {Number(month)}月
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              {/* Knowledge Level */}
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1">
                  財務・会計の知識レベル
                </label>
                <select
                  name="financialKnowledge"
                  value={newUser.financialKnowledge}
                  onChange={handleNewUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {financialKnowledgeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={closeAddUserModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddNewUser}
                className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
