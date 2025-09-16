import React from 'react';

export const FacebookIcon = ({ size = 18, title = 'Facebook', ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
    {...rest}
  >
    <title>{title}</title>
    <path fill="currentColor" d="M13.6 20.8v-7.2h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.2 1.2-1.2h1.6V4.6c-.3 0-1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2H8.8v2.8h2.2v7.2h2.6Z" />
  </svg>
);

export const TwitterIcon = ({ size = 18, title = 'Twitter / X', ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
    {...rest}
  >
    <title>{title}</title>
    <path fill="currentColor" d="M17.5 3h3.2l-7 8.1L22 21h-6.9l-5.4-7-6.2 7H.3l7.5-8.6L.2 3H7l4.9 6.3L17.5 3Zm-1.2 16h1.8L7.8 4.8H5.8L16.3 19Z" />
  </svg>
);

export const InstagramIcon = ({ size = 18, title = 'Instagram', ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
    {...rest}
  >
    <title>{title}</title>
    <path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2A2.8 2.8 0 1 0 12 15a2.8 2.8 0 0 0 0-5.6ZM17.8 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
  </svg>
);

// Utility component example if needed for mapping (not used directly yet)
export const SocialIconsBar = ({ size = 18, labels = { fb: 'Facebook', tw: 'Twitter / X', ig: 'Instagram' } }) => (
  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
    <FacebookIcon size={size} title={labels.fb} />
    <TwitterIcon size={size} title={labels.tw} />
    <InstagramIcon size={size} title={labels.ig} />
  </div>
);

export default SocialIconsBar;
