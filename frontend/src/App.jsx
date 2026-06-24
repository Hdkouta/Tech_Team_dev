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

import {
  makeFunnelSeries,
  makeSelectedKpi,
  makeYearSeries,
  makeYoySeries,
  normalizeMetricRows,
} from "./dataMath";

// =========================
// 現在年月を YYYY-MM で取得
// =========================
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

// =========================
// 月表示フォーマット関数
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
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      <div className="min-h-56 flex-1 border rounded p-2">{children}</div>
    </div>
  );
}

// =========================
// データ入力モーダル
// =========================
function InputModal({
  isOpen,
  onClose,
  metricDefinitions,
  defaultMonth,
  onSaved,
}) {
  const [month, setMonth] = useState(defaultMonth || getCurrentMonth());
  const [metricDefinitionId, setMetricDefinitionId] = useState("");
  const [targetTotal, setTargetTotal] = useState("");
  const [actualNewGraduate, setActualNewGraduate] = useState("");
  const [actualMidCareer, setActualMidCareer] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // モーダルを開いたときに初期値をセット
  useEffect(() => {
    if (!isOpen) return;

    setMonth(defaultMonth || getCurrentMonth());
    setMetricDefinitionId(
      metricDefinitions.length > 0 ? String(metricDefinitions[0].id) : ""
    );
    setTargetTotal("");
    setActualNewGraduate("");
    setActualMidCareer("");
    setMemo("");
    setError("");
  }, [isOpen, defaultMonth, metricDefinitions]);

  if (!isOpen) return null;

  const selectedDefinition = metricDefinitions.find(
    (item) => String(item.id) === String(metricDefinitionId)
  );

  const supportsBreakdown = selectedDefinition?.supports_breakdown;

  const handleSave = async () => {
    setError("");

    if (!month) {
      setError("対象月を入力してください。");
      return;
    }

    if (!metricDefinitionId) {
      setError("指標を選択してください。");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        month,
        metric_definition_id: Number(metricDefinitionId),
        target_total: Number(targetTotal || 0),
        actual_new_graduate: Number(actualNewGraduate || 0),
        actual_mid_career: supportsBreakdown
          ? Number(actualMidCareer || 0)
          : 0,
        memo,
      };

      await api.upsertApplicationMetric(payload);

      await onSaved();

      onClose();
    } catch (e) {
      console.error(e);
      setError("保存に失敗しました。入力内容またはAPIを確認してください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-5">
        {/* タイトル */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">データ入力</h2>

          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* エラー */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm mb-3">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* 対象月 */}
          <div>
            <label className="block text-sm font-medium mb-1">対象月</label>
            <input
              type="month"
              className="border rounded px-3 py-2 w-full"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          {/* 指標 */}
          <div>
            <label className="block text-sm font-medium mb-1">指標</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={metricDefinitionId}
              onChange={(e) => setMetricDefinitionId(e.target.value)}
            >
              {metricDefinitions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* 目標 */}
          <div>
            <label className="block text-sm font-medium mb-1">目標</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={targetTotal}
              onChange={(e) => setTargetTotal(e.target.value)}
              placeholder="例：100"
            />
          </div>

          {/* 実績 */}
          {supportsBreakdown ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  実績：新卒
                </label>
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={actualNewGraduate}
                  onChange={(e) => setActualNewGraduate(e.target.value)}
                  placeholder="例：40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  実績：中途
                </label>
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={actualMidCareer}
                  onChange={(e) => setActualMidCareer(e.target.value)}
                  placeholder="例：30"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">実績</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={actualNewGraduate}
                onChange={(e) => setActualNewGraduate(e.target.value)}
                placeholder="例：70"
              />
            </div>
          )}

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium mb-1">メモ</label>
            <textarea
              className="border rounded px-3 py-2 w-full"
              rows="3"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="補足があれば入力してください"
            />
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            onClick={onClose}
            disabled={saving}
          >
            キャンセル
          </button>

          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
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

  // false: ダッシュボード画面
  // true : データ一覧画面
  const [showDataView, setShowDataView] = useState(false);

  // ＋ボタン用：入力モーダル表示
  const [showInputModal, setShowInputModal] = useState(false);

  const [metricDefinitions, setMetricDefinitions] = useState([]);

  // =========================
  // ダッシュボード読み込み
  // =========================
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [definitionsResponse, metricsResponse] = await Promise.all([
        api.getApplicationMetricDefinitions(),
        api.getApplicationMetrics(),
      ]);

      const definitions = Array.isArray(definitionsResponse)
        ? definitionsResponse
        : [];

      const realRows = normalizeMetricRows(metricsResponse.rows || []);

      setMetricDefinitions(definitions);
      setAllRows(realRows);

      const months = Array.from(
        new Set(realRows.map((row) => row.target_month))
      ).sort();

      const latestMonth = months[months.length - 1] || "";
      const latestYear = latestMonth ? latestMonth.slice(0, 4) : "";

      setSelectedYear((prev) => (prev ? prev : latestYear));
      setSelectedMonth((prev) =>
        prev && months.includes(prev) ? prev : latestMonth
      );
    } catch (e) {
      console.error(e);

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

  // =========================
  // 月・年オプション
  // =========================
  const monthOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.target_month))).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [allRows]);

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(allRows.map((row) => (row.target_month || "").slice(0, 4)))
    )
      .filter((year) => /^\d{4}$/.test(year))
      .sort();
  }, [allRows]);

  const monthOnlyOptions = useMemo(() => {
    if (!selectedYear) return [];

    return Array.from(
      new Set(
        monthOptions
          .filter((m) => m.startsWith(`${selectedYear}-`))
          .map((m) => m.slice(5, 7))
      )
    ).sort();
  }, [monthOptions, selectedYear]);

  // =========================
  // 年変更時の補正
  // =========================
  useEffect(() => {
    if (!selectedYear || monthOnlyOptions.length === 0) return;

    const current = selectedMonth ? selectedMonth.split("-")[1] : "";

    if (!monthOnlyOptions.includes(current)) {
      setSelectedMonth(
        `${selectedYear}-${monthOnlyOptions[monthOnlyOptions.length - 1]}`
      );
    }
  }, [selectedYear, monthOnlyOptions, selectedMonth]);

  // =========================
  // データ加工
  // =========================
  const rowsByMonth = useMemo(() => {
    const map = new Map();

    allRows.forEach((row) => {
      const key = row.target_month;

      if (!map.has(key)) {
        map.set(key, []);
      }

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
    value == null ? "-" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

  // =========================
  // 描画
  // =========================
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold">採用KPIダッシュボード</h1>

        {showDataView ? (
          <button
            type="button"
            className="bg-white text-blue-600 text-sm font-medium px-3 py-1 rounded"
            onClick={() => setShowDataView(false)}
          >
            ダッシュボードを表示
          </button>
        ) : (
          <TopPick
            selectedYear={selectedYear}
            yearOptions={yearOptions}
            onYearChange={setSelectedYear}
            selectedMonth={selectedMonth}
            monthOnlyOptions={monthOnlyOptions}
            onMonthChange={(m) => setSelectedMonth(`${selectedYear}-${m}`)}
            showDataView={showDataView}
            onToggleView={() => setShowDataView(true)}
          />
        )}
      </div>

      {showDataView ? (
        <Home />
      ) : (
        <div className="p-4 flex flex-col gap-4">
          {/* ローディング表示 */}
          {loading && (
            <div className="bg-white p-3 rounded shadow text-sm text-gray-500">
              読み込み中...
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* 月表示 + 追加ボタン */}
          <div className="flex items-center justify-between w-full">
            <p className="font-bold text-lg">
              {formatMonthDisplay(selectedMonth)}
            </p>

            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => setShowInputModal(true)}
            >
              ＋
            </button>
          </div>

          {/* KPI */}
          <KpiCards
            selectedKpi={selectedKpi}
            formatRate={formatRate}
            formatSignedRate={formatSignedRate}
          />

          {/* ミニ情報 */}
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

      {/* ＋ボタンで開くデータ入力画面 */}
      <InputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        metricDefinitions={metricDefinitions}
        defaultMonth={selectedMonth || getCurrentMonth()}
        onSaved={loadDashboard}
      />
    </div>
  );
}

export default App;
