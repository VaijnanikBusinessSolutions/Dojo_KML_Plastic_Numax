interface OptionButtonProps {
    option: string;
    isSelected: boolean;
    onClick: () => void;
    variant?: 'default' | 'small';
  }
  
  const OptionButton = ({
    option,
    isSelected,
    onClick,
    variant = 'default'
  }: OptionButtonProps) => {
    const baseClasses = `rounded-lg font-medium transition-all duration-200 flex items-center justify-center cursor-pointer ${
      isSelected
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;
  
    const sizeClasses = variant === 'small'
      ? 'px-3 py-1.5 text-sm'
      : 'px-4 py-2.5';
  
    return (
      <div
        className={`${baseClasses} ${sizeClasses}`}
        onClick={onClick}
      >
        {option}
      </div>
    );
  };
  
  export default OptionButton;