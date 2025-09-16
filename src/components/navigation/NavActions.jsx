import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MessagesIndicator from './MessagesIndicator';
import UserMenu from './UserMenu';
// Removed modal-based auth; now we navigate to dedicated /auth route
import Button from '../Button';
import LanguageSwitcher from '../LanguageSwitcher';

const NavActions = ({ isAuthenticated }) => {
  const { t } = useTranslation('navigation');
  const location = useLocation();
  const navigate = useNavigate();
  // const { openModal } = useModal(); (legacy)

  const handlePost = () => {
    if (!isAuthenticated) {
      // Preserve destination intent so user returns after auth if desired (optional enhancement)
      navigate('/auth?mode=register&next=/create-listing');
      return;
    }
    navigate('/create-listing');
  };

  return (
    <div className="nav-actions">
      {/* Language handled inside user menu for auth users now */}
      {!isAuthenticated && <LanguageSwitcher />}
      {isAuthenticated && <MessagesIndicator />}
      <Button
        variant={location.pathname.startsWith('/create-listing') ? 'secondary' : 'primary'}
        onClick={handlePost}
        className="post-btn"
      >
        + {t('postAd')}
      </Button>
      {isAuthenticated ? (
        <UserMenu />
      ) : (
        <Button
          variant="secondary"
          onClick={() => navigate('/auth?mode=login')}
          className="signin-btn"
        >
          {t('signIn')}
        </Button>
      )}
    </div>
  );
};

export default NavActions;