import React from "react";

// 年月選択と表示切替を表示
const TopPick = ({
  selectedYear,
  yearOptions,
  onYearChange,
  selectedMonth,
  monthOnlyOptions,
  onMonthChange,
  showDataView,
  onToggleView,
}) => {
  return (
    <div className="flex items-center gap-2">
      <select
        className="bg-white text-gray-800 text-sm sm:text-base px-2 py-1 rounded"
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        disabled={yearOptions.length === 0}
      >
        {yearOptions.length === 0 && (
          <option value="">データなし</option>
        )}
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}年
          </option>
        ))}
      </select>

      <select
        className="bg-white text-gray-800 text-sm sm:text-base px-2 py-1 rounded"
        value={selectedMonth ? selectedMonth.slice(5, 7) : ""}
        onChange={(e) => onMonthChange(e.target.value)}
        disabled={monthOnlyOptions.length === 0 || !selectedYear}
      >
        {monthOnlyOptions.length === 0 && (
          <option value="">月なし</option>
        )}
        {monthOnlyOptions.map((month) => (
          <option key={month} value={month}>
            {Number(month)}月
          </option>
        ))}
      </select>

      <button
        type="button"
        className={`text-sm font-medium px-3 py-1 rounded ${showDataView ? "border border-white text-white" : "bg-white text-blue-600"}`}
        onClick={onToggleView}
      >
        {showDataView ? "ダッシュボードを表示" : "データを表示"}
      </button>
    </div>
  );
};

export default TopPick;
