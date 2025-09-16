import React from 'react';
import './skeletons.css';

export function SkeletonBlock({ width='100%', height=16, radius=6, style }) {
  return <span className="sk-block" style={{ width, height, borderRadius:radius, ...style }} />;
}

export function PageSkeleton(){
  return (
    <div className="page-skeleton">
      <SkeletonBlock width="55%" height={24} style={{marginBottom:16}} />
      <SkeletonBlock width="100%" height={180} style={{marginBottom:20}} />
      <div className="sk-grid">
        {Array.from({length:6}).map((_,i)=>(<SkeletonBlock key={i} height={90} />))}
      </div>
    </div>
  );
}

export default PageSkeleton;