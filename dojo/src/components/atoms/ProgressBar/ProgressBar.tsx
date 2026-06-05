interface ProgressBarProps {
    step: number;
  }
  
  const ProgressBar = ({ step }: ProgressBarProps) => (
    <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
        style={{ width: `${step * 50}%` }}
      />
    </div>
  );
  
  export default ProgressBar;