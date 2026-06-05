// AddInput.tsx
import { Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface AddInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  options?: string[];
  onSelect?: (value: string) => void;
}

const AddInput = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  onAdd, 
  options = [],
  onSelect = () => {}
}: AddInputProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onChange(option);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col space-y-2 relative">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-l-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
          />
          {options.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
              {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <div
                      key={option}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-r-lg flex items-center justify-center"
          disabled={!value.trim()}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default AddInput;
