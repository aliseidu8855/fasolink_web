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
        <p className="profile-rating">⭐ 4.8 (24 reviews)</p>
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
        <li>📍 Ouagadougou, Burkina Faso</li>
        <li>💬 Usually responds in 1 hour</li>
        <li>📅 Joined November 2022</li>
        <li className="verified">✅ Verified Seller</li>
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