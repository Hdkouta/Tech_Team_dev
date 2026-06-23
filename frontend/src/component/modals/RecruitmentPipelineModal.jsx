import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

const RecruitmentPipelineModal = ({ open, onClose, form, setForm, onSave, saving }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>採用入力</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="部署"
            value={form.department}
            onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
            fullWidth
          />
          <TextField
            label="職種"
            value={form.position}
            onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
            fullWidth
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="計画人数"
              type="number"
              value={form.planned_hires}
              onChange={(e) => setForm((prev) => ({ ...prev, planned_hires: e.target.value }))}
              fullWidth
            />
            <TextField
              label="応募者数"
              type="number"
              value={form.applicants}
              onChange={(e) => setForm((prev) => ({ ...prev, applicants: e.target.value }))}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="書類通過"
              type="number"
              value={form.document_pass}
              onChange={(e) => setForm((prev) => ({ ...prev, document_pass: e.target.value }))}
              fullWidth
            />
            <TextField
              label="1次面接通過"
              type="number"
              value={form.first_interview_pass}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, first_interview_pass: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="最終面接通過"
              type="number"
              value={form.final_interview_pass}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, final_interview_pass: e.target.value }))
              }
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="内定数"
              type="number"
              value={form.offers}
              onChange={(e) => setForm((prev) => ({ ...prev, offers: e.target.value }))}
              fullWidth
            />
            <TextField
              label="採用数"
              type="number"
              value={form.hires}
              onChange={(e) => setForm((prev) => ({ ...prev, hires: e.target.value }))}
              fullWidth
            />
          </Stack>
          <TextField
            label="取得元"
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

export default RecruitmentPipelineModal;
