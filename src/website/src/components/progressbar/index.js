export default function ProgressBar({ progress = 0, label }) {
  return (
    <div className="block w-full">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-blue-500 dark:text-white">
          {label}
        </span>
        <span className="text-sm font-medium text-blue-500 dark:text-white">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-500 h-2.5 rounded-full transition-all"
          style={{
            width: progress + "%",
          }}
        ></div>
      </div>
    </div>
  );
}
