import React from 'react';
import { Button } from '../../atoms/Buttons/Button';


interface ModalFooterProps {
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ 
  onClose, 
  onSave, 
  loading 
}) => (
  <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
    <Button
      variant="secondary"
      onClick={onClose}
      disabled={loading}
    >
      Cancel
    </Button>
    <Button
      variant="primary"
      onClick={onSave}
      loading={loading}
    >
      Save Orientation Feedback
    </Button>
  </div>
);