import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './settings.css';

const API_URL = 'http://localhost:5000';

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ fullName: '', businessName: '', avatarUrl: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch profile data
  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          fullName: data.fullName || '',
          businessName: data.businessName || '',
          avatarUrl: data.avatarUrl || '',
          email: data.email || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  useEffect(() => {
    (async () => {
      await loadProfile();
      setLoading(false);
    })();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const handleLogoutClick = () => {
    setShowConfirmLogout(true);
  };

  const handleCancelLogout = () => {
    setShowConfirmLogout(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('fullName', profile.fullName);
    formData.append('businessName', profile.businessName);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile({
          ...profile,
          fullName: updated.fullName || '',
          businessName: updated.businessName || '',
          avatarUrl: updated.avatarUrl || '',
          email: updated.email || profile.email,
        });
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Error saving profile.');
      }
    } catch (err) {
      console.error('Error updating profile', err);
      setMessage('Error saving profile.');
    }
  };

  // Handle avatar deletion
  const handleDeleteAvatar = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('fullName', profile.fullName);
      formData.append('businessName', profile.businessName);
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setMessage('Avatar removed');
        await loadProfile();
      }
    } catch (err) {
      console.error('Error deleting avatar', err);
    }
  };

  if (loading) return <p className="settings-loading">Loading…</p>;

  return (
    <div className="settings-container">
      <h1>Profile Settings</h1>
      {message && <div className="settings-notice">{message}</div>}

      <div className="avatar-section">
        <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
          {avatarFile ? (
            <img src={URL.createObjectURL(avatarFile)} alt="Avatar preview" className="avatar-img" />
          ) : profile.avatarUrl ? (
            <img src={`${API_URL}${profile.avatarUrl}?_=${Date.now()}`} alt="Avatar" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">📷</div>
          )}
          {!profile.avatarUrl && <div className="avatar-overlay">📷</div>}
        </div>
        {(profile.avatarUrl || avatarFile) && (
          <button type="button" className="avatar-delete" onClick={handleDeleteAvatar}>✖</button>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="avatar-input"
          onChange={(e) => setAvatarFile(e.target.files[0])}
        />
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <label>
          Email
          <input
            type="email"
            value={profile.email}
            readOnly
          />
        </label>
        <label>
          Your Name
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            required
          />
        </label>
        <label>
          Business Name
          <input
            type="text"
            value={profile.businessName}
            onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
            required
          />
        </label>
        <button type="submit" className="btn-save">Update</button>
        <button type="button" className="btn-logout" onClick={handleLogoutClick}>Logout</button>
      </form>

      {/* --- Logout Confirmation Popup --- */}
      {showConfirmLogout && (
        <div className="confirm-popup">
          <div className="confirm-box">
            <p>Are you sure you want to logout?</p>
            <div className="confirm-buttons">
              <button className="confirm-yes" onClick={handleLogout}>✅ Yes</button>
              <button className="confirm-no" onClick={handleCancelLogout}>❌ No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
