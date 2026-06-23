import React from "react";
import {
  Box,
  CircularProgress,
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

const getCurrentMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const getApiErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message === "Network Error") {
    return "APIへ接続できません。バックエンドを起動してください（python backend/app.py）";
  }
  return fallbackMessage;
};

const Home = () => {
  const [month, setMonth] = React.useState(getCurrentMonth());
  const [metricDefinitions, setMetricDefinitions] = React.useState([]);
  const [metricRows, setMetricRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [openInputModal, setOpenInputModal] = React.useState(false);

  const [metricForm, setMetricForm] = React.useState({
    metric_definition_id: "",
    target_total: "",
    actual_total: "",
    actual_new_graduate: "",
    actual_mid_career: "",
    source: "STUDIO",
    memo: "",
  });

  const loadRows = React.useCallback(async (targetMonth) => {
    setLoading(true);
    setError("");
    try {
      const metricData = await api.getMetrics(targetMonth);
      const normalizedRows = (metricData.rows || []).map((row) => {
        const actualNewGraduate = Number(row.actual_new_graduate ?? 0);
        const actualMidCareer = Number(row.actual_mid_career ?? 0);
        const targetTotal = Number(row.target_total ?? 0);
        const actualTotal = actualNewGraduate + actualMidCareer;
        const gap = actualTotal - targetTotal;
        const achievementRate = targetTotal === 0
          ? null
          : Number(((actualTotal / targetTotal) * 100).toFixed(1));

        return {
          ...row,
          actual_total: actualTotal,
          gap,
          achievement_rate: achievementRate,
        };
      });
      setMetricRows(normalizedRows);
    } catch (e) {
      setError(getApiErrorMessage(e, "一覧の取得に失敗しました"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError("");
      try {
        const [definitions] = await Promise.all([api.getMetricDefinitions(), loadRows(month)]);
        setMetricDefinitions(definitions);
        if (definitions.length > 0) {
          setMetricForm((prev) => ({ ...prev, metric_definition_id: definitions[0].id }));
        }
      } catch (e) {
        setError(getApiErrorMessage(e, "初期データの取得に失敗しました"));
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [month]);

  const handleSaveMetric = async () => {
    const selectedDefinition =
      metricDefinitions.find((item) => item.id === Number(metricForm.metric_definition_id)) || null;

    if (
      !metricForm.metric_definition_id ||
      metricForm.target_total === ""
    ) {
      setError("指標と目標（合計）を入力してください");
      return;
    }

    if (
      selectedDefinition?.supports_breakdown
        ? metricForm.actual_new_graduate === "" || metricForm.actual_mid_career === ""
        : metricForm.actual_total === ""
    ) {
      setError("実績値を入力してください");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.saveMetricRecord({
        month,
        metric_definition_id: Number(metricForm.metric_definition_id),
        target_total: Number(metricForm.target_total),
        actual_total: selectedDefinition?.supports_breakdown ? 0 : Number(metricForm.actual_total),
        actual_new_graduate: selectedDefinition?.supports_breakdown
          ? Number(metricForm.actual_new_graduate)
          : Number(metricForm.actual_total),
        actual_mid_career: selectedDefinition?.supports_breakdown
          ? Number(metricForm.actual_mid_career)
          : 0,
        source: metricForm.source,
        memo: metricForm.memo,
      });
      await loadRows(month);
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
      setError(getApiErrorMessage(e, "保存に失敗しました"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="対象月"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: { xs: "100%", md: 220 } }}
        />
        <InputMenuButton
          onClick={() => setOpenInputModal(true)}
        />
        <ActionButtons onReload={() => loadRows(month)} />
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          応募指標DB
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          現在のバックエンドは応募指標データのみ対応しています。
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
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
        onClose={() => setOpenInputModal(false)}
        definitions={metricDefinitions}
        form={metricForm}
        setForm={setMetricForm}
        onSave={handleSaveMetric}
        saving={saving}
      />
    </Box>
  );
};

export default Home;