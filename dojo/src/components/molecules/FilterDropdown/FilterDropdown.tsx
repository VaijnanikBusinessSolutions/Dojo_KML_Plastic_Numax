import React from 'react';

import { ChevronDown } from 'lucide-react';
import { Button } from '../../atoms/Buttons/Button';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  title: string;
  currentValue: string;
  options: FilterOption[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  icon: any;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  title,
  currentValue,
  options,
  onSelect,
  isOpen,
  setIsOpen,
  icon
}) => (
  <div className="relative">
    <Button
      variant="secondary"
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center px-4 py-2"
    >
      <Icon icon={icon} className="mr-2 text-blue-600" />
      <span>{options.find(opt => opt.value === currentValue)?.label || title}</span>
      <Icon icon={ChevronDown} className="ml-2" size={16} />
    </Button>
    {isOpen && (
      <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
        <div className="py-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);