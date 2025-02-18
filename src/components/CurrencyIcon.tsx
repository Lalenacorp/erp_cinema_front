import React from 'react';
import { getCurrencyIcon } from '../utils/formatters';

interface CurrencyIconProps {
  currency?: string;
  className?: string;
}

const CurrencyIcon: React.FC<CurrencyIconProps> = ({ currency = 'EUR', className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {getCurrencyIcon(currency)}
    </div>
  );
};

export default CurrencyIcon;