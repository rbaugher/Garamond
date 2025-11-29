import React, { useState, useEffect } from 'react';
import { getStoredUser, setStoredUser } from '../../utils/session';
import { AVATAR_OPTIONS, COLOR_OPTIONS } from '../../utils/avatars';
import './SignUp.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0].emoji);
  const [preferredColor, setPreferredColor] = useState(COLOR_OPTIONS[1]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setUser(u);
      setAvatar(u.avatar || AVATAR_OPTIONS[0].emoji);
      setPreferredColor(u.preferredColor || COLOR_OPTIONS[1]);
    }
  }, []);

  if (!user) {
    return <div className="signup-container"><div className="signup-card"><h2>Not signed in</h2><p>Please sign in to view your profile.</p></div></div>;
  }

  const handleAvatarChange = (emoji) => setAvatar(emoji);
  const handleColorChange = (color) => setPreferredColor(color);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('Saving...');
    try {
      // PATCH to /api/signUpUser to update avatar and preferredColor
      const baseUrl = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${baseUrl}/api/signUpUser`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          avatar,
          preferredColor
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Failed to update profile');
        setTimeout(() => setMessage(''), 2500);
        return;
      }
      // Update local session and UI
      const updated = { ...user, avatar: data.user.avatar, preferredColor: data.user.preferredColor };
      setStoredUser(updated);
      setUser(updated);
      setMessage('Profile updated!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error updating profile');
      setTimeout(() => setMessage(''), 2500);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Your Profile</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <span className="avatar-emoji" style={{ fontSize: '3rem', background: preferredColor, borderRadius: '50%', padding: '0.5rem' }}>{avatar}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: preferredColor }}>{user.nickname || user.name}</div>
            <div style={{ color: '#b0b0b0', fontSize: '0.95rem' }}>{user.email}</div>
          </div>
        </div>
        <form onSubmit={handleSave} className="signup-form">
          <div className="form-section">
            <h3>Change Avatar</h3>
            <div className="avatar-picker">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`avatar-option ${avatar === option.emoji ? 'selected' : ''}`}
                  onClick={() => handleAvatarChange(option.emoji)}
                  title={option.label}
                  aria-label={`Select ${option.label} avatar`}
                >
                  <span className="avatar-emoji">{option.emoji}</span>
                  <span className="avatar-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="form-section">
            <h3>Preferred Color</h3>
            <div className="color-picker">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${preferredColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  aria-label={`Select color ${color}`}
                  title={color}
                />
              ))}
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="submit-btn">Save Changes</button>
          </div>
          {message && <div className="success-message" style={{ marginTop: '1rem' }}>{message}</div>}
        </form>
      </div>
    </div>
  );
}
