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
            <TableCell>指標</TableCell>
            <TableCell>KPI/KGI</TableCell>
            <TableCell align="right">実績値</TableCell>
            <TableCell align="right">目標値</TableCell>
            <TableCell align="right">達成率</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.metric_name}</TableCell>
              <TableCell>{row.kind}</TableCell>
              <TableCell align="right">
                {formatValue(row.actual_value)} {row.unit}
              </TableCell>
              <TableCell align="right">
                {formatValue(row.target_value)} {row.unit}
              </TableCell>
              <TableCell align="right">{formatRate(row.achievement_rate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MetricsTable;
