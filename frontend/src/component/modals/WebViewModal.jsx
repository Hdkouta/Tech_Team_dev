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

const WebViewModal = ({ open, onClose, form, setForm, onSave, saving }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Web閲覧入力</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="サイト名"
            value={form.site_name}
            onChange={(e) => setForm((prev) => ({ ...prev, site_name: e.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="site-category-label">区分</InputLabel>
            <Select
              labelId="site-category-label"
              value={form.site_category}
              label="区分"
              onChange={(e) => setForm((prev) => ({ ...prev, site_category: e.target.value }))}
            >
              <MenuItem value="website">一般サイト</MenuItem>
              <MenuItem value="entry_site">応募サイト</MenuItem>
            </Select>
          </FormControl>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="PV"
              type="number"
              value={form.page_views}
              onChange={(e) => setForm((prev) => ({ ...prev, page_views: e.target.value }))}
              fullWidth
            />
            <TextField
              label="UU"
              type="number"
              value={form.unique_users}
              onChange={(e) => setForm((prev) => ({ ...prev, unique_users: e.target.value }))}
              fullWidth
            />
            <TextField
              label="応募サイト閲覧数"
              type="number"
              value={form.entry_page_views}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, entry_page_views: e.target.value }))
              }
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

export default WebViewModal;
