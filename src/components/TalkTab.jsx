import { useState, useEffect, useRef } from "react";
import ROSLIB from "roslib";

const TalkTab = ({ ros }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentBotMessage, setCurrentBotMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // ROS Topics
  const userInputTopic = useRef(null);
  const responseStreamTopic = useRef(null);
  const responseTopic = useRef(null);
  const audioTopic = useRef(null);
  const audioInputTopic = useRef(null);
  const transcriptionTopic = useRef(null);
  
  // 音声録音用
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (!ros) return;

    // ROS Topicの初期化
    userInputTopic.current = new ROSLIB.Topic({
      ros: ros,
      name: '/user_input',
      messageType: 'std_msgs/String'
    });

    responseStreamTopic.current = new ROSLIB.Topic({
      ros: ros,
      name: '/chatbot_response_stream',
      messageType: 'std_msgs/String'
    });

    responseTopic.current = new ROSLIB.Topic({
      ros: ros,
      name: '/chatbot_response',
      messageType: 'std_msgs/String'
    });

    audioTopic.current = new ROSLIB.Topic({
      ros: ros,
      name: '/tts_audio_data',
      messageType: 'std_msgs/UInt8MultiArray'
    });

    // 音声入力用トピック
    audioInputTopic.current = new ROSLIB.Topic({
      ros: ros,
      name: '/audio_input',
      messageType: 'std_msgs/UInt8MultiArray'
    });

    // 転写結果受信用トピック
    transcriptionTopic.current = new ROSLIB.Topic({
      ros: ros,
      name: '/transcription_result',
      messageType: 'std_msgs/String'
    });

    // ストリーミング応答の購読
    responseStreamTopic.current.subscribe((message) => {
      handleStreamChunk(message.data);
    });

    // 完了応答の購読
    responseTopic.current.subscribe((message) => {
      handleCompleteResponse(message.data);
    });

    // TTS音声の購読
    audioTopic.current.subscribe((message) => {
      handleAudioResponse(message.data);
    });

    // 転写結果の購読
    transcriptionTopic.current.subscribe((message) => {
      handleTranscriptionResult(message.data);
    });

    setIsConnected(true);

    return () => {
      responseStreamTopic.current?.unsubscribe();
      responseTopic.current?.unsubscribe();
      audioTopic.current?.unsubscribe();
      transcriptionTopic.current?.unsubscribe();
      setIsConnected(false);
    };
  }, [ros]);

  // ストリーミングチャンクの処理
  const handleStreamChunk = (chunk) => {
    setCurrentBotMessage(prev => {
      const newText = (prev?.text || '') + chunk;
      return {
        type: 'ai',
        text: newText,
        timestamp: prev?.timestamp || new Date().toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        streaming: true
      };
    });
  };

  // 完了応答の処理
  const handleCompleteResponse = (response) => {
    if (currentBotMessage) {
      setMessages(prev => [...prev, { ...currentBotMessage, streaming: false }]);
      setCurrentBotMessage(null);
    }
  };

  // TTS音声の処理
  const handleAudioResponse = (audioData) => {
    try {
      // UInt8Arrayから音声データを復元
      const audioBytes = new Uint8Array(audioData);
      const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      
      // 再生終了後にURLを解放
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('音声再生エラー:', error);
    }
  };

  // 転写結果の処理
  const handleTranscriptionResult = (text) => {
    if (text.trim()) {
      setInputText(text);
      // 自動送信する場合は以下のコメントアウトを外す
      // handleSendMessage(text);
    }
  };

  // テキスト送信
  const handleSend = () => {
    if (!inputText.trim() || !isConnected) return;
    handleSendMessage(inputText);
    setInputText("");
  };

  const handleSendMessage = (text) => {
    // ユーザーメッセージを表示
    setMessages(prev => [...prev, {
      type: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }]);

    // ROSトピックに送信
    const message = new ROSLIB.Message({
      data: text
    });
    userInputTopic.current.publish(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 音声録音開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType: 'audio/webm' 
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });
        sendAudioToROS(audioBlob);
        
        // ストリームを停止
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('録音開始エラー:', error);
      alert('マイクへのアクセスが拒否されました');
    }
  };

  // 音声録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 音声データをROSに送信
  const sendAudioToROS = async (audioBlob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const message = new ROSLIB.Message({
        data: Array.from(uint8Array)
      });
      
      audioInputTopic.current.publish(message);
      
    } catch (error) {
      console.error('音声送信エラー:', error);
    }
  };

  // 音声入力ボタンの処理
  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 接続状態表示 */}
      <div className="p-2 bg-gray-100 text-center">
        <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? '🟢 ROS接続中' : '🔴 ROS未接続'}
        </span>
      </div>

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
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
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
        
        {/* 現在入力中のボットメッセージ */}
        {currentBotMessage && (
          <div className="flex justify-start">
            <div className="mr-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg">🧠</span>
              </div>
            </div>
            <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-amber-50 text-gray-800 animate-pulse">
              <p className="text-sm whitespace-pre-wrap">{currentBotMessage.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {currentBotMessage.timestamp} (入力中...)
              </p>
            </div>
          </div>
        )}
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
            disabled={!isConnected}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !inputText.trim()}
            className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:bg-gray-300"
          >
            →
          </button>
          <button 
            onClick={handleVoiceInput}
            disabled={!isConnected}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:bg-gray-300`}
          >
            🎤
          </button>
        </div>
        
        {/* 録音状態表示 */}
        {isRecording && (
          <div className="mt-2 text-center">
            <span className="text-sm text-red-600 animate-pulse">
              🔴 録音中... (クリックで停止)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalkTab;
