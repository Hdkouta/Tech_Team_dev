import { useState } from "react";

function ChartCard({ title, subtitle, description }) {
  return (
    <div className="bg-white rounded shadow p-3 flex flex-col">

      {/* タイトル */}
      <div className="mb-2">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      {/* グラフエリア */}
      <div className="flex-1 flex items-center justify-center text-gray-300 text-sm border rounded">
        グラフ
      </div>

      {/* 説明 */}
      <p className="text-[10px] text-gray-400 mt-1">
        {description}
      </p>

    </div>
  );
}

function App() {
  const [month] = useState("2026年6月");

  return (
    <div className="bg-gray-100 h-screen flex flex-col">

      {/* ヘッダー */}
      <div className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="font-bold">採用KPIダッシュボード</h1>
        <div>{month}</div>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-3">

        {/* KPI */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white p-2 rounded shadow">
            <p className="text-xs text-gray-500">エントリー数</p>
            <p className="font-bold">355</p>
          </div>
          <div className="bg-white p-2 rounded shadow">
            <p className="text-xs text-gray-500">達成率</p>
            <p className="font-bold text-orange-500">99%</p>
          </div>
          <div className="bg-white p-2 rounded shadow">
            <p className="text-xs text-gray-500">承諾率</p>
            <p className="font-bold text-red-500">0%</p>
          </div>
          <div className="bg-white p-2 rounded shadow">
            <p className="text-xs text-gray-500">前年比</p>
            <p className="font-bold text-blue-500">+5%</p>
          </div>
        </div>

        {/* クイック操作 */}
        <div className="bg-white p-2 rounded shadow flex gap-2">
          <button className="bg-blue-500 text-white px-3 py-1 rounded">＋</button>
          <button className="border px-3 py-1 rounded">メモ</button>
          <button className="border px-3 py-1 rounded">🔄</button>
          <button className="border px-3 py-1 rounded">📊</button>
        </div>

        {/* 分析（圧縮） */}
        <div className="bg-white p-2 rounded shadow grid grid-cols-5 text-xs">
          <div>達成率 99%</div>
          <div>前年比 +5%</div>
          <div>通過率 30%</div>
          <div>承諾率 0%</div>
          <div>3媒体</div>
        </div>

        {/* ✅ グラフ（意味付き） */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">

          <ChartCard
            title="目標 vs 実績"
            subtitle="棒：実績 / 線：目標"
            description="達成状況を直感的に把握できる"
          />

          <ChartCard
            title="前年比較"
            subtitle="当年 vs 前年"
            description="トレンドの違い・季節性を確認"
          />

          <ChartCard
            title="達成率推移"
            subtitle="％推移・100%基準"
            description="KPI進捗を時系列で管理"
          />

          <ChartCard
            title="採用ファネル"
            subtitle="通過率バー"
            description="各ステップの離脱箇所を可視化"
          />

        </div>

      </div>
    </div>
  );
}

export default App;
