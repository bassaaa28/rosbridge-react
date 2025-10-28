const AccountTab = () => {
  return (
    <div className="h-full overflow-hidden p-6 bg-white">
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        {/* ユーザーアイコン */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl">
          <img src={"/nishidalab_logo.png"} className="w-24 h-24" />
        </div>

        {/* ユーザー情報 */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Nishida Lab</h2>
          <p className="text-gray-600">nishidalab@example.com</p>
        </div>

        {/* ログアウトボタン */}
        <button className=" bg-gray-200 text-gray-700 font-semibold p-5 rounded-lg">
          Logout
        </button>
      </div>
    </div>
  );
};

export default AccountTab;
