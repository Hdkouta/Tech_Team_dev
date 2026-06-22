import { useState } from "react";

function App() {
  const [month, setMonth] = useState("2026年6月");

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* ===================== */}
      {/* ヘッダー */}
      {/* ===================== */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📊 採用KPI分析ダッシュボード
        </h1>

        <div className="bg-blue-400 px-4 py-2 rounded-lg">
          対象期間：{month}
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ===================== */}
        {/* フィルター＋ボタン */}
        {/* ===================== */}
        <div className="flex justify-between items-center">
          <div className="bg-white p-3 rounded-lg shadow flex items-center gap-2">
            <span>対象期間</span>

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option>2026年6月</option>
              <option>2026年5月</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button className="border border-blue-500 text-blue-500 px-5 py-2 rounded-lg">
              共有
            </button>
            <button className="border border-blue-500 text-blue-500 px-5 py-2 rounded-lg">
              Excel出力
            </button>
          </div>
        </div>

        {/* ===================== */}
        {/* KPIカード */}
        {/* ===================== */}
        <div>
          <h2 className="font-bold text-lg mb-3">重要指標サマリー</h2>

          <div className="grid grid-cols-3 gap-4">

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">総エントリー</p>
              <p className="text-4xl font-bold text-orange-500">99%</p>
              <span className="bg-yellow-200 text-yellow-700 px-3 py-1 rounded mt-2 inline-block">
                やや未達
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">自社エントリー</p>
              <p className="text-4xl font-bold text-orange-500">70%</p>
              <span className="bg-yellow-200 text-yellow-700 px-3 py-1 rounded mt-2 inline-block">
                注意
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">内定承諾</p>
              <p className="text-4xl font-bold text-red-500">0%</p>
              <span className="bg-red-200 text-red-600 px-3 py-1 rounded mt-2 inline-block">
                要対応
              </span>
            </div>

          </div>
        </div>

        {/* ===================== */}
        {/* アラート＋グラフ */}
        {/* ===================== */}
        <div className="grid grid-cols-2 gap-6">

          {/* アラート */}
          <div>
            <h2 className="font-bold text-lg mb-3">課題アラート</h2>

            <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
              <ul className="text-red-600 space-y-2">
                <li>● 内定承諾数が目標未達です</li>
                <li>● 2次面接以降の進捗が不足しています</li>
                <li>● 自社エントリー数が目標を下回っています</li>
              </ul>
            </div>
          </div>

          {/* グラフ（仮） */}
          <div>
            <h2 className="font-bold text-lg mb-3">月次推移グラフ</h2>

            <div className="bg-white p-5 rounded-xl shadow h-48 flex items-center justify-center text-gray-400">
              グラフエリア（Chart.jsなどで実装）
            </div>
          </div>

        </div>

        {/* ===================== */}
        {/* ファネル */}
        {/* ===================== */}
        <div>
          <h2 className="font-bold text-lg mb-3">採用ファネル</h2>

          <div className="bg-white p-4 rounded-xl shadow flex items-center justify-between">

            <div className="text-center">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                エントリー
              </div>
              <p className="text-xl font-bold">355</p>
            </div>

            <span>＞</span>

            <div className="text-center">
              <p>1次面接</p>
              <p className="text-xl font-bold">1</p>
            </div>

            <span>＞</span>

            <div className="text-center">
              <p>2次面接</p>
              <p className="text-xl font-bold">0</p>
            </div>

            <span>＞</span>

            <div className="text-center">
              <p>内定</p>
              <p className="text-xl font-bold">0</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default App;

