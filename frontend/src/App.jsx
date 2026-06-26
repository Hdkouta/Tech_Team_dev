import { useCallback, useEffect, useMemo, useState } from "react";
import Home from "./data";
import * as api from "./api";

import RateTrendChart from "./component/graph/RateChart";
import StepBarChart from "./component/graph/StepChart";
import GoalResultChart from "./component/graph/GoalChart";
import YearCompareChart from "./component/graph/YearChart";

import TopPick from "./component/panel/TopPick";
import KpiCards from "./component/panel/KpiCards";
import MiniInfo from "./component/panel/MiniInfo";
import LatestInputData from "./component/panel/LatestInputData";
import UnifiedInputModal from "./component/modals/UnifiedInputModal";

import {
  makeFunnelSeries,
  makeSelectedKpi,
  makeYearSeries,
  makeYoySeries,
  normalizeMetricRows,
} from "./dataMath";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

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
  const [openInputModal, setOpenInputModal] = useState(false);
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [metricForm, setMetricForm] = useState({
    metric_definition_id: "",
    target_month: "",
    target_total: "",
    actual_total: "",
    actual_new_graduate: "",
    actual_mid_career: "",
    memo: "",
  });

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

  const handleOpenInputFromDashboard = () => {
    const requestYear = selectedYear || String(new Date().getFullYear());
    const currentMonthNumber = String(new Date().getMonth() + 1).padStart(2, "0");

    setModalError("");
    setMetricForm((prev) => ({
      ...prev,
      metric_definition_id:
        prev.metric_definition_id || metricDefinitions[0]?.id || "",
      target_month: `${requestYear}-${currentMonthNumber}`,
    }));
    setOpenInputModal(true);
  };

  const handleSaveMetric = async () => {
    setModalError("");

    const selectedDefinition =
      metricDefinitions.find(
        (item) => item.id === Number(metricForm.metric_definition_id)
      ) || null;

    if (
      !metricForm.metric_definition_id ||
      !metricForm.target_month ||
      metricForm.target_total === ""
    ) {
      setModalError("指標、対象年月、目標（合計）を入力してください");
      return;
    }

    if (!MONTH_PATTERN.test(metricForm.target_month)) {
      setModalError("対象年月はYYYY-MM形式で入力してください");
      return;
    }

    if (
      selectedDefinition?.supports_breakdown
        ? metricForm.actual_new_graduate === "" || metricForm.actual_mid_career === ""
        : metricForm.actual_total === ""
    ) {
      setModalError("実績値を入力してください");
      return;
    }

    try {
      const allMetrics = await api.getApplicationMetrics();
      const hasDuplicateMonth = (allMetrics.rows || []).some(
        (row) =>
          Number(row.metric_definition_id) === Number(metricForm.metric_definition_id) &&
          row.target_month === metricForm.target_month
      );

      if (hasDuplicateMonth) {
        setModalError("年月に重複したデータがあります");
        return;
      }

      setSaving(true);

      await api.upsertApplicationMetric({
        month: metricForm.target_month,
        metric_definition_id: Number(metricForm.metric_definition_id),
        target_total: Number(metricForm.target_total),
        actual_total: selectedDefinition?.supports_breakdown
          ? 0
          : Number(metricForm.actual_total),
        actual_new_graduate: selectedDefinition?.supports_breakdown
          ? Number(metricForm.actual_new_graduate)
          : Number(metricForm.actual_total),
        actual_mid_career: selectedDefinition?.supports_breakdown
          ? Number(metricForm.actual_mid_career)
          : 0,
        memo: metricForm.memo,
      });

      const savedYear = metricForm.target_month.slice(0, 4);
      setSelectedYear(savedYear);
      setSelectedMonth(metricForm.target_month);

      await loadDashboard();

      setMetricForm((prev) => ({
        ...prev,
        target_total: "",
        actual_total: "",
        actual_new_graduate: "",
        actual_mid_career: "",
        memo: "",
      }));
      setOpenInputModal(false);
    } catch (e) {
      const message =
        e?.response?.data?.error || "保存に失敗しました";
      setModalError(message);
    } finally {
      setSaving(false);
    }
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

  const latestInputRow = useMemo(() => {
    if (allRows.length === 0) return null;

    return [...allRows].sort((a, b) => {
      const monthDiff = (b.target_month || "").localeCompare(a.target_month || "");
      if (monthDiff !== 0) return monthDiff;

      return Number(b.id || 0) - Number(a.id || 0);
    })[0];
  }, [allRows]);

  const latestInputMetricName = useMemo(() => {
    if (!latestInputRow) return "-";

    return (
      metricDefinitions.find(
        (item) => Number(item.id) === Number(latestInputRow.metric_definition_id)
      )?.name || "-"
    );
  }, [latestInputRow, metricDefinitions]);

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
        <h1 className="font-bold text-lg">
          RecruView
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

          {/* 月表示*/}
          <div className="flex items-center justify-between w-full">
            <p className="font-bold text-lg">
              {formatMonthDisplay(selectedMonth)}
            </p>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={handleOpenInputFromDashboard}
            >
              ＋
            </button>
          </div>

          <LatestInputData
            latestInputRow={latestInputRow}
            latestInputMetricName={latestInputMetricName}
            formatMonthDisplay={formatMonthDisplay}
          />

          {/* KPI */}
          <KpiCards
            selectedKpi={selectedKpi}
            formatRate={formatRate}
            formatSignedRate={formatSignedRate}
          />

          <MiniInfo
            selectedKpi={selectedKpi}
            formatRate={formatRate}
            formatSignedRate={formatSignedRate}
            metricCount={metricDefinitions.length}
          />

          {/* グラフ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <ChartCard title="目標/実績">
              <GoalResultChart data={yearSeries} />
            </ChartCard>

            <ChartCard title="エントリー数の前年比較">
              <YearCompareChart data={yoySeries} />
            </ChartCard>

            <ChartCard title="達成率">
              <RateTrendChart data={yearSeries} />
            </ChartCard>

            <ChartCard title="採用ファネル">
              <StepBarChart data={funnelSeries} />
            </ChartCard>
          </div>
        </div>
      )}

      <UnifiedInputModal
        open={openInputModal}
        onClose={() => {
          setModalError("");
          setOpenInputModal(false);
        }}
        title="応募データ入力"
        definitions={metricDefinitions}
        form={metricForm}
        setForm={setMetricForm}
        errorMessage={modalError}
        onSave={handleSaveMetric}
        saving={saving}
      />
    </div>
  );
}

export default App;