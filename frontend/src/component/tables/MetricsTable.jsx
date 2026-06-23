import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return Number(value).toLocaleString("ja-JP");
};

const formatRate = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${value}%`;
};

const MetricsTable = ({ rows }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>応募指標</TableCell>
            <TableCell align="right">目標（合計）</TableCell>
            <TableCell align="right">実績（合計）</TableCell>
            <TableCell align="right">実績（新卒）</TableCell>
            <TableCell align="right">実績（中途）</TableCell>
            <TableCell align="right">乖離</TableCell>
            <TableCell align="right">達成率</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.metric_name}</TableCell>
              <TableCell align="right">{formatValue(row.target_total)}</TableCell>
              <TableCell align="right">{formatValue(row.actual_total)}</TableCell>
              <TableCell align="right">{formatValue(row.actual_new_graduate)}</TableCell>
              <TableCell align="right">{formatValue(row.actual_mid_career)}</TableCell>
              <TableCell align="right">{formatValue(row.gap)}</TableCell>
              <TableCell align="right">{formatRate(row.achievement_rate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MetricsTable;
