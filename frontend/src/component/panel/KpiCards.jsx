import React from "react";

// KPIカードを表示
const KpiCards = ({
  selectedKpi,
  formatRate,
  formatSignedRate,
  achievementColor,
  acceptanceColor,
  yoyColor,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      <div className="bg-white p-2 rounded shadow">
        <p className="text-xs text-gray-500">エントリー数</p>
        <p className="font-bold">{selectedKpi.entriesActual.toLocaleString("ja-JP")}</p>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <p className="text-xs text-gray-500">達成率</p>
        <p className={`font-bold ${achievementColor}`}>{formatRate(selectedKpi.achievementRate)}</p>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <p className="text-xs text-gray-500">承諾率</p>
        <p className={`font-bold ${acceptanceColor}`}>{formatRate(selectedKpi.acceptanceRate)}</p>
      </div>
      <div className="bg-white p-2 rounded shadow">
        <p className="text-xs text-gray-500">前年比</p>
        <p className={`font-bold ${yoyColor}`}>{formatSignedRate(selectedKpi.yoy)}</p>
      </div>
    </div>
  );
};

export default KpiCards;
