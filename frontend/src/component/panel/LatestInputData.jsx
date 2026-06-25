function LatestInputData({
  latestInputRow,
  latestInputMetricName,
  formatMonthDisplay,
}) {
  return (
    <div className="bg-white rounded shadow p-3 border border-gray-200">
      <p className="font-bold text-sm md:text-base text-gray-900 mb-2">直近の入力データ</p>
      {latestInputRow ? (
        <div className="flex flex-wrap items-center gap-x-10 gap-y-2 text-sm md:text-base text-gray-900">
          <span className="font-bold">{formatMonthDisplay(latestInputRow.target_month)}</span>
          <span className="font-bold">{latestInputMetricName}</span>
          <span>
            目標：
            <span className="font-bold ml-1">
              {Number(latestInputRow.target_total || 0).toLocaleString("ja-JP")}
            </span>
          </span>
          <span>
            実績（新卒）
            <span className="font-bold ml-1">
              {Number(latestInputRow.actual_new_graduate || 0).toLocaleString("ja-JP")}
            </span>
          </span>
          <span>
            実績（中途）
            <span className="font-bold ml-1">
              {Number(latestInputRow.actual_mid_career || 0).toLocaleString("ja-JP")}
            </span>
          </span>
        </div>
      ) : (
        <p className="text-sm md:text-base text-gray-700">データがありません</p>
      )}
    </div>
  );
}

export default LatestInputData;
