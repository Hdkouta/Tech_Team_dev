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
const Home = () => {
  const [selectedYear, setSelectedYear] = React.useState(String(new Date().getFullYear()));
  const [availableYears, setAvailableYears] = React.useState([String(new Date().getFullYear())]);
  const [metricDefinitions, setMetricDefinitions] = React.useState([]);
  const [metricRows, setMetricRows] = React.useState([]);

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [modalError, setModalError] = React.useState("");

  const [openInputModal, setOpenInputModal] = React.useState(false);

  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [editModalError, setEditModalError] = React.useState("");
  const [editingRow, setEditingRow] = React.useState(null);

  const [metricForm, setMetricForm] = React.useState({
    metric_definition_id: "",
    target_month: getCurrentMonth(),
    target_total: "",
    actual_total: "",
    actual_new_graduate: "",
    actual_mid_career: "",
    memo: "",
  });

  const [editForm, setEditForm] = React.useState({
    id: "",
    metric_definition_id: "",
    target_month: "",
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

      const filteredRows = allRows.filter((row) =>
        row.target_month?.startsWith(`${targetYear}-`)
      );

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
        const definitions = await api.getMetricDefinitions();
        setMetricDefinitions(definitions);

        if (definitions.length > 0) {
          setMetricForm((prev) => ({
            ...prev,
            metric_definition_id: definitions[0].id,
          }));
        }

        await loadRows(selectedYear);
      } catch {
        setError("初期データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [selectedYear, loadRows]);

  // 編集ボタン押下時に、対象行のデータを編集フォームにセットする
  const handleOpenEditModal = (row) => {
    setEditModalError("");
    setEditingRow(row);

    setEditForm({
      id: row.id,
      metric_definition_id: row.metric_definition_id,
      target_month: row.target_month || row.month || "",
      target_total: row.target_total ?? "",
      actual_total: row.actual_total ?? "",
      actual_new_graduate: row.actual_new_graduate ?? "",
      actual_mid_career: row.actual_mid_career ?? "",
      memo: row.memo ?? "",
    });

    setOpenEditModal(true);
  };

  // 入力データを新規保存する
  const handleSaveMetric = async () => {
    setModalError("");

    const selectedDefinition =
      metricDefinitions.find(
        (item) => item.id === Number(metricForm.metric_definition_id)
      ) || null;

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
          Number(row.metric_definition_id) === Number(metricForm.metric_definition_id) &&
          row.target_month === metricForm.target_month,
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
        actual_total: selectedDefinition?.supports_breakdown
          ? 0
          : Number(metricForm.actual_total),
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
    } catch (error) {
      const message = error?.response?.data?.error || "保存に失敗しました";
      setModalError(message);
    } finally {
      setSaving(false);
    }
  };

  // 編集データを更新する
  console.log("更新対象 editForm:", editForm);
  const handleUpdateMetric = async () => {
    setEditModalError("");

    if (!editForm.id) {
      setEditModalError("更新対象のIDが取得できません");
      return;
    }

    if (
      !editForm.metric_definition_id ||
      !editForm.target_month ||
      editForm.target_total === ""
    ) {
      setEditModalError("指標、対象年月、目標（合計）を入力してください");
      return;
    }

    if (!MONTH_PATTERN.test(editForm.target_month)) {
      setEditModalError("対象年月はYYYY-MM形式で入力してください");
      return;
    }

    const selectedDefinition =
      metricDefinitions.find(
        (item) => item.id === Number(editForm.metric_definition_id)
      ) || null;

    if (
      selectedDefinition?.supports_breakdown
        ? editForm.actual_new_graduate === "" || editForm.actual_mid_career === ""
        : editForm.actual_total === ""
    ) {
      setEditModalError("実績値を入力してください");
      return;
    }

    try {
      setSaving(true);

      await api.updateApplicationMetric(editForm.id, {
        target_month: editForm.target_month,
        target_total: Number(editForm.target_total),
        actual_total: selectedDefinition?.supports_breakdown
          ? 0
          : Number(editForm.actual_total),
        actual_new_graduate: selectedDefinition?.supports_breakdown
          ? Number(editForm.actual_new_graduate)
          : Number(editForm.actual_total),
        actual_mid_career: selectedDefinition?.supports_breakdown
          ? Number(editForm.actual_mid_career)
          : 0,
        memo: editForm.memo,
      });

      const updatedYear = editForm.target_month.slice(0, 4);

      setSelectedYear(updatedYear);
      await loadRows(updatedYear);

      setEditModalError("");
      setOpenEditModal(false);
      setEditingRow(null);
    } catch (error) {
      console.error("更新エラー:", error);
      console.error("更新エラー詳細:", error?.response?.data);

      const message =
        error?.response?.data?.error || "更新に失敗しました";

      setEditModalError(message);
    } finally {
      setSaving(false);
    }
  };

  // 編集データを削除する
  console.log("削除対象 editingRow:", editingRow);
  const handleDeleteMetric = async () => {
    setEditModalError("");

    if (!editingRow?.id) {
      setEditModalError("削除対象のIDが取得できません");
      return;
    }

    const confirmed = window.confirm("このデータを削除します。よろしいですか？");

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await api.deleteApplicationMetric(editingRow.id);

      const deletedYear = (editingRow.target_month || editingRow.month || selectedYear).slice(0, 4);

      await loadRows(deletedYear);

      setEditModalError("");
      setOpenEditModal(false);
      setEditingRow(null);
    } catch (error) {
      console.error("削除エラー:", error);
      console.error("削除エラー詳細:", error?.response?.data);

      const message =
        error?.response?.data?.error || "削除に失敗しました";

      setEditModalError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 3, alignItems: "stretch" }}
      >
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

        <ActionButtons onReload={() => loadRows(selectedYear)} />
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
          <MetricsTable rows={metricRows} onEdit={handleOpenEditModal} />
        )}
      </Paper>

      <UnifiedInputModal
        open={openInputModal}
        onClose={() => {
          setModalError("");
          setOpenInputModal(false);
        }}
        title="応募データ入力"
        definitions={metricDefinitions}
        form={metricForm}
        setForm={setMetricForm}
        errorMessage={modalError}
        onSave={handleSaveMetric}
        saving={saving}
      />

      <UnifiedInputModal
        open={openEditModal}
        onClose={() => {
          setEditModalError("");
          setOpenEditModal(false);
          setEditingRow(null);
        }}
        title="応募データ編集"
        definitions={metricDefinitions}
        form={editForm}
        setForm={setEditForm}
        errorMessage={editModalError}
        onSave={handleUpdateMetric}
        saving={saving}
        showDeleteButton
        onDelete={handleDeleteMetric}
      />
    </Box>
  );
};

export default Home;
