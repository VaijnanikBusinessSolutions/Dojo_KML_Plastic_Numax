import { X } from 'lucide-react';

interface RemoveButtonProps {
  onClick: () => void;
}

const RemoveButton = ({ onClick }: RemoveButtonProps) => (
  <button
    onClick={onClick}
    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
  >
    <X size={16} />
  </button>
);

export default RemoveButton;