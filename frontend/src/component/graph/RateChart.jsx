import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// 率を表示用に整形
const formatRate = (value) => `${Number(value || 0).toFixed(1)}%`;

// 達成率推移グラフを表示
const RateTrendChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthLabel" />
        <YAxis domain={[0, 150]} />
        <Tooltip formatter={(value) => formatRate(value)} />
        <Legend />
        <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="6 4" label="基準(100%)" />
        <Line type="monotone" dataKey="achievementRate" name="達成率" stroke="#10b981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RateTrendChart;
