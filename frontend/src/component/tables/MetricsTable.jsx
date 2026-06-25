import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// 数値を表示用に整形
const formatValue = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return Number(value).toLocaleString("ja-JP");
};

// 率を表示用に整形
const formatRate = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${value}%`;
};

// 指標テーブルを表示
const MetricsTable = ({ rows, onEdit = () => { } }) => {
  return (
    <TableContainer sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
      <Table size="medium" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>
              対象年月
            </TableCell>
            <TableCell sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>
              選考データ
            </TableCell>
            <TableCell align="center" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>
              <span style={{ display: "inline-block", textAlign: "center", lineHeight: 1.2 }}>
                目標
                <br />
                （実績）
              </span>
            </TableCell>
            <TableCell align="center" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>
              <span style={{ display: "inline-block", textAlign: "center", lineHeight: 1.2 }}>
                合計
                <br />
                （実績）
              </span>
            </TableCell>
            <TableCell align="center" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>
              <span style={{ display: "inline-block", textAlign: "center", lineHeight: 1.2 }}>
                新卒
              </span>
            </TableCell>
            <TableCell align="center" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>
              <span style={{ display: "inline-block", textAlign: "center", lineHeight: 1.2 }}>
                中途
              </span>
            </TableCell>
            <TableCell align="center" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>
              乖離
            </TableCell>
            <TableCell align="center" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>
              達成率
            </TableCell>

            {/* 編集ボタン用の空ヘッダー */}
            <TableCell
              align="center"
              sx={{
                fontSize: "0.98rem",
                fontWeight: 700,
                py: 1.5,
                backgroundColor: "#f8fafc",
              }}
            />
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{
                "&:nth-of-type(even)": { backgroundColor: "#fcfcfd" },
              }}
            >
              <TableCell sx={{ fontSize: "1rem", py: 1.2 }}>
                {row.target_month || row.month}
              </TableCell>
              <TableCell sx={{ fontSize: "1rem", py: 1.2 }}>
                {row.metric_name}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2, fontWeight: 600 }}>
                {formatValue(row.target_total)}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2, fontWeight: 700 }}>
                {formatValue(row.actual_total)}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2 }}>
                {formatValue(row.actual_new_graduate)}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2 }}>
                {formatValue(row.actual_mid_career)}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2, fontWeight: 600 }}>
                {formatValue(row.gap)}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2, fontWeight: 700 }}>
                {formatRate(row.achievement_rate)}
              </TableCell>

              <TableCell align="center" sx={{ fontSize: "1rem", py: 1.2 }}>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => onEdit(row)}
                >
                  編集
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MetricsTable;
