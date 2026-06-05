import React from 'react';
import { Button } from '../../atoms/Buttons/Button';
import { Icon } from '../../atoms/Icons/Icon';
import { useNavigate } from "react-router-dom";

interface NavigationControlsProps {
  onBack?: () => void;
  onHome?: () => void;
  className?: string;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onBack,
  onHome,
  className = ''
}) => {

  const navigate = useNavigate();
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        variant="icon"
        // onClick={onBack}
        onClick={() => navigate(-1)}
        className="hidden sm:inline-flex"
        aria-label="Go back"
        title="Go back"
      >
        <Icon name="back" />
      </Button>

      <Button
        variant="icon"
        // onClick={onHome}
        onClick={() => navigate("/home")}
        aria-label="Go home"
        title="Home"
      >
        <Icon name="home" />
      </Button>
    </div>
  );
};