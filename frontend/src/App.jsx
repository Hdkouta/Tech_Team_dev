import { useCallback, useEffect, useMemo, useState } from "react";
import Home from "./data";
import * as api from "./api";

import RateTrendChart from "./component/graph/RateChart";
import StepBarChart from "./component/graph/StepChart";
import GoalResultChart from "./component/graph/GoalChart";
import YearCompareChart from "./component/graph/YearChart";

import TopPick from "./component/panel/TopPick";
import KpiCards from "./component/panel/KpiCards";
import QuickBtns from "./component/panel/QuickBtns";
import MiniInfo from "./component/panel/MiniInfo";

import {
  makeFunnelSeries,
  makeSelectedKpi,
  makeYearSeries,
  makeYoySeries,
  normalizeMetricRows,
} from "./dataMath";

// =========================
// 月表示フォーマット関数（追加）
// =========================
const formatMonthDisplay = (ym) => {
  if (!ym) return "-";
  const [year, month] = ym.split("-");
  return `${year}年 ${Number(month)}月`;
};

// =========================
// グラフカード
// =========================
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded shadow p-3 flex flex-col">
      <div className="mb-2">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <div className="min-h-56 flex-1 border rounded p-2">
        {children}
      </div>
    </div>
  );
}

// =========================
// メイン
// =========================
function App() {
  const [allRows, setAllRows] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDataView, setShowDataView] = useState(false);
  const [metricDefinitions, setMetricDefinitions] = useState([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [definitionsResponse, metricsResponse] =
        await Promise.all([
          api.getApplicationMetricDefinitions(),
          api.getApplicationMetrics(),
        ]);

      const definitions = Array.isArray(definitionsResponse)
        ? definitionsResponse
        : [];

      const realRows = normalizeMetricRows(
        metricsResponse.rows || []
      );

      setMetricDefinitions(definitions);
      setAllRows(realRows);

      const months = Array.from(
        new Set(realRows.map((row) => row.target_month))
      ).sort();

      const latestMonth = months[months.length - 1] || "";
      const latestYear = latestMonth
        ? latestMonth.slice(0, 4)
        : "";

      setSelectedYear((prev) => (prev ? prev : latestYear));
      setSelectedMonth((prev) =>
        prev && months.includes(prev) ? prev : latestMonth
      );
    } catch (e) {
      setMetricDefinitions([]);
      setAllRows([]);
      setSelectedYear("");
      setSelectedMonth("");
      setError("API取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // 初期ロード
  // =========================
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleToggleView = async () => {
    if (showDataView) {
      // データ入力画面から戻る時に最新データを再取得
      await loadDashboard();
    }
    setShowDataView((prev) => !prev);
  };

  // =========================
  // 月・年オプション
  // =========================
  const monthOptions = useMemo(() => {
    return Array.from(
      new Set(allRows.map((row) => row.target_month))
    ).sort((a, b) => a.localeCompare(b));
  }, [allRows]);

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(
        allRows.map((row) =>
          (row.target_month || "").slice(0, 4)
        )
      )
    )
      .filter((year) => /^\d{4}$/.test(year))
      .sort();
  }, [allRows]);

  const monthOnlyOptions = useMemo(() => {
    if (!selectedYear) return [];

    return Array.from(
      new Set(
        monthOptions
          .filter((m) =>
            m.startsWith(`${selectedYear}-`)
          )
          .map((m) => m.slice(5, 7))
      )
    ).sort();
  }, [monthOptions, selectedYear]);

  // =========================
  // 年変更時の補正
  // =========================
  useEffect(() => {
    if (!selectedYear || monthOnlyOptions.length === 0) return;

    const current = selectedMonth
      ? selectedMonth.split("-")[1]
      : "";

    if (!monthOnlyOptions.includes(current)) {
      setSelectedMonth(
        `${selectedYear}-${
          monthOnlyOptions[monthOnlyOptions.length - 1]
        }`
      );
    }
  }, [selectedYear, monthOnlyOptions]);

  // =========================
  // データ加工
  // =========================
  const rowsByMonth = useMemo(() => {
    const map = new Map();
    allRows.forEach((row) => {
      const key = row.target_month;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return map;
  }, [allRows]);

  const selectedRows = useMemo(
    () => rowsByMonth.get(selectedMonth) || [],
    [rowsByMonth, selectedMonth]
  );

  const selectedKpi = useMemo(
    () =>
      makeSelectedKpi({
        rowsByMonth,
        selectedRows,
        selectedMonth,
      }),
    [rowsByMonth, selectedRows, selectedMonth]
  );

  const yearSeries = useMemo(
    () => makeYearSeries(rowsByMonth, selectedYear),
    [rowsByMonth, selectedYear]
  );

  const yoySeries = useMemo(
    () => makeYoySeries(rowsByMonth, selectedYear),
    [rowsByMonth, selectedYear]
  );

  const funnelSeries = useMemo(
    () => makeFunnelSeries(selectedRows),
    [selectedRows]
  );

  // =========================
  // 表示用フォーマット
  // =========================
  const formatRate = (value) =>
    value == null ? "-" : `${value.toFixed(1)}%`;

  const formatSignedRate = (value) =>
    value == null
      ? "-"
      : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

  // =========================
  // 描画
  // =========================
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between">
        <h1 className="font-bold">
          採用KPIダッシュボード
        </h1>

        <TopPick
          selectedYear={selectedYear}
          yearOptions={yearOptions}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          monthOnlyOptions={monthOnlyOptions}
          onMonthChange={(m) =>
            setSelectedMonth(`${selectedYear}-${m}`)
          }
          showDataView={showDataView}
          onToggleView={handleToggleView}
        />
      </div>

      {showDataView ? (
        <Home onMetricsChanged={loadDashboard} />
      ) : (
        <div className="p-4 flex flex-col gap-4">

          {/* ✅ 月表示（ここが今回のゴール） */}
          <p className="font-bold text-lg">
            {formatMonthDisplay(selectedMonth)}
          </p>

          {/* KPI */}
          <KpiCards
            selectedKpi={selectedKpi}
            formatRate={formatRate}
            formatSignedRate={formatSignedRate}
          />

          <QuickBtns />

          <MiniInfo
            selectedKpi={selectedKpi}
            formatRate={formatRate}
            formatSignedRate={formatSignedRate}
            metricCount={metricDefinitions.length}
          />

          {/* グラフ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <ChartCard title="目標 vs 実績">
              <GoalResultChart data={yearSeries} />
            </ChartCard>

            <ChartCard title="前年比較">
              <YearCompareChart data={yoySeries} />
            </ChartCard>

            <ChartCard title="達成率推移">
              <RateTrendChart data={yearSeries} />
            </ChartCard>

            <ChartCard title="採用ファネル">
              <StepBarChart data={funnelSeries} />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;