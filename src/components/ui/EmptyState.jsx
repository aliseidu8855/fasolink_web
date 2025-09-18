import React from 'react';
import Card from './Card';
import Button from '../Button';
import './EmptyState.css';

// EmptyState primitive
// Props: title, description, illustration (img src), primaryAction { label, onClick }, secondaryAction { label, onClick }
export default function EmptyState({
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  className = '',
}) {
  return (
    <Card className={`empty ${className}`} padding="lg">
      {illustration && <img className="empty__illustration" src={illustration} alt="" aria-hidden="true" />}
      {title && <h2 className="empty__title">{title}</h2>}
      {description && <p className="empty__desc">{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="empty__actions">
          {primaryAction && (
            <Button variant="primary" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
