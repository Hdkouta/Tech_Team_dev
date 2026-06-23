import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// 数値を表示用に整形
const formatNumber = (value) => Number(value || 0).toLocaleString("ja-JP");

// 前年比較グラフを表示
const YearCompareChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthLabel" />
        <YAxis />
        <Tooltip formatter={(value) => formatNumber(value)} />
        <Legend />
        <Line type="monotone" dataKey="previousYear" name="前年度" stroke="#94a3b8" strokeWidth={2} />
        <Line type="monotone" dataKey="currentYear" name="今年度" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default YearCompareChart;
