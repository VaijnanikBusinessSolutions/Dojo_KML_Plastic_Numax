import React from 'react';


import { Button } from '../../atoms/Buttons/Button';
import type { User } from '../../constants/types';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  user: User;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ user, onClose }) => (
  <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200 rounded-t-lg">
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border">
        <span className="text-blue-700 font-semibold">
          {user.first_name.charAt(0)}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {user.first_name}
        </h3>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      aria-label="Close modal"
    >
      <Icon icon={X} size={24} />
    </Button>
  </div>
);