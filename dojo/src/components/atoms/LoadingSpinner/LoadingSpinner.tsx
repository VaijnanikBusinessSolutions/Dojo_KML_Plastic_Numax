interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
  }
  
  const LoadingSpinner = ({ size = 'medium', text }: LoadingSpinnerProps) => {
    const sizeClasses = {
      small: 'h-6 w-6',
      medium: 'h-8 w-8',
      large: 'h-12 w-12'
    };
  
    return (
      <div className="text-center py-4">
        <div 
          className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 mx-auto ${sizeClasses[size]}`}
        />
        {text && (
          <p className={`mt-2 text-gray-600 ${size === 'small' ? 'text-sm' : ''}`}>
            {text}
          </p>
        )}
      </div>
    );
  };
  
  export default LoadingSpinner;