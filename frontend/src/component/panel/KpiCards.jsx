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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

      {/* エントリー数 */}
      <div className="bg-white p-3 rounded shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">エントリー数</p>
          <p className="text-2xl font-bold">
            {selectedKpi.entriesActual.toLocaleString("ja-JP")}
          </p>
        </div>
      </div>

      {/* 達成率 */}
      <div className="bg-white p-3 rounded shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">達成率</p>
          <p className={`text-2xl font-bold ${achievementColor}`}>
            {formatRate(selectedKpi.achievementRate)}
          </p>
        </div>
      </div>

      {/* 承諾率 */}
      <div className="bg-white p-3 rounded shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">承諾率</p>
          <p className={`text-2xl font-bold ${acceptanceColor}`}>
            {formatRate(selectedKpi.acceptanceRate)}
          </p>
        </div>
      </div>

      {/* 前年比 */}
      <div className="bg-white p-3 rounded shadow">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-500">前年比</p>
          <p className={`text-2xl font-bold ${yoyColor}`}>
            {formatSignedRate(selectedKpi.yoy)}
          </p>
        </div>
      </div>

    </div>
  );
};

export default KpiCards;