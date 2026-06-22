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
import RecruitmentPipelineTable from "./component/tables/RecruitmentPipelineTable";
import WebViewsTable from "./component/tables/WebViewsTable";

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
  const [recruitmentPipelineRows, setRecruitmentPipelineRows] = React.useState([]);
  const [webViewRows, setWebViewRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [openInputModal, setOpenInputModal] = React.useState(false);
  const [inputType, setInputType] = React.useState("metric");

  const [metricForm, setMetricForm] = React.useState({
    metric_definition_id: "",
    actual_value: "",
    target_value: "",
    source: "STUDIO",
    memo: "",
  });

  const [recruitmentForm, setRecruitmentForm] = React.useState({
    department: "採用チーム",
    position: "エンジニア",
    planned_hires: "",
    applicants: "",
    document_pass: "",
    first_interview_pass: "",
    final_interview_pass: "",
    offers: "",
    hires: "",
    source: "手入力",
    memo: "",
  });

  const [webViewForm, setWebViewForm] = React.useState({
    site_name: "公式サイト",
    site_category: "website",
    page_views: "",
    unique_users: "",
    entry_page_views: "",
    source: "GA4",
    memo: "",
  });

  const loadRows = React.useCallback(async (targetMonth) => {
    setLoading(true);
    setError("");
    try {
      const [metricData, recruitmentData, webViewData] = await Promise.all([
        api.getMetrics(targetMonth),
        api.getRecruitmentPipeline(targetMonth),
        api.getWebViews(targetMonth),
      ]);
      setMetricRows(metricData.rows || []);
      setRecruitmentPipelineRows(recruitmentData.rows || []);
      setWebViewRows(webViewData.rows || []);
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
    if (
      !metricForm.metric_definition_id ||
      metricForm.actual_value === "" ||
      metricForm.target_value === ""
    ) {
      setError("指標、実績値、目標値を入力してください");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.saveMetricRecord({
        month,
        metric_definition_id: Number(metricForm.metric_definition_id),
        actual_value: Number(metricForm.actual_value),
        target_value: Number(metricForm.target_value),
        source: metricForm.source,
        memo: metricForm.memo,
      });
      await loadRows(month);
      setMetricForm((prev) => ({
        ...prev,
        actual_value: "",
        target_value: "",
        memo: "",
      }));
      setOpenInputModal(false);
    } catch (e) {
      setError(getApiErrorMessage(e, "保存に失敗しました"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRecruitment = async () => {
    if (!recruitmentForm.department || !recruitmentForm.position) {
      setError("部署と職種を入力してください");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.saveRecruitmentPipeline({
        month,
        ...recruitmentForm,
      });
      await loadRows(month);
      setRecruitmentForm((prev) => ({
        ...prev,
        planned_hires: "",
        applicants: "",
        document_pass: "",
        first_interview_pass: "",
        final_interview_pass: "",
        offers: "",
        hires: "",
        memo: "",
      }));
      setOpenInputModal(false);
    } catch (e) {
      setError(getApiErrorMessage(e, "採用データの保存に失敗しました"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWebView = async () => {
    if (!webViewForm.site_name || webViewForm.page_views === "") {
      setError("サイト名と閲覧数を入力してください");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.saveWebViewRecord({
        month,
        ...webViewForm,
      });
      await loadRows(month);
      setWebViewForm((prev) => ({
        ...prev,
        page_views: "",
        unique_users: "",
        entry_page_views: "",
        memo: "",
      }));
      setOpenInputModal(false);
    } catch (e) {
      setError(getApiErrorMessage(e, "Web閲覧データの保存に失敗しました"));
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
          onClick={() => {
            setInputType("metric");
            setOpenInputModal(true);
          }}
        />
        <ActionButtons onReload={() => loadRows(month)} />
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          DB状態表示
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

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          採用DB
        </Typography>
        <RecruitmentPipelineTable rows={recruitmentPipelineRows} />
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Web閲覧DB
        </Typography>
        <WebViewsTable rows={webViewRows} />
      </Paper>

      <UnifiedInputModal
        open={openInputModal}
        onClose={() => setOpenInputModal(false)}
        inputType={inputType}
        setInputType={setInputType}
        metricForm={metricForm}
        setMetricForm={setMetricForm}
        metricDefinitions={metricDefinitions}
        recruitmentForm={recruitmentForm}
        setRecruitmentForm={setRecruitmentForm}
        webViewForm={webViewForm}
        setWebViewForm={setWebViewForm}
        onSaveMetric={handleSaveMetric}
        onSaveRecruitment={handleSaveRecruitment}
        onSaveWebView={handleSaveWebView}
        saving={saving}
      />
    </Box>
  );
};

export default Home;