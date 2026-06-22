import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

const UnifiedInputModal = ({
  open,
  onClose,
  inputType,
  setInputType,
  metricForm,
  setMetricForm,
  metricDefinitions,
  recruitmentForm,
  setRecruitmentForm,
  webViewForm,
  setWebViewForm,
  onSaveMetric,
  onSaveRecruitment,
  onSaveWebView,
  saving,
}) => {
  const titleByType = {
    metric: "KPI/KGI入力",
    recruitment: "採用入力",
    webview: "Web閲覧入力",
  };

  const handleSave = () => {
    if (inputType === "metric") {
      onSaveMetric();
      return;
    }
    if (inputType === "recruitment") {
      onSaveRecruitment();
      return;
    }
    onSaveWebView();
  };

  const renderMetricForm = () => (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <FormControl fullWidth>
        <InputLabel id="metric-definition-label">指標</InputLabel>
        <Select
          labelId="metric-definition-label"
          value={metricForm.metric_definition_id}
          label="指標"
          onChange={(e) =>
            setMetricForm((prev) => ({ ...prev, metric_definition_id: e.target.value }))
          }
        >
          {metricDefinitions.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name} ({item.kind})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="実績値"
        type="number"
        value={metricForm.actual_value}
        onChange={(e) => setMetricForm((prev) => ({ ...prev, actual_value: e.target.value }))}
        fullWidth
      />
      <TextField
        label="目標値"
        type="number"
        value={metricForm.target_value}
        onChange={(e) => setMetricForm((prev) => ({ ...prev, target_value: e.target.value }))}
        fullWidth
      />
      <TextField
        label="データ取得元"
        value={metricForm.source}
        onChange={(e) => setMetricForm((prev) => ({ ...prev, source: e.target.value }))}
        fullWidth
      />
      <TextField
        label="メモ"
        value={metricForm.memo}
        onChange={(e) => setMetricForm((prev) => ({ ...prev, memo: e.target.value }))}
        fullWidth
        multiline
        minRows={2}
      />
    </Stack>
  );

  const renderRecruitmentForm = () => (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField
        label="部署"
        value={recruitmentForm.department}
        onChange={(e) => setRecruitmentForm((prev) => ({ ...prev, department: e.target.value }))}
        fullWidth
      />
      <TextField
        label="職種"
        value={recruitmentForm.position}
        onChange={(e) => setRecruitmentForm((prev) => ({ ...prev, position: e.target.value }))}
        fullWidth
      />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          label="計画人数"
          type="number"
          value={recruitmentForm.planned_hires}
          onChange={(e) =>
            setRecruitmentForm((prev) => ({ ...prev, planned_hires: e.target.value }))
          }
          fullWidth
        />
        <TextField
          label="応募者数"
          type="number"
          value={recruitmentForm.applicants}
          onChange={(e) =>
            setRecruitmentForm((prev) => ({ ...prev, applicants: e.target.value }))
          }
          fullWidth
        />
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          label="書類通過"
          type="number"
          value={recruitmentForm.document_pass}
          onChange={(e) =>
            setRecruitmentForm((prev) => ({ ...prev, document_pass: e.target.value }))
          }
          fullWidth
        />
        <TextField
          label="1次面接通過"
          type="number"
          value={recruitmentForm.first_interview_pass}
          onChange={(e) =>
            setRecruitmentForm((prev) => ({ ...prev, first_interview_pass: e.target.value }))
          }
          fullWidth
        />
        <TextField
          label="最終面接通過"
          type="number"
          value={recruitmentForm.final_interview_pass}
          onChange={(e) =>
            setRecruitmentForm((prev) => ({ ...prev, final_interview_pass: e.target.value }))
          }
          fullWidth
        />
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          label="内定数"
          type="number"
          value={recruitmentForm.offers}
          onChange={(e) => setRecruitmentForm((prev) => ({ ...prev, offers: e.target.value }))}
          fullWidth
        />
        <TextField
          label="採用数"
          type="number"
          value={recruitmentForm.hires}
          onChange={(e) => setRecruitmentForm((prev) => ({ ...prev, hires: e.target.value }))}
          fullWidth
        />
      </Stack>
      <TextField
        label="取得元"
        value={recruitmentForm.source}
        onChange={(e) => setRecruitmentForm((prev) => ({ ...prev, source: e.target.value }))}
        fullWidth
      />
      <TextField
        label="メモ"
        value={recruitmentForm.memo}
        onChange={(e) => setRecruitmentForm((prev) => ({ ...prev, memo: e.target.value }))}
        fullWidth
        multiline
        minRows={2}
      />
    </Stack>
  );

  const renderWebViewForm = () => (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField
        label="サイト名"
        value={webViewForm.site_name}
        onChange={(e) => setWebViewForm((prev) => ({ ...prev, site_name: e.target.value }))}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel id="site-category-label">区分</InputLabel>
        <Select
          labelId="site-category-label"
          value={webViewForm.site_category}
          label="区分"
          onChange={(e) => setWebViewForm((prev) => ({ ...prev, site_category: e.target.value }))}
        >
          <MenuItem value="website">一般サイト</MenuItem>
          <MenuItem value="entry_site">応募サイト</MenuItem>
        </Select>
      </FormControl>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          label="PV"
          type="number"
          value={webViewForm.page_views}
          onChange={(e) => setWebViewForm((prev) => ({ ...prev, page_views: e.target.value }))}
          fullWidth
        />
        <TextField
          label="UU"
          type="number"
          value={webViewForm.unique_users}
          onChange={(e) => setWebViewForm((prev) => ({ ...prev, unique_users: e.target.value }))}
          fullWidth
        />
        <TextField
          label="応募サイト閲覧数"
          type="number"
          value={webViewForm.entry_page_views}
          onChange={(e) =>
            setWebViewForm((prev) => ({ ...prev, entry_page_views: e.target.value }))
          }
          fullWidth
        />
      </Stack>
      <TextField
        label="取得元"
        value={webViewForm.source}
        onChange={(e) => setWebViewForm((prev) => ({ ...prev, source: e.target.value }))}
        fullWidth
      />
      <TextField
        label="メモ"
        value={webViewForm.memo}
        onChange={(e) => setWebViewForm((prev) => ({ ...prev, memo: e.target.value }))}
        fullWidth
        multiline
        minRows={2}
      />
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{titleByType[inputType]}</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            入力種別
          </Typography>
          <ToggleButtonGroup
            value={inputType}
            exclusive
            fullWidth
            color="primary"
            onChange={(_, value) => {
              if (value) {
                setInputType(value);
              }
            }}
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 700,
                py: 1.2,
              },
            }}
          >
            <ToggleButton value="metric">KPI/KGI</ToggleButton>
            <ToggleButton value="recruitment">採用工程</ToggleButton>
            <ToggleButton value="webview">Web閲覧</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {inputType === "metric" && renderMetricForm()}
        {inputType === "recruitment" && renderRecruitmentForm()}
        {inputType === "webview" && renderWebViewForm()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnifiedInputModal;
