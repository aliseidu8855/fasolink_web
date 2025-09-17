import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchConversationById } from '../../services/api'; // We need this to find the other user
import Button from '../Button';
import './UserProfilePane.css';

const UserProfilePane = ({ conversationId }) => {
  const { user } = useAuth();
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    if (!conversationId || !user) return;
    let isCancelled = false;
    fetchConversationById(conversationId)
      .then(res => {
        if (isCancelled) return;
        const participantName = res.data.participants.find(p => p !== user?.username);
        setOtherUser(participantName ? { name: participantName } : null);
      })
      .catch(err => {
        if (!isCancelled) console.error('Failed to load participant', err);
      });
    return () => { isCancelled = true; };
  }, [conversationId, user]);

  if (!user) return <div className="loading-pane" />;
  if (!otherUser) return <div className="loading-pane" />; // Could add a skeleton here later

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <img src={`https://i.pravatar.cc/80?u=${otherUser.name}`} alt="User" className="profile-avatar" />
        <h3 className="profile-name">{otherUser.name}</h3>
        <p className="profile-username">@{otherUser.name.toLowerCase()}</p>
        <p className="profile-rating">
          <span aria-hidden="true" style={{display:'inline-flex',verticalAlign:'middle',marginRight:6}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
            </svg>
          </span>
          4.8 (24 reviews)
        </p>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <strong>18</strong>
          <span>Items Sold</span>
        </div>
        <div className="stat-item">
          <strong>2</strong>
          <span>Years on FasoLink</span>
        </div>
      </div>

      <ul className="profile-details">
        <li>
          <span aria-hidden="true" style={{marginRight:6,display:'inline-flex'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
          Ouagadougou, Burkina Faso
        </li>
        <li>
          <span aria-hidden="true" style={{marginRight:6,display:'inline-flex'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H6l-4 3v-5.5A8.5 8.5 0 0 1 10.5 4H12a9 9 0 0 1 9 9z"/></svg>
          </span>
          Usually responds in 1 hour
        </li>
        <li>
          <span aria-hidden="true" style={{marginRight:6,display:'inline-flex'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </span>
          Joined November 2022
        </li>
        <li className="verified">
          <span aria-hidden="true" style={{marginRight:6,display:'inline-flex'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/></svg>
          </span>
          Verified Seller
        </li>
      </ul>

      <div className="profile-actions">
        <Button variant="primary">View Profile</Button>
        <Button variant="neutral">Block User</Button>
      </div>

      <div className="other-listings">
        <h4>Other Listings by {otherUser.name}</h4>
        <div className="mini-listing">
          <img src="https://via.placeholder.com/60" alt="Listing" />
          <div>
            <p>Samsung Galaxy S21</p>
            <strong>280,000 CFA</strong>
          </div>
        </div>
        <div className="mini-listing">
          <img src="https://via.placeholder.com/60" alt="Listing" />
          <div>
            <p>MacBook Air 2020</p>
            <strong>650,000 CFA</strong>
          </div>
        </div>
        <Link to="#" className="view-all-listings">View All Listings →</Link>
      </div>
    </div>
  );
};

export default UserProfilePane;