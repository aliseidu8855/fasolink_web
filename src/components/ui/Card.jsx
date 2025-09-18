import React from 'react';
import './Card.css';

// Card primitive
// Props:
// - interactive: boolean adds hover lift
// - padding: 'sm' | 'md' | 'lg'
// - elevated: boolean adds stronger shadow
// - as: element type (defaults to div)
// - className: extra classes
const Card = (props) => {
  const {
    as = 'div',
    interactive = false,
    elevated = false,
    padding = 'md',
    className = '',
    children,
    ...rest
  } = props;
  const Tag = as;
  const classes = [
    'card',
    interactive ? 'card--interactive' : '',
    elevated ? 'card--elevated' : '',
    padding ? `card--p-${padding}` : '',
    className
  ].filter(Boolean).join(' ');

  return <Tag className={classes} {...rest}>{children}</Tag>;
};

export default Card;
