import React, { useMemo } from 'react';

// Simple avatar component: if src provided it uses the image; otherwise renders initials with a deterministic color.
const InitialsAvatar = ({ name = '?', src, size = 40, className = '', alt }) => {
  const initials = useMemo(() => (name || '?').trim().slice(0, 1).toUpperCase(), [name]);
  const hue = useMemo(() => {
    const str = name || 'user';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 360;
  }, [name]);
  const bg = `hsl(${hue} 70% 45%)`;
  const fg = '#fff';

  if (src) {
    return <img src={src} alt={alt || name} className={className} style={{ width: size, height: size, borderRadius: '50%' }} />;
  }
  return (
    <span
      className={className}
      aria-hidden={alt ? 'true' : undefined}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: bg,
        color: fg,
        fontWeight: 700,
        fontSize: Math.max(10, Math.floor(size / 3)),
      }}
    >
      {initials}
    </span>
  );
};

export default InitialsAvatar;
