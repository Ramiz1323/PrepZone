import React, { Suspense } from 'react';
import { SkeletonBox } from './Skeleton';

const PageLoader = () => {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBox width="30%" height="40px" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <SkeletonBox height="120px" />
        <SkeletonBox height="120px" />
        <SkeletonBox height="120px" />
      </div>
      <SkeletonBox height="300px" />
    </div>
  );
};

export default PageLoader;
