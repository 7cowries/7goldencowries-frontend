const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden mt-2">
      <div
        className="h-4 bg-yellow-400"
        style={{ width: `${Math.min(100, progress * 100)}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
