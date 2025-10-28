import { useState } from "react";
import RosConnection from "./components/RosConnection";
import CameraView from "./components/CameraView";
import Scene3D from "./components/Scene3D";
import TopicMonitor from "./components/TopicMonitor";
import JointStatesViewer from "./components/JointStatesViewer";

function App() {
  const [ros, setRos] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <RosConnection
        rosUrl="ws://localhost:9090"
        rosDomainId="89"
        setRos={setRos}
      />

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            ROS 2 RViz Web App
          </h1>
          <p className="mt-2 text-gray-600">
            Connection Status:{" "}
            <span id="status" className="text-gray-500 font-semibold">
              Disconnected
            </span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {ros ? (
          <div className="space-y-6">
            {/* Top Row - 3D Visualization and Camera */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 3D Visualization - 2/3 width on large screens */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    3D Visualization
                  </h2>
                  <Scene3D ros={ros} />
                </div>
              </div>

              {/* Camera View - 1/3 width on large screens */}
              <div className="lg:col-span-1">
                <CameraView
                  ros={ros}
                  topicName="/camera/image_raw/compressed"
                />
              </div>
            </div>

            {/* Second Row - Joint States */}
            <div className="grid grid-cols-1 gap-6">
              <JointStatesViewer ros={ros} />
            </div>

            {/* Third Row - Topic Monitor */}
            <div className="grid grid-cols-1 gap-6">
              <TopicMonitor ros={ros} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="text-6xl mb-4">🔌</div>
              <p className="text-xl text-gray-600">
                Waiting for ROS connection...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure rosbridge_server is running on ws://localhost:9090
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>NISHIDALAB</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
