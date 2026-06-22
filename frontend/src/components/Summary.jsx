function Summary() {
  return (
    <div className="grid grid-cols-3 gap-4">

      <div className="bg-white p-5 rounded-xl shadow">
        <p className="text-gray-500">総エントリー</p>
        <p className="text-3xl font-bold text-orange-500">99%</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <p className="text-gray-500">自社エントリー</p>
        <p className="text-3xl font-bold text-orange-500">70%</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <p className="text-gray-500">内定承諾</p>
        <p className="text-3xl font-bold text-red-500">0%</p>
      </div>

    </div>
  );
}

export default Summary;
``
