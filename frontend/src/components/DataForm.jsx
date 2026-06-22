function DataForm() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="font-bold mb-4">データ入力</h2>

      <input type="text" placeholder="指標"
        className="border p-2 w-full mb-2" />

      <input type="number" placeholder="値"
        className="border p-2 w-full mb-2" />

      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        登録
      </button>

    </div>
  );
}

export default DataForm;


