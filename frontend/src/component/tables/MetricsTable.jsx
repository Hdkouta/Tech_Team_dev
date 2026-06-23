import React from "react";
import {
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
const MetricsTable = ({ rows }) => {
  return (
    <TableContainer sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
      <Table size="medium" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>対象年月</TableCell>
            <TableCell sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>応募指標</TableCell>
            <TableCell align="right" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>目標（合計）</TableCell>
            <TableCell align="right" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>実績（合計）</TableCell>
            <TableCell align="right" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>実績（新卒）</TableCell>
            <TableCell align="right" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>実績（中途）</TableCell>
            <TableCell align="right" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>乖離</TableCell>
            <TableCell align="right" sx={{ fontSize: "0.98rem", fontWeight: 700, py: 1.5, backgroundColor: "#f8fafc" }}>達成率</TableCell>
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
              <TableCell sx={{ fontSize: "1rem", py: 1.2 }}>{row.target_month || row.month}</TableCell>
              <TableCell sx={{ fontSize: "1rem", py: 1.2 }}>{row.metric_name}</TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2, fontWeight: 600 }}>{formatValue(row.target_total)}</TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2, fontWeight: 700 }}>{formatValue(row.actual_total)}</TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2 }}>{formatValue(row.actual_new_graduate)}</TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2 }}>{formatValue(row.actual_mid_career)}</TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2, fontWeight: 600 }}>{formatValue(row.gap)}</TableCell>
              <TableCell align="right" sx={{ fontSize: "1rem", py: 1.2, fontWeight: 700 }}>{formatRate(row.achievement_rate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MetricsTable;
