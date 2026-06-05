import React from 'react';

import { Search } from 'lucide-react';
import { Input } from '../../atoms/Inputs/Inputs';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => (
  <div className="relative w-full sm:w-auto">
    <Input
      label=""
      type="text"
      id="search"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search by first name"
      icon={<Icon icon={Search} className="text-gray-400" />}
    />
  </div>
);