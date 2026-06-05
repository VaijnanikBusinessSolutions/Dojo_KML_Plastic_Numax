import React from 'react';
import { Icon } from '../../atoms/LucidIcons/LucidIcons';
import { Users } from 'lucide-react';

interface EmptyStateProps {
  hasUsers: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasUsers }) => (
  <div className="bg-white p-12 text-center">
    <Icon icon={Users} size={48} className="mx-auto text-gray-400 mb-4" />
    <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
    <p className="mt-2 text-sm text-gray-500">
      {!hasUsers
        ? "There are currently no users in the system."
        : "No users match your current filters. Try adjusting your search criteria."}
    </p>
  </div>
);