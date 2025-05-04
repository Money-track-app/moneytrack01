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

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      try {
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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('fullName', profile.fullName);
    formData.append('businessName', profile.businessName);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
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
        setMessage('✅ Profile updated successfully!');
      } else {
        setMessage('❌ Error saving profile.');
      }
    } catch (err) {
      console.error('Update failed', err);
      setMessage('❌ Error saving profile.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

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
        setMessage('🗑️ Avatar removed');
        const updated = await res.json();
        setProfile(prev => ({ ...prev, avatarUrl: updated.avatarUrl || '' }));
        setAvatarFile(null);
      }
    } catch (err) {
      console.error('Delete avatar failed', err);
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
          {!profile.avatarUrl && <div className="avatar-overlay">Upload</div>}
        </div>

        {(profile.avatarUrl || avatarFile) && (
          <button type="button" className="avatar-delete" onClick={handleDeleteAvatar}>×</button>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="avatar-input"
          onChange={(e) => setAvatarFile(e.target.files[0])}
        />
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={profile.email} readOnly />
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

        <button type="submit" className="btn-save">Save Changes</button>
        <button type="button" className="btn-logout" onClick={() => setShowConfirmLogout(true)}>Logout</button>
      </form>

      {showConfirmLogout && (
        <div className="confirm-popup">
          <div className="confirm-box">
            <p>Are you sure you want to logout?</p>
            <div className="confirm-buttons">
              <button className="confirm-yes" onClick={handleLogout}>Yes</button>
              <button className="confirm-no" onClick={() => setShowConfirmLogout(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
