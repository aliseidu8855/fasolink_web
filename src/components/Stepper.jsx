import React from 'react';
import './Stepper.css';

/**
 * Stepper component
 * props:
 *  steps: [{ key, label }]
 *  current: step key
 *  onSelect?: (key)=>void
 */
export default function Stepper({ steps, current, onSelect }) {
  return (
    <ol className="cl-stepper" role="list">
      {steps.map((s, idx) => {
        const state = s.key === current ? 'current' : (steps.findIndex(st=>st.key===current) > idx ? 'done' : 'upcoming');
        return (
          <li key={s.key} className={`cl-stepper-item state-${state}`}> 
            <button
              type="button"
              className="cl-stepper-btn"
              aria-current={state==='current' ? 'step' : undefined}
              onClick={()=> onSelect && onSelect(s.key)}
              disabled={!onSelect || state==='current'}
            >
              <span className="cl-step-index">{idx+1}</span>
              <span className="cl-step-label">{s.label}</span>
            </button>
            {idx < steps.length-1 && <span className="cl-step-connector" aria-hidden></span>}
          </li>
        );
      })}
    </ol>
  );
}
