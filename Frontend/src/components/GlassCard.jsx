import React from 'react';
import clsx from 'clsx';
import '../styles/components/_common.scss';

const GlassCard = ({ children, className, interactive = false, onClick }) => {
  return (
    <div 
      className={clsx('glass-card', { interactive }, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
