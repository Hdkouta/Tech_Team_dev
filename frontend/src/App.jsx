import { useEffect, useMemo, useState } from "react";
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

// グラフカードを表示
function ChartCard({ title, subtitle, description, children }) {
  return (
    <div className="bg-white rounded shadow p-3 flex flex-col">
 
      {/* タイトル */}
      <div className="mb-2">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
 
      {/* グラフエリア */}
      <div className="min-h-56 flex-1 border rounded p-2">
        {children}
      </div>
 
      {/* 説明 */}
      <p className="text-[10px] text-gray-400 mt-1">
        {description}
      </p>
 
    </div>
  );
}
 
// ダッシュボード全体を表示
function App() {
  const [allRows, setAllRows] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDataView, setShowDataView] = useState(false);
  const [metricDefinitions, setMetricDefinitions] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [definitionsResponse, metricsResponse] = await Promise.all([
          api.getApplicationMetricDefinitions(),
          api.getApplicationMetrics(),
        ]);

        const definitions = Array.isArray(definitionsResponse) ? definitionsResponse : [];
        const realRows = normalizeMetricRows(metricsResponse.rows || []);

        setMetricDefinitions(definitions);
        setAllRows(realRows);

        const months = Array.from(new Set(realRows.map((row) => row.target_month))).sort();
        const latestMonth = months[months.length - 1] || "";
        const latestYear = latestMonth ? latestMonth.slice(0, 4) : "";

        setSelectedYear((prev) => (prev ? prev : latestYear));
        setSelectedMonth((prev) => (prev && months.includes(prev) ? prev : latestMonth));
      } catch (e) {
        setMetricDefinitions([]);
        setAllRows([]);
        setSelectedYear("");
        setSelectedMonth("");
        setError("API取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const monthOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.target_month))).sort((a, b) => a.localeCompare(b));
  }, [allRows]);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => (row.target_month || "").slice(0, 4))))
      .filter((year) => /^\d{4}$/.test(year))
      .sort((a, b) => a.localeCompare(b));
  }, [allRows]);

  const monthOnlyOptions = useMemo(() => {
    if (!selectedYear) {
      return [];
    }
    return Array.from(
      new Set(
        monthOptions
          .filter((month) => month.startsWith(`${selectedYear}-`))
          .map((month) => month.slice(5, 7)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [monthOptions, selectedYear]);

  useEffect(() => {
    if (!selectedYear || monthOnlyOptions.length === 0) {
      return;
    }

    const selectedMonthOnly = selectedMonth ? selectedMonth.slice(5, 7) : "";
    if (!monthOnlyOptions.includes(selectedMonthOnly)) {
      setSelectedMonth(`${selectedYear}-${monthOnlyOptions[monthOnlyOptions.length - 1]}`);
    }
  }, [selectedYear, monthOnlyOptions, selectedMonth]);

  const rowsByMonth = useMemo(() => {
    const bucket = new Map();
    allRows.forEach((row) => {
      const key = row.target_month;
      if (!bucket.has(key)) {
        bucket.set(key, []);
      }
      bucket.get(key).push(row);
    });
    return bucket;
  }, [allRows]);

  const selectedRows = useMemo(() => rowsByMonth.get(selectedMonth) || [], [rowsByMonth, selectedMonth]);

  const selectedKpi = useMemo(
    () => makeSelectedKpi({ rowsByMonth, selectedRows, selectedMonth }),
    [rowsByMonth, selectedRows, selectedMonth],
  );

  const yearSeries = useMemo(() => makeYearSeries(rowsByMonth, selectedYear), [rowsByMonth, selectedYear]);

  const yoySeries = useMemo(() => makeYoySeries(rowsByMonth, selectedYear), [rowsByMonth, selectedYear]);

  const funnelSeries = useMemo(() => makeFunnelSeries(selectedRows), [selectedRows]);

  // 率を表示用に整形
  const formatRate = (value) => (value === null || value === undefined ? "-" : `${value.toFixed(1)}%`);
  // 増減率を符号付きで整形
  const formatSignedRate = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const achievementColor = selectedKpi.achievementRate !== null && selectedKpi.achievementRate >= 100
    ? "text-green-600"
    : "text-orange-500";
  const acceptanceColor = selectedKpi.acceptanceRate !== null && selectedKpi.acceptanceRate >= 10
    ? "text-blue-600"
    : "text-red-500";
  const yoyColor = selectedKpi.yoy !== null && selectedKpi.yoy >= 0 ? "text-blue-500" : "text-red-500";
 
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
 
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white px-4 py-3 sm:p-4 flex items-center justify-between gap-2">
        <h1 className="font-bold">採用KPIダッシュボード</h1>
        <TopPick
          selectedYear={selectedYear}
          yearOptions={yearOptions}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          monthOnlyOptions={monthOnlyOptions}
          onMonthChange={(monthOnly) => setSelectedMonth(`${selectedYear}-${monthOnly}`)}
          showDataView={showDataView}
          onToggleView={() => setShowDataView((prev) => !prev)}
        />
      </div>

      {showDataView ? (
        <Home />
      ) : (
        <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
        {error && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm rounded p-2">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-white p-3 rounded shadow text-sm text-gray-500">読み込み中...</div>
        )}
 
        {/* KPI */}
        <KpiCards
          selectedKpi={selectedKpi}
          formatRate={formatRate}
          formatSignedRate={formatSignedRate}
          achievementColor={achievementColor}
          acceptanceColor={acceptanceColor}
          yoyColor={yoyColor}
        />
 
        {/* クイック操作 */}
        <QuickBtns />
 
        {/* 分析（圧縮） */}
        <MiniInfo
          selectedKpi={selectedKpi}
          formatRate={formatRate}
          formatSignedRate={formatSignedRate}
          metricCount={metricDefinitions.length}
        />
 
        {/* ✅ グラフ（意味付き） */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
 
          <ChartCard
            title="目標 vs 実績"
            subtitle="棒：実績 / 線：目標"
          >
            <GoalResultChart data={yearSeries} />
          </ChartCard>
 
          <ChartCard
            title="前年比較"
            subtitle="当年 vs 前年"
          >
            <YearCompareChart data={yoySeries} />
          </ChartCard>
 
          <ChartCard
            title="達成率推移"
            subtitle="％推移・100%基準"
          >
            <RateTrendChart data={yearSeries} />
          </ChartCard>
 
          <ChartCard
            title="採用ファネル"
            subtitle="各ステージの実績（横棒）"
          >
            <StepBarChart data={funnelSeries} />
          </ChartCard>
 
        </div>
 
        </div>
      )}
    </div>
  );
}
 
export default App;
 
 