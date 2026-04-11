import React from 'react';
import clsx from 'clsx';
import '../styles/components/_common.scss';

const Button = ({ children, variant = 'primary', isLoading, className, ...props }) => {
  return (
    <button 
      className={clsx('btn', `btn-${variant}`, isLoading && 'loading', className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="spinner"></span> : children}
    </button>
  );
};

export default Button;
