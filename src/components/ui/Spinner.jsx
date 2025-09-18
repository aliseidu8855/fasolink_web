import React from 'react';

export default function Spinner({ size = 16, stroke = 2, label }) {
  const s = Number(size);
  const r = (s - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span role={label ? 'status' : undefined} aria-label={label} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ transform: 'rotate(-90deg)' }} aria-hidden={!label}>
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="var(--color-border,#ddd)" strokeWidth={stroke} />
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="var(--color-brand,#DE0000)" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * 0.25} strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${s/2} ${s/2}`} to={`360 ${s/2} ${s/2}`} dur="0.9s" repeatCount="indefinite" />
        </circle>
      </svg>
      {label && <span>{label}</span>}
    </span>
  );
}
