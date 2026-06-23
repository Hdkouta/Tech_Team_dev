import React from "react";
import {
  Autocomplete,
  Box,
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

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const YEAR_MIN = 1900;
const YEAR_MAX = 2100;
const MONTH_PICKER_OPEN_DELAY = 220;

// 年月文字列を分解
const parseMonth = (value) => {
  if (!MONTH_PATTERN.test(value || "")) {
    return null;
  }
  const [year, month] = value.split("-");
  return { year, month };
};

// 年月をYYYY-MMで作成
const toMonthString = (year, month) => `${year}-${String(month).padStart(2, "0")}`;

// 入力値を数値化
const toNum = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

// 達成率を表示用に整形
const formatPercent = (value) => {
  if (value === null) {
    return "-";
  }
  return `${value}%`;
};

// 入力モーダルを表示
const UnifiedInputModal = ({
  open,
  onClose,
  definitions = [],
  form = {},
  setForm = () => {},
  errorMessage = "",
  onSave = () => {},
  saving = false,
}) => {
  const now = new Date();
  const [openMonthPicker, setOpenMonthPicker] = React.useState(false);
  const [isOpeningMonthPicker, setIsOpeningMonthPicker] = React.useState(false);
  const [pickerYear, setPickerYear] = React.useState(String(now.getFullYear()));
  const [pickerMonth, setPickerMonth] = React.useState(String(now.getMonth() + 1).padStart(2, "0"));
  const openTimerRef = React.useRef(null);

  const safeForm = {
    metric_definition_id: "",
    target_month: "",
    target_total: "",
    actual_total: "",
    actual_new_graduate: "",
    actual_mid_career: "",
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

  // 入力種別の変更を反映
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

  // 年月選択モーダルを開く
  const handleOpenMonthPicker = () => {
    const parsed = parseMonth(safeForm.target_month);
    if (parsed) {
      setPickerYear(parsed.year);
      setPickerMonth(parsed.month);
    }

    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
    }

    setIsOpeningMonthPicker(true);
    openTimerRef.current = setTimeout(() => {
      setOpenMonthPicker(true);
      setIsOpeningMonthPicker(false);
      openTimerRef.current = null;
    }, MONTH_PICKER_OPEN_DELAY);
  };

  // 選択した年月を反映
  const handleApplyMonthPicker = () => {
    setForm((prev) => ({
      ...prev,
      target_month: toMonthString(pickerYear, pickerMonth),
    }));
    setOpenMonthPicker(false);
  };

  React.useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  const yearOptions = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => String(YEAR_MIN + i));
  const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>応募データ入力</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {errorMessage && (
            <Typography color="error" variant="body2">
              {errorMessage}
            </Typography>
          )}

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

          <Typography variant="body2" color="text.secondary">
            対象年月: {safeForm.target_month || "未選択"}
          </Typography>

          <Button variant="outlined" onClick={handleOpenMonthPicker} disabled={isOpeningMonthPicker}>
            {isOpeningMonthPicker ? "開いています..." : "年月を選択"}
          </Button>

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

      <Dialog open={openMonthPicker} onClose={() => setOpenMonthPicker(false)} fullWidth maxWidth="xs">
        <DialogTitle>年月を選択</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={yearOptions}
              value={pickerYear}
              onChange={(_, value) => {
                if (value) {
                  setPickerYear(value);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="年"  />
              )}
            />

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                月
              </Typography>
              <ToggleButtonGroup
                value={pickerMonth}
                exclusive
                fullWidth
                onChange={(_, value) => {
                  if (value) {
                    setPickerMonth(value);
                  }
                }}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 1,
                  "& .MuiToggleButtonGroup-grouped": {
                    border: "1px solid #d1d5db !important",
                    borderRadius: "8px !important",
                    margin: 0,
                  },
                }}
              >
                {monthOptions.map((month) => (
                  <ToggleButton key={month} value={month}>
                    {Number(month)}月
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMonthPicker(false)}>閉じる</Button>
          <Button variant="contained" onClick={handleApplyMonthPicker}>適用</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default UnifiedInputModal;
