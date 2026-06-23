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
  Typography,
} from "@mui/material";

const toNum = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const formatPercent = (value) => {
  if (value === null) {
    return "-";
  }
  return `${value}%`;
};

const UnifiedInputModal = ({
  open,
  onClose,
  definitions = [],
  form = {},
  setForm = () => {},
  onSave = () => {},
  saving = false,
}) => {
  const safeForm = {
    metric_definition_id: "",
    target_total: "",
    actual_total: "",
    actual_new_graduate: "",
    actual_mid_career: "",
    source: "",
    memo: "",
    ...form,
  };

  const selectedDefinition =
    definitions.find((item) => item.id === Number(safeForm.metric_definition_id)) || null;

  const targetTotal = toNum(safeForm.target_total);
  const actualTotal = selectedDefinition?.supports_breakdown
    ? toNum(safeForm.actual_new_graduate) + toNum(safeForm.actual_mid_career)
    : toNum(safeForm.actual_total);
  const gap = actualTotal - targetTotal;
  const achievementRate = targetTotal === 0 ? null : Number(((actualTotal / targetTotal) * 100).toFixed(1));

  const handleDefinitionChange = (value) => {
    const definition = definitions.find((item) => item.id === Number(value));
    setForm((prev) => ({
      ...prev,
      metric_definition_id: value,
      actual_total: definition?.supports_breakdown ? "" : prev.actual_total,
      actual_new_graduate: definition?.supports_breakdown ? prev.actual_new_graduate : "",
      actual_mid_career: definition?.supports_breakdown ? prev.actual_mid_career : "",
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>応募データ入力</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="application-metric-label">入力種別</InputLabel>
            <Select
              labelId="application-metric-label"
              label="入力種別"
              value={safeForm.metric_definition_id}
              onChange={(e) => handleDefinitionChange(e.target.value)}
            >
              {definitions.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="目標（合計）"
            type="number"
            value={safeForm.target_total}
            onChange={(e) => setForm((prev) => ({ ...prev, target_total: e.target.value }))}
            fullWidth
          />

          {selectedDefinition?.supports_breakdown ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="実績（新卒）"
                type="number"
                value={safeForm.actual_new_graduate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, actual_new_graduate: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="実績（中途）"
                type="number"
                value={safeForm.actual_mid_career}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, actual_mid_career: e.target.value }))
                }
                fullWidth
              />
            </Stack>
          ) : (
            <TextField
              label="実績（合計）"
              type="number"
              value={safeForm.actual_total}
              onChange={(e) => setForm((prev) => ({ ...prev, actual_total: e.target.value }))}
              fullWidth
            />
          )}

          <TextField
            label="データ取得元"
            value={safeForm.source}
            onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
            fullWidth
          />

          <Stack
            spacing={0.5}
            sx={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: 1,
              p: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              実績（合計）: {actualTotal.toLocaleString("ja-JP")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              乖離: {gap.toLocaleString("ja-JP")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              達成率: {formatPercent(achievementRate)}
            </Typography>
          </Stack>

          <TextField
            label="メモ"
            value={safeForm.memo}
            onChange={(e) => setForm((prev) => ({ ...prev, memo: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button variant="contained" onClick={onSave} disabled={saving}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnifiedInputModal;
