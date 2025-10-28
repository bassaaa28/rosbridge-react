import { useEffect, useState } from "react";
import ROSLIB from "roslib";

const CameraView = ({ ros, topicName = "/camera/image_raw/compressed" }) => {
  const [imgData, setImgData] = useState("");

  useEffect(() => {
    if (!ros) return;

    const imageTopic = new ROSLIB.Topic({
      ros: ros,
      name: topicName,
      messageType: "sensor_msgs/CompressedImage",
    });

    imageTopic.subscribe((message) => {
      const data = "data:image/png;base64," + message.data;
      setImgData(data);
    });

    return () => {
      imageTopic.unsubscribe();
    };
  }, [ros, topicName]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-xl font-bold mb-3 text-gray-800">Camera View</h3>
      <div className="w-full overflow-hidden rounded-md">
        {imgData ? (
          <img
            src={imgData}
            alt="Camera Feed"
            className="w-full h-auto object-contain"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
            No camera data
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraView;
