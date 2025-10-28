import { useEffect, useState } from "react";

const TopicMonitor = ({ ros }) => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (!ros) return;

    ros.getTopics((result) => {
      setTopics(result.topics);
    });
  }, [ros]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-xl font-bold mb-3 text-gray-800">Active Topics</h3>
      <div className="max-h-96 overflow-y-auto">
        <ul className="space-y-2">
          {topics.map((topic, index) => (
            <li key={index} className="text-sm text-gray-700 border-b pb-2">
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TopicMonitor;
