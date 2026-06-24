import React from "react";

// 補助KPI情報を表示
const MiniInfo = ({ selectedKpi, formatRate, formatSignedRate, metricCount }) => {
  return (
    <div className="bg-white p-2 rounded shadow grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
      <div>達成率 {formatRate(selectedKpi.achievementRate)}</div>
      <div>前年比 {formatSignedRate(selectedKpi.yoy)}</div>
      <div>通過率 {formatRate(selectedKpi.passRate)}</div>
      <div>承諾率 {formatRate(selectedKpi.acceptanceRate)}</div>
      <div>指標数 {metricCount}</div>
    </div>
  );
};

export default MiniInfo;
