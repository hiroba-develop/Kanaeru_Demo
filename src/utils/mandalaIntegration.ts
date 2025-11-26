// mandalaIntegration.ts

// ===================================
// 型定義
// ===================================

export type PlMetric = "revenue" | "grossProfit" | "operatingProfit" | "netWorth";

export interface PlYearTarget {
  year: number;
  revenueTarget: number;
  grossProfitTarget: number;
  operatingProfitTarget: number;
  netWorthTarget: number;
}

export interface PlPlan {
  yearly: PlYearTarget[];
  tenYearTargetNetWorth: number;
}

interface YearlyActualInput {
  revenueActual?: number;
  grossProfitActual?: number;
  operatingProfitActual?: number;
  netWorthActual?: number;
}

// ★ MandalaCell 型を定義（MandalaChart.tsx と共有）
export interface MandalaCell {
  id: string;
  title: string;
  description?: string;
  achievement: number;
  status: "not_started" | "in_progress" | "achieved";
  isChecked?: boolean;
  plMetric?: PlMetric; // ★ A-1: PlMetric を追加
}

export type PlYearActual = {
  year: number;
  revenueActual: number;
  grossProfitActual: number;
  operatingProfitActual: number;
  netWorthActual: number;
};

export type PlActual = {
  yearly: PlYearActual[];
};

/**
 * PL実績値を読み込む
 */
export function loadPlActual(): PlActual | null {
  try {
    const stored = localStorage.getItem("pl_actual_v1");
    if (!stored) return null;
    return JSON.parse(stored) as PlActual;
  } catch (e) {
    console.error("loadPlActual error:", e);
    return null;
  }
}

/**
 * PL実績値を保存
 */
export function savePlActual(actual: PlActual): void {
  try {
    localStorage.setItem("pl_actual_v1", JSON.stringify(actual));
  } catch (e) {
    console.error("savePlActual error:", e);
  }
}

/**
 * PL計画を読み込む（既存の関数を export）
 */
export function loadPlPlan(): PlPlan | null {
  try {
    const stored = localStorage.getItem("pl_plan_v1");
    if (!stored) return null;
    return JSON.parse(stored) as PlPlan;
  } catch (e) {
    console.error("loadPlPlan error:", e);
    return null;
  }
}

interface MandalaSubChart {
  centerId: string;
  centerTitle: string;
  cells: MandalaCell[];
}

// ===================================
// ヘルパー関数
// ===================================

/**
 * タイトルからPL指標を自動判定
 */
export const detectPlMetricFromTitle = (
  title: string
): PlMetric | undefined => {
  const t = title.replace(/\s/g, "");

  if (/売上|売上高|売上目標/.test(t)) return "revenue";
  if (/粗利|粗利益/.test(t)) return "grossProfit";
  if (/営業利益/.test(t)) return "operatingProfit";
  if (/純資産|資産形成/.test(t)) return "netWorth";

  return undefined;
};

/**
 * テキストから金額を抽出
 * - カンマ & 空白(改行含む)は無視
 * - 最後に出てくる「数値＋単位（億 / 万 / 円）」を採用
 *   例) "売上1億→3億" → 3億を採用
 */
const extractAmountFromText = (text: string): number | null => {
  if (!text) return null;

  // カンマと空白（改行含む）を削除してから解析
  const normalized = text.replace(/[,\s]/g, "");

  // 文字列中に出てくる「数字＋単位」を全部拾う
  const regex = /(\d+(?:\.\d+)?)(億|万|円)?/g;
  let match: RegExpExecArray | null;
  let last: { num: number; unit?: string } | null = null;

  while ((match = regex.exec(normalized)) !== null) {
    const num = parseFloat(match[1]);
    const unit = match[2];
    last = { num, unit }; // 最後にマッチしたものを保持
  }

  if (!last) return null;

  let { num, unit } = last;

  if (unit === "億") num *= 100000000;
  else if (unit === "万") num *= 10000;

  return Math.round(num);
};

/**
 * テキストから「◯年目」を抽出
 * 1〜10の範囲のみ有効
 */
const extractYearIndexFromText = (text: string): number | null => {
  const match = text.match(/(\d+)年目/);
  if (!match) return null;
  const year = Number(match[1]);
  return year >= 1 && year <= 10 ? year : null;
};

// ===================================
// マンダラデータ取得
// ===================================

const getMandalaData = () => {
  const majorCells = JSON.parse(
    localStorage.getItem("mandala_major_cells_v2") || "[]"
  ) as MandalaCell[];
  
  const middleCharts = JSON.parse(
    localStorage.getItem("mandala_middle_charts_v2") || "{}"
  ) as Record<string, MandalaSubChart>;
  
  const minorCharts = JSON.parse(
    localStorage.getItem("mandala_minor_charts_v2") || "{}"
  ) as Record<string, MandalaSubChart>;

  return { majorCells, middleCharts, minorCharts };
};

// ===================================
// ① マンダラ → 年次PL 目標反映
// ===================================

/**
 * アンカー情報
 * priority:
 *   1: 大目標
 *   2: 中目標
 *   3: 小目標
 */
type Anchor = {
  year: number;     // 1〜10
  amount: number;   // 金額
  priority: number; // 大 < 中 < 小
};

/**
 * マンダラから10年分のPL計画を構築
 *
 * 仕様:
 * - 大 / 中 / 小 いずれも「年度あり＋金額あり」「年度なし＋金額あり」をサポート
 * - 年度なし＋金額あり → 10年目のアンカーとして扱う
 * - 大・中・小が同じ年度を指している場合は優先度 (小 > 中 > 大) で1つに絞る（加算しない）
 * - すべてのアンカーをまとめて 1 本のカーブにする
 *   例）大: 売上1億 / 中: 3年目3000万 / 7年目9000万
 *       → 0 → 3年目3000万 → 7年目9000万 → 10年目1億 を補間
 */
export const getPlPlanFromMandala = (): PlPlan | null => {
  const { majorCells, middleCharts, minorCharts } = getMandalaData();

  // ★ 最終目標（センター）もここで読む
  const centerGoal = localStorage.getItem("mandala_center_goal_v2") || "";

  const anchorsByMetric: Record<PlMetric, Anchor[]> = {
    revenue: [],
    grossProfit: [],
    operatingProfit: [],
    netWorth: [],
  };

  const addAnchor = (
    metric: PlMetric | undefined,
    year: number | null,
    amount: number | null,
    priority: number
  ) => {
    if (!metric) return;
    if (!year || year < 1 || year > 10) return;
    if (!amount || amount <= 0) return;
    anchorsByMetric[metric].push({ year, amount, priority });
  };

  // =========================
  // ★ 最終目標をアンカーとして追加（優先度 4 = 最強）
  // 例: 「純資産5000万円にする」「売上1億円稼ぐ」
  // =========================
  if (centerGoal) {
    const metric = detectPlMetricFromTitle(centerGoal);
    const amount = parseAmountFromText(centerGoal); // ← あなたが下に定義したやつ
    const yearInTitle = extractYearIndexFromText(centerGoal); // 「◯年目」があれば使う
    const anchorYear = amount ? yearInTitle ?? 10 : null; // 年指定なければ10年目扱い

    if (anchorYear) {
      addAnchor(metric, anchorYear, amount, 4); // priority 4: 大中小より強く上書き
    }
  }

  // =========================
  // ここからは今までの「大・中・小目標 → アンカー」ロジックをそのまま使用
  // =========================
  majorCells.forEach((majorCell) => {
    const majorMetric = detectPlMetricFromTitle(majorCell.title);

    // 大目標自身
    const majorAmount = extractAmountFromText(majorCell.title);
    const majorYearInTitle = extractYearIndexFromText(majorCell.title);
    const majorAnchorYear = majorAmount
      ? majorYearInTitle ?? 10 // 年度指定なしなら10年目
      : null;

    if (majorAnchorYear) {
      addAnchor(majorMetric, majorAnchorYear, majorAmount, 1);
    }

    const middleChart = middleCharts[majorCell.id];
    if (!middleChart) return;

    middleChart.cells.forEach((middleCell) => {
      // 中目標は plMetric > タイトル > 大目標 の順で指標判定
      let metric: PlMetric | undefined = middleCell.plMetric;
      if (!metric) metric = detectPlMetricFromTitle(middleCell.title);
      if (!metric) metric = majorMetric;

      // 中目標自身
      const middleAmount = extractAmountFromText(middleCell.title);
      const middleYearInTitle = extractYearIndexFromText(middleCell.title);
      const middleAnchorYear = middleAmount ? middleYearInTitle ?? 10 : null;

      if (middleAnchorYear) {
        addAnchor(metric, middleAnchorYear, middleAmount, 2);
      }

      // 小目標
      const minorChart = minorCharts[middleCell.id];
      if (!minorChart) return;

      minorChart.cells.forEach((minorCell) => {
        const minorAmount = extractAmountFromText(minorCell.title);
        const minorYearInTitle = extractYearIndexFromText(minorCell.title);
        const minorAnchorYear = minorAmount ? minorYearInTitle ?? 10 : null;

        if (minorAnchorYear) {
          // 小目標は metric を中目標から継承
          addAnchor(metric, minorAnchorYear, minorAmount, 3);
        }
      });
    });
  });

  // アンカーが1つも無ければ null を返す
  const hasAnyAnchor = (Object.keys(anchorsByMetric) as PlMetric[]).some(
    (m) => anchorsByMetric[m].length > 0
  );
  if (!hasAnyAnchor) return null;

  // ---- 年次ターゲットを初期化 ----
  const yearly: PlYearTarget[] = Array.from({ length: 10 }, (_, i) => ({
    year: i + 1,
    revenueTarget: 0,
    grossProfitTarget: 0,
    operatingProfitTarget: 0,
    netWorthTarget: 0,
  }));

  // ---- 各指標ごとに 1 本のカーブを作る ----
  (Object.keys(anchorsByMetric) as PlMetric[]).forEach((metric) => {
    const anchors = anchorsByMetric[metric];
    if (anchors.length === 0) return;

    // 1) 年度ごとに最優先のアンカーを1個に絞る
    const bestAnchorByYear: Record<number, { amount: number; priority: number }> = {};

    anchors.forEach((a) => {
      const current = bestAnchorByYear[a.year];
      if (!current || a.priority > current.priority) {
        bestAnchorByYear[a.year] = { amount: a.amount, priority: a.priority };
      }
    });

    const anchorYears = Object.keys(bestAnchorByYear)
      .map((y) => Number(y))
      .sort((a, b) => a - b);

    if (anchorYears.length === 0) return;

    // 2) アンカー列からセグメントを作る
    type Segment = {
      startYear: number;
      endYear: number;
      startAmount: number;
      endAmount: number;
    };

    const segments: Segment[] = [];

    // 最初は「1年目:0」→ 最初のアンカー というセグメント
    let prevYear = 0;
    let prevAmount = 0;

    anchorYears.forEach((year) => {
      const amount = bestAnchorByYear[year].amount;
      segments.push({
        startYear: prevYear,
        endYear: year,
        startAmount: prevAmount,
        endAmount: amount,
      });
      prevYear = year;
      prevAmount = amount;
    });

    // 最後のアンカーが10年目より前なら、その後はフラットで10年目まで伸ばす
    if (prevYear < 10) {
      segments.push({
        startYear: prevYear,
        endYear: 10,
        startAmount: prevAmount,
        endAmount: prevAmount,
      });
    }

    // 3) 各年の金額をセグメントから線形補間
    for (let year = 1; year <= 10; year++) {
      const seg = segments.find(
        (s) => year >= s.startYear && year <= s.endYear
      );
      if (!seg) continue;

      let amount: number;
      if (seg.endYear === seg.startYear) {
        amount = seg.endAmount;
      } else {
        const t =
          (year - seg.startYear) / (seg.endYear - seg.startYear); // 0〜1
        amount = seg.startAmount + (seg.endAmount - seg.startAmount) * t;
      }

      // ★ 万円単位に丸める
      amount = Math.round(amount / 10000) * 10000;

      const targetField = `${metric}Target` as keyof PlYearTarget;
      yearly[year - 1][targetField] = amount;
    }
  });

  const tenYearTargetNetWorth = yearly[9].netWorthTarget;

  // 全年全指標が0なら null を返す
  const hasAnyPlValue = yearly.some(
    (y) =>
      y.revenueTarget ||
      y.grossProfitTarget ||
      y.operatingProfitTarget ||
      y.netWorthTarget
  );
  if (!hasAnyPlValue) return null;

  const plan: PlPlan = {
    yearly,
    tenYearTargetNetWorth,
  };

  return plan;
};

// 全角数字 → 半角数字
const toHalfWidthNumber = (text: string): string => {
  return text.replace(/[０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
  );
};

/**
 * 「1億円」「5000万」「1億5000万」「50000000」みたいなテキストから
 * 「円単位の数値」を推定して返す
 */
export const parseAmountFromText = (text: string): number => {
  if (!text) return 0;

  const normalized = toHalfWidthNumber(text).replace(/,/g, "");

  let total = 0;

  // 例: 1億 / 1.5億 / 2億円
  const okuMatch = normalized.match(/(\d+(?:\.\d+)?)億/);
  if (okuMatch) {
    total += parseFloat(okuMatch[1]) * 100_000_000;
  }

  // 例: 5000万 / 5000万円
  const manMatch = normalized.match(/(\d+(?:\.\d+)?)万/);
  if (manMatch) {
    total += parseFloat(manMatch[1]) * 10_000;
  }

  // 「億」「万」が一切出てこない場合: 純粋な数字 or xxx円
  if (!okuMatch && !manMatch) {
    const plainMatch = normalized.match(/(\d+(?:\.\d+)?)/);
    if (plainMatch) {
      total += parseFloat(plainMatch[1]);
    }
  }

  return Math.round(total);
};

/**
 * マンダラ目標更新時のフック
 * - MandalaChart から呼ばれる
 */
export const onMandalaGoalUpdate = () => {
  const plPlan = getPlPlanFromMandala();

  if (plPlan) {
    localStorage.setItem("pl_plan_v1", JSON.stringify(plPlan));
  } else {
    localStorage.removeItem("pl_plan_v1");
  }

  // 年次PL画面に更新を通知（必要ならリスナー側で使う）
  window.dispatchEvent(new CustomEvent("pl-plan-updated"));

  return plPlan;
};

// ===================================
// ② 年次PL 実績 → マンダラ達成更新
// ===================================

/**
 * 年次実績入力時にマンダラを更新
 * - 今は YearlyBudgetActual から呼ばれる想定
 */
export const onYearlyActualUpdate = (
  year: number,
  actuals: YearlyActualInput
): boolean => {
  const { majorCells, middleCharts, minorCharts } = getMandalaData();

  let updated = false;
  const ACHIEVED_THRESHOLD = 1.0;

  const plPlan = getPlPlanFromMandala();
  if (!plPlan) return false;

  const yearTarget = plPlan.yearly.find((y) => y.year === year);
  if (!yearTarget) return false;

  const achievements: Partial<Record<PlMetric, number>> = {};

  if (actuals.revenueActual !== undefined && yearTarget.revenueTarget > 0) {
    achievements.revenue = actuals.revenueActual / yearTarget.revenueTarget;
  }
  if (
    actuals.grossProfitActual !== undefined &&
    yearTarget.grossProfitTarget > 0
  ) {
    achievements.grossProfit =
      actuals.grossProfitActual / yearTarget.grossProfitTarget;
  }
  if (
    actuals.operatingProfitActual !== undefined &&
    yearTarget.operatingProfitTarget > 0
  ) {
    achievements.operatingProfit =
      actuals.operatingProfitActual / yearTarget.operatingProfitTarget;
  }
  if (actuals.netWorthActual !== undefined && yearTarget.netWorthTarget > 0) {
    achievements.netWorth = actuals.netWorthActual / yearTarget.netWorthTarget;
  }

  majorCells.forEach((majorCell) => {
    const middleChart = middleCharts[majorCell.id];

    // ① 大目標の PL 達成状況を反映
    let majorYear = extractYearIndexFromText(majorCell.title);
    if (majorYear === null) majorYear = 10;

    const majorMetric = detectPlMetricFromTitle(majorCell.title);

    if (majorMetric && majorYear === year && achievements[majorMetric] != null) {
      const rate = achievements[majorMetric]!;
      const achievement = Math.round(Math.min(rate, 1) * 100);

      majorCell.achievement = achievement;
      majorCell.status =
        rate >= ACHIEVED_THRESHOLD
          ? "achieved"
          : rate > 0
          ? "in_progress"
          : "not_started";

      updated = true;
    }

    if (!middleChart) return;

    middleChart.cells.forEach((middleCell) => {
      let metric: PlMetric | undefined =
        middleCell.plMetric || detectPlMetricFromTitle(middleCell.title);
    
      if (!metric) return;
      if (!(metric in achievements)) return;
    
      // ★ 中目標の年は参照用としてだけ持つ（ここではフィルタしない）
      const middleYearRaw = extractYearIndexFromText(middleCell.title);
      const middleYear = middleYearRaw ?? null;
    
      const rate = achievements[metric]!;
      const minorChart = minorCharts[middleCell.id];
      if (!minorChart) return;
    
      let hasMinorGoalForYear = false;
    
      minorChart.cells.forEach((minorCell) => {
        // plMetric が設定されていない場合は、タイトルから検出して保存
        if (!minorCell.plMetric && minorCell.title) {
          const detectedMetric = detectPlMetricFromTitle(minorCell.title);
          if (detectedMetric) {
            minorCell.plMetric = detectedMetric;
          }
        }
    
        // PL項目の小目標のみ処理
        if (minorCell.plMetric !== metric) return;
    
        // ★ 年の決め方：
        //    小目標 > 中目標 > 大目標(majorYear) > 今回の year
        const rawYear = extractYearIndexFromText(minorCell.title);
        const cellYear =
          rawYear ??
          middleYear ??
          majorYear ?? // ← この majorYear は、少し上で majorCell から取っているやつをそのまま使ってOK
          year;
    
        if (cellYear !== year) return;
    
        hasMinorGoalForYear = true;
    
        const isAchieved = rate >= ACHIEVED_THRESHOLD;
        minorCell.isChecked = isAchieved;
        minorCell.achievement = Math.round(Math.min(rate, 1) * 100);
        minorCell.status = isAchieved
          ? "achieved"
          : rate > 0
          ? "in_progress"
          : "not_started";
    
        updated = true;
      });
    
      // ★ hasMinorGoalForYear の扱いはそのままでOK
      if (hasMinorGoalForYear) {
        const checkedCount = minorChart.cells.filter((c) => c.isChecked).length;
        middleCell.achievement = Math.round(
          (checkedCount / minorChart.cells.length) * 100
        );
      } else {
        middleCell.achievement = Math.round(Math.min(achievements[metric]!, 1) * 100);
      }
    
      middleCell.status =
        rate >= ACHIEVED_THRESHOLD
          ? "achieved"
          : rate > 0
          ? "in_progress"
          : "not_started";
    
      updated = true;
    });
  });

  if (updated) {
    localStorage.setItem("mandala_major_cells_v2", JSON.stringify(majorCells));
    localStorage.setItem(
      "mandala_middle_charts_v2",
      JSON.stringify(middleCharts)
    );
    localStorage.setItem(
      "mandala_minor_charts_v2",
      JSON.stringify(minorCharts)
    );
    window.dispatchEvent(new CustomEvent("mandala-updated"));
  }

  return updated;
};