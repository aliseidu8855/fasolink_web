import React, { useState, useEffect } from 'react';
import './dashboard.css';
import DashboardSidebar from './DashboardSidebar';
import { useTranslation } from 'react-i18next';

// Unified layout using class names that match dashboard.css
const DashboardLayout = ({ active, onNavigate, onLogout, children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('dashCollapsed') === '1'; } catch { return false; }
  });

  useEffect(()=>{
    try { localStorage.setItem('dashCollapsed', collapsed ? '1' : '0'); } catch { /* ignore */ }
  }, [collapsed]);
  const { t } = useTranslation('dashboard');
  return (
    <div className={`dashboard-shell${collapsed ? ' collapsed' : ''}`}>
      <aside className="sidebar" aria-label="Navigation du tableau de bord">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.5rem', marginBottom:'.25rem'}}>
          <span style={{fontWeight:600}}>{collapsed ? 'TB' : t('layout.brand','Tableau')}</span>
          <button
            type="button"
            className="collapse-btn"
            aria-label={collapsed ? t('layout.collapse.expand') : t('layout.collapse.collapse')}
            aria-expanded={!collapsed}
            onClick={()=>setCollapsed(c=>!c)}
          >{collapsed ? '»' : '«'}</button>
        </div>
        <DashboardSidebar current={active} onChange={onNavigate} onLogout={onLogout} collapsed={collapsed} />
      </aside>
      <main className="main-region" role="main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
