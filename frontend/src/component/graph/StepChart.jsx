import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// 数値を表示用に整形
const formatNumber = (value) => Number(value || 0).toLocaleString("ja-JP");

// ファネル棒グラフを表示
const StepBarChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="stage" type="category" width={86} />
        <Tooltip formatter={(value) => formatNumber(value)} />
        <Bar dataKey="value" name="実績" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StepBarChart;
