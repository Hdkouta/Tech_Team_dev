import React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// 数値を表示用に整形
const formatNumber = (value) => Number(value || 0).toLocaleString("ja-JP");

// 目標と実績グラフを表示
const GoalResultChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthLabel" />
        <YAxis />
        <Tooltip formatter={(value) => formatNumber(value)} />
        <Legend />
        <Bar dataKey="entriesActual" name="実績" fill="#60a5fa" />
        <Line type="monotone" dataKey="entriesTarget" name="目標" stroke="#f97316" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default GoalResultChart;
