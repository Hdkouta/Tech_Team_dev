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

const WebViewsTable = ({ rows }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>月</TableCell>
            <TableCell>サイト名</TableCell>
            <TableCell>区分</TableCell>
            <TableCell align="right">PV</TableCell>
            <TableCell align="right">UU</TableCell>
            <TableCell align="right">応募サイト閲覧数</TableCell>
            <TableCell>取得元</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.month}</TableCell>
              <TableCell>{row.site_name}</TableCell>
              <TableCell>{row.site_category}</TableCell>
              <TableCell align="right">{formatValue(row.page_views)}</TableCell>
              <TableCell align="right">{formatValue(row.unique_users)}</TableCell>
              <TableCell align="right">{formatValue(row.entry_page_views)}</TableCell>
              <TableCell>{row.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WebViewsTable;
