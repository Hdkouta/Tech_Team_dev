export const METRIC_CODE = {
  totalEntries: "total_entries_with_scout",
  ownEntries: "own_entries_with_referral",
  firstInterview: "own_entries_first_interview",
  secondInterview: "own_entries_second_interview",
  finalInterview: "own_entries_final_interview",
  offerNotice: "own_entries_offer_notice",
  offerAcceptance: "own_entries_offer_acceptance",
};

// 値を安全に数値化
export const toNum = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

// 前年同月を作成
export const getPreviousYearMonth = (month) => {
  if (!month || month.length < 7) {
    return "";
  }
  const year = Number(month.slice(0, 4)) - 1;
  return `${year}-${month.slice(5, 7)}`;
};

// 指標コードで値を取得
export const getValueByCode = (rows, metricCode, key) => {
  const row = rows.find((item) => item.metric_code === metricCode);
  return row ? toNum(row[key]) : 0;
};

// 行データを表示用に整形
export const normalizeMetricRows = (rows = []) => {
  return rows.map((row) => {
    const actualNewGraduate = toNum(row.actual_new_graduate);
    const actualMidCareer = toNum(row.actual_mid_career);
    const targetTotal = toNum(row.target_total);
    const actualTotal = actualNewGraduate + actualMidCareer;
    const gap = actualTotal - targetTotal;
    const achievementRate =
      targetTotal === 0 ? null : Number(((actualTotal / targetTotal) * 100).toFixed(1));

    return {
      ...row,
      month: row.target_month,
      actual_total: actualTotal,
      gap,
      achievement_rate: achievementRate,
    };
  });
};

// 選択月のKPIを計算
export const makeSelectedKpi = ({ rowsByMonth, selectedRows, selectedMonth }) => {
  const entriesActual =
    getValueByCode(selectedRows, METRIC_CODE.totalEntries, "actual_total")
    || selectedRows.reduce((sum, row) => sum + toNum(row.actual_total), 0);
  const entriesTarget =
    getValueByCode(selectedRows, METRIC_CODE.totalEntries, "target_total")
    || selectedRows.reduce((sum, row) => sum + toNum(row.target_total), 0);
  const acceptanceActual = getValueByCode(selectedRows, METRIC_CODE.offerAcceptance, "actual_total");
  const firstInterviewActual = getValueByCode(selectedRows, METRIC_CODE.firstInterview, "actual_total");
  const finalInterviewActual = getValueByCode(selectedRows, METRIC_CODE.finalInterview, "actual_total");

  const previousYearEntries = getValueByCode(
    rowsByMonth.get(getPreviousYearMonth(selectedMonth)) || [],
    METRIC_CODE.totalEntries,
    "actual_total",
  );

  const achievementRate = entriesTarget > 0 ? (entriesActual / entriesTarget) * 100 : null;
  const acceptanceRate = entriesActual > 0 ? (acceptanceActual / entriesActual) * 100 : null;
  const passRate = firstInterviewActual > 0 ? (finalInterviewActual / firstInterviewActual) * 100 : null;
  const yoy =
    previousYearEntries > 0
      ? ((entriesActual - previousYearEntries) / previousYearEntries) * 100
      : null;

  return {
    entriesActual,
    entriesTarget,
    acceptanceActual,
    achievementRate,
    acceptanceRate,
    passRate,
    yoy,
  };
};

// 年間の月別推移を作成
export const makeYearSeries = (rowsByMonth, selectedYear) => {
  if (!selectedYear) {
    return [];
  }

  return Array.from({ length: 12 }, (_, i) => {
    const month = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
    const monthRows = rowsByMonth.get(month) || [];
    const entriesActual = getValueByCode(monthRows, METRIC_CODE.totalEntries, "actual_total");
    const entriesTarget = getValueByCode(monthRows, METRIC_CODE.totalEntries, "target_total");
    const achievementRate =
      entriesTarget > 0 ? Number(((entriesActual / entriesTarget) * 100).toFixed(1)) : null;

    return {
      month,
      monthLabel: `${i + 1}月`,
      entriesActual,
      entriesTarget,
      achievementRate,
    };
  });
};

// 前年比較の系列を作成
export const makeYoySeries = (rowsByMonth, selectedYear) => {
  if (!selectedYear) {
    return [];
  }

  const currentYear = Number(selectedYear);
  const previousYear = currentYear - 1;

  return Array.from({ length: 12 }, (_, i) => {
    const currentMonth = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
    const previousMonth = `${previousYear}-${String(i + 1).padStart(2, "0")}`;
    const currentRows = rowsByMonth.get(currentMonth) || [];
    const previousRows = rowsByMonth.get(previousMonth) || [];

    return {
      monthLabel: `${i + 1}月`,
      currentYear: getValueByCode(currentRows, METRIC_CODE.totalEntries, "actual_total"),
      previousYear: getValueByCode(previousRows, METRIC_CODE.totalEntries, "actual_total"),
    };
  });
};

// ファネル用データを作成
export const makeFunnelSeries = (selectedRows) => {
  const items = [
    { name: "総エントリー", code: METRIC_CODE.totalEntries },
    { name: "1次面接", code: METRIC_CODE.firstInterview },
    { name: "2次面接", code: METRIC_CODE.secondInterview },
    { name: "最終面接", code: METRIC_CODE.finalInterview },
    { name: "内定通知", code: METRIC_CODE.offerNotice },
    { name: "内定承諾", code: METRIC_CODE.offerAcceptance },
  ];

  return items.map((item) => ({
    stage: item.name,
    value: getValueByCode(selectedRows, item.code, "actual_total"),
  }));
};
