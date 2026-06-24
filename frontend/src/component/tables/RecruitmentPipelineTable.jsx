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

const RecruitmentPipelineTable = ({ rows }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>月</TableCell>
            <TableCell>部署</TableCell>
            <TableCell>職種</TableCell>
            <TableCell align="right">計画人数</TableCell>
            <TableCell align="right">応募者</TableCell>
            <TableCell align="right">書類通過</TableCell>
            <TableCell align="right">1次通過</TableCell>
            <TableCell align="right">最終通過</TableCell>
            <TableCell align="right">内定</TableCell>
            <TableCell align="right">採用数</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.month}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell>{row.position}</TableCell>
              <TableCell align="right">{formatValue(row.planned_hires)}</TableCell>
              <TableCell align="right">{formatValue(row.applicants)}</TableCell>
              <TableCell align="right">{formatValue(row.document_pass)}</TableCell>
              <TableCell align="right">{formatValue(row.first_interview_pass)}</TableCell>
              <TableCell align="right">{formatValue(row.final_interview_pass)}</TableCell>
              <TableCell align="right">{formatValue(row.offers)}</TableCell>
              <TableCell align="right">{formatValue(row.hires)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecruitmentPipelineTable;
