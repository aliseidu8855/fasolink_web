import React from 'react';
import { useTranslation } from 'react-i18next';
import { HomeIcon, CategoryIcon, UserIcon } from '../icons/Icons.jsx';

const ICONS = {
  overview: <HomeIcon size={18} />, // sketch-like line icons
  listings: <CategoryIcon size={18} />, // reuse grid icon for listings
  profile: <UserIcon size={18} />,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 1 1 0 4h-.09c-.65 0-1.29.26-1.77.73z"/></svg>
};

const DashboardSidebar = ({ current, onChange, onLogout, collapsed }) => {
  const { t } = useTranslation('dashboard');
  const items = [
    { key: 'overview', label: t('nav.overview') },
    { key: 'listings', label: t('nav.listings') },
    { key: 'profile', label: t('nav.profile') },
    { key: 'settings', label: t('nav.settings') }
  ];
  return (
    <nav className="dash-nav">
      <div className="dash-brand">{t('layout.brand','Mon Compte')}</div>
      <ul className="dash-nav-list">
        {items.map(i => (
          <li key={i.key}>
               <button
                 className={"dash-nav-btn" + (current === i.key ? ' active' : '')}
                 onClick={() => onChange(i.key)}
                 aria-current={current === i.key ? 'page' : undefined}
                 title={collapsed ? i.label : undefined}
               >
                 <span aria-hidden="true" className="dash-icon" style={{lineHeight:1}}>{ICONS[i.key]}</span>
                 {!collapsed && <span className="full-label">{i.label}</span>}
               </button>
          </li>
        ))}
      </ul>
      <div className="dash-nav-footer">
            <button className="dash-nav-btn danger" onClick={onLogout} title={collapsed ? t('nav.logout') : undefined}>
              <span aria-hidden="true" className="dash-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="12" /><path d="M5 6a9 9 0 1 0 14 0"/></svg>
              </span>
              {!collapsed && <span className="full-label">{t('nav.logout')}</span>}
            </button>
      </div>
    </nav>
  );
};

export default DashboardSidebar;
