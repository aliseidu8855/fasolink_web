import React from 'react';
import { useTranslation } from 'react-i18next';

const ICONS = {
  overview: '🏠',
  listings: '📦',
  profile: '👤',
  settings: '⚙️'
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
                 <span aria-hidden="true" style={{fontSize:'1rem', lineHeight:1}}>{ICONS[i.key]}</span>
                 {!collapsed && <span className="full-label">{i.label}</span>}
               </button>
          </li>
        ))}
      </ul>
      <div className="dash-nav-footer">
            <button className="dash-nav-btn danger" onClick={onLogout} title={collapsed ? t('nav.logout') : undefined}>
              <span aria-hidden="true" style={{fontSize:'1rem'}}>⏻</span>
              {!collapsed && <span className="full-label">{t('nav.logout')}</span>}
            </button>
      </div>
    </nav>
  );
};

export default DashboardSidebar;
