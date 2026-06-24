import React from "react";
import {
  Box,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ActionButtons from "./component/buttons/ActionButtons";
import InputMenuButton from "./component/buttons/InputMenuButton";
import * as api from "./api";
import UnifiedInputModal from "./component/modals/UnifiedInputModal";
import MetricsTable from "./component/tables/MetricsTable";
import { normalizeMetricRows } from "./dataMath";

// 現在の年月を作成
const getCurrentMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// データ画面を表示
const Home = ({ onMetricsChanged }) => {
  const [selectedYear, setSelectedYear] = React.useState(String(new Date().getFullYear()));
  const [availableYears, setAvailableYears] = React.useState([String(new Date().getFullYear())]);
  const [metricDefinitions, setMetricDefinitions] = React.useState([]);
  const [metricRows, setMetricRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [modalError, setModalError] = React.useState("");

  const [openInputModal, setOpenInputModal] = React.useState(false);

  const [metricForm, setMetricForm] = React.useState({
    metric_definition_id: "",
    target_month: getCurrentMonth(),
    target_total: "",
    actual_total: "",
    actual_new_graduate: "",
    actual_mid_career: "",
    memo: "",
  });

  // 年で絞って一覧を読み込む
  const loadRows = React.useCallback(async (targetYear) => {
    setLoading(true);
    setError("");
    try {
      const metricData = await api.getMetrics();
      const allRows = metricData.rows || [];
      const detectedYears = Array.from(
        new Set(
          allRows
            .map((row) => row.target_month?.slice(0, 4))
            .filter((year) => /^\d{4}$/.test(year)),
        ),
      ).sort((a, b) => Number(a) - Number(b));

      setAvailableYears((prev) => {
        const years = detectedYears.length > 0 ? detectedYears : prev;
        if (targetYear && !years.includes(targetYear)) {
          return [...years, targetYear].sort((a, b) => Number(a) - Number(b));
        }
        return years;
      });

      const filteredRows = allRows.filter((row) => row.target_month?.startsWith(`${targetYear}-`));

      const normalizedRows = normalizeMetricRows(filteredRows);
      setMetricRows(normalizedRows);
    } catch {
      setError("データ取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError("");
      try {
        const [definitions] = await Promise.all([api.getMetricDefinitions(), loadRows(selectedYear)]);
        setMetricDefinitions(definitions);
        if (definitions.length > 0) {
          setMetricForm((prev) => ({ ...prev, metric_definition_id: definitions[0].id }));
        }
      } catch {
        setError("初期データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [selectedYear]);

  // 入力データを保存
  const handleSaveMetric = async () => {
    setModalError("");

    const selectedDefinition =
      metricDefinitions.find((item) => item.id === Number(metricForm.metric_definition_id)) || null;

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
      const allMetrics = await api.getMetrics();
      const hasDuplicateMonth = (allMetrics.rows || []).some(
        (row) =>
          Number(row.metric_definition_id) === Number(metricForm.metric_definition_id)
          && row.target_month === metricForm.target_month,
      );

      if (hasDuplicateMonth) {
        setModalError("年月に重複したデータがあります");
        return;
      }

      setSaving(true);

      await api.saveMetricRecord({
        month: metricForm.target_month,
        metric_definition_id: Number(metricForm.metric_definition_id),
        target_total: Number(metricForm.target_total),
        actual_total: selectedDefinition?.supports_breakdown ? 0 : Number(metricForm.actual_total),
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
      await loadRows(savedYear);
      if (onMetricsChanged) {
        await onMetricsChanged();
      }
      setMetricForm((prev) => ({
        ...prev,
        target_month: metricForm.target_month,
        target_total: "",
        actual_total: "",
        actual_new_graduate: "",
        actual_mid_career: "",
        memo: "",
      }));
      setModalError("");
      setOpenInputModal(false);
    } catch {
      setModalError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async () => {
    await loadRows(selectedYear);
    if (onMetricsChanged) {
      await onMetricsChanged();
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3, alignItems: "stretch" }}>
        <TextField
          label="対象年"
          select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          sx={{
            width: { xs: "100%", md: 240 },
            "& .MuiInputBase-input": { fontSize: "1.05rem", py: 1.1 },
            "& .MuiInputLabel-root": { fontSize: "1rem" },
          }}
        >
          {availableYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}年
            </MenuItem>
          ))}
        </TextField>
        <InputMenuButton
          onClick={() => {
            setModalError("");
            const currentMonthNumber = String(new Date().getMonth() + 1).padStart(2, "0");
            setMetricForm((prev) => ({
              ...prev,
              target_month: `${selectedYear}-${currentMonthNumber}`,
            }));
            setOpenInputModal(true);
          }}
        />
        <ActionButtons onReload={handleReload} />
      </Stack>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {selectedYear}年 データ一覧
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2, fontSize: "1rem", fontWeight: 600 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <MetricsTable rows={metricRows} />
        )}
      </Paper>

      <UnifiedInputModal
        open={openInputModal}
        onClose={() => {
          setModalError("");
          setOpenInputModal(false);
        }}
        definitions={metricDefinitions}
        form={metricForm}
        setForm={setMetricForm}
        errorMessage={modalError}
        onSave={handleSaveMetric}
        saving={saving}
      />
    </Box>
  );
};

export default Home;