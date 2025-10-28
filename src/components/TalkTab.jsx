import { useState } from "react";

const TalkTab = () => {
  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "今日のタスクは何ですか?",
      timestamp: "10:30",
    },
    {
      type: "user",
      text: "近くのペットボトルを青色のコンテナに入れて",
      timestamp: "10:31",
    },
    {
      type: "ai",
      text: "ペットボトルを探します",
      timestamp: "10:32",
    },
    {
      type: "ai",
      text: "ロボットの動作をシミュレーションで確認してください",
      timestamp: "10:33",
    },
  ]);

  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      setMessages([
        ...messages,
        {
          type: "user",
          text: inputText,
          timestamp: new Date().toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setInputText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* チャット履歴 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === "ai" ? "justify-start" : "justify-end"
            }`}
          >
            {msg.type === "ai" && (
              <div className="mr-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg">🧠</span>
                </div>
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.type === "ai"
                  ? "bg-amber-50 text-gray-800"
                  : "bg-cyan-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
            </div>
            {msg.type === "user" && (
              <div className="ml-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <img
                    src={"/nishidalab_logo.png"}
                    alt="logo"
                    className="w-8 h-8"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            →
          </button>
          <button className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
            🎤
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalkTab;
