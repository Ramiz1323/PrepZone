import React from 'react';
import clsx from 'clsx';
import '../styles/components/_skeleton.scss';

export const SkeletonBox = ({ className, style }) => (
  <div className={clsx('skeleton-box', className)} style={style}></div>
);

export const SkeletonText = ({ className, width, height }) => (
  <div className={clsx('skeleton-text', className)} style={{ width, height }}></div>
);

export const SkeletonCard = ({ className }) => (
  <div className={clsx('skeleton-card', className)}>
    <SkeletonBox className="skeleton-icon" />
    <div className="skeleton-content">
      <SkeletonText width="60%" height="16px" className="mb-2" />
      <SkeletonText width="40%" height="24px" />
    </div>
  </div>
);

export const SkeletonChart = ({ className }) => (
  <div className={clsx('skeleton-chart', className)}>
    <SkeletonText width="30%" height="20px" className="mb-4" />
    <SkeletonBox width="100%" height="200px" />
  </div>
);
