import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  action?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBackButton = false,
  backButtonText = 'Back',
  backButtonPath,
  action,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
            onClick={handleBack}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            {backButtonText}
          </Button>
        )}
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
