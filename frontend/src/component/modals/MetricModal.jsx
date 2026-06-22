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
} from "@mui/material";

const MetricModal = ({ open, onClose, form, setForm, definitions, onSave, saving }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>KPI/KGI入力</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="metric-definition-label">指標</InputLabel>
            <Select
              labelId="metric-definition-label"
              value={form.metric_definition_id}
              label="指標"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, metric_definition_id: e.target.value }))
              }
            >
              {definitions.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name} ({item.kind})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="実績値"
            type="number"
            value={form.actual_value}
            onChange={(e) => setForm((prev) => ({ ...prev, actual_value: e.target.value }))}
            fullWidth
          />
          <TextField
            label="目標値"
            type="number"
            value={form.target_value}
            onChange={(e) => setForm((prev) => ({ ...prev, target_value: e.target.value }))}
            fullWidth
          />
          <TextField
            label="データ取得元"
            value={form.source}
            onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
            fullWidth
          />
          <TextField
            label="メモ"
            value={form.memo}
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

export default MetricModal;
