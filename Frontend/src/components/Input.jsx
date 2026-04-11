import React from 'react';
import clsx from 'clsx';
import '../styles/components/_common.scss';

const Input = ({ label, error, className, ...props }) => {
  return (
    <div className={clsx('input-group', className)}>
      {label && <label className="input-label">{label}</label>}
      <input className={clsx('glass-input', error && 'has-error')} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;
