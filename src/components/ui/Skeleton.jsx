import React from 'react';
import './Skeleton.css';

/*
  Unified Skeleton component system
  Props:
    - variant: 'rect' | 'text' | 'circle' | 'avatar' | 'inline'
    - width / height: number | string
    - lines (for text variant): number
    - radius: border radius override (px)
    - className: additional classes
    - style: inline style
    - ariaLabel: accessible label when needed (otherwise aria-hidden)
  Accessibility: skeletons are decorative by default (aria-hidden). If you want screen readers
  to announce loading for a region, wrap region with role="status" aria-live="polite" and include
  a visually hidden text node (e.g., <span class="sr-only">Loading messages…</span>) separate from skeleton shapes.
*/

export function Skeleton({ variant = 'rect', width, height, lines = 1, radius, className = '', style, ariaLabel }) {
  const baseStyle = { ...(width ? { '--sk-w': typeof width === 'number' ? width + 'px' : width } : {}), ...(height ? { '--sk-h': typeof height === 'number' ? height + 'px' : height } : {}), ...(radius ? { '--sk-r': radius + 'px' } : {}), ...style };

  if (variant === 'text') {
    return (
      <span className={`skel-text ${className}`} style={baseStyle} aria-hidden={ariaLabel ? undefined : 'true'} aria-label={ariaLabel}>
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className="skel skel-line" style={{ '--sk-line-index': i }} />
        ))}
      </span>
    );
  }
  if (variant === 'avatar' || variant === 'circle') {
    return <span className={`skel skel-circle ${className}`} style={baseStyle} aria-hidden={ariaLabel ? undefined : 'true'} aria-label={ariaLabel} />;
  }
  if (variant === 'inline') {
    return <span className={`skel skel-inline ${className}`} style={baseStyle} aria-hidden={ariaLabel ? undefined : 'true'} aria-label={ariaLabel} />;
  }
  return <span className={`skel skel-rect ${className}`} style={baseStyle} aria-hidden={ariaLabel ? undefined : 'true'} aria-label={ariaLabel} />;
}

export function SkeletonText({ lines = 3, width, className, style }) {
  return <Skeleton variant="text" lines={lines} width={width} className={className} style={style} />;
}

export function SkeletonAvatar({ size = 40, className, style }) {
  return <Skeleton variant="avatar" width={size} height={size} radius={size/2} className={className} style={style} />;
}

export function SkeletonBlock(props) {
  return <Skeleton {...props} />;
}

export default Skeleton;