import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './settings.css';

const API_URL = 'http://localhost:5000';

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: '',
    businessName: '',
    avatarUrl: '',
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const fileInputRef = useRef(null);

  // Load profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setProfile({
          fullName: data.fullName || '',
          businessName: data.businessName || '',
          avatarUrl: data.avatarUrl || '',
          email: data.email || '',
        });
      })
      .catch(err => console.error('Failed to load profile', err))
      .finally(() => setLoading(false));
  }, []);

  // Submit profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('fullName', profile.fullName);
    formData.append('businessName', profile.businessName);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    } else if (!profile.avatarUrl) {
      formData.append('clearAvatar', 'true');
    }

    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // ⚠️ DO NOT set Content-Type manually
        },
        body: formData,
      });

      const updated = await res.json();

      if (res.ok) {
        setProfile({
          fullName: updated.fullName || '',
          businessName: updated.businessName || '',
          avatarUrl: updated.avatarUrl || '',
          email: updated.email || '',
        });
        setAvatarFile(null);
        setMessage('✅ Profile updated successfully!');
      } else {
        setMessage(updated.error || '❌ Failed to update profile.');
      }
    } catch (err) {
      console.error('❌ Update error:', err);
      setMessage('❌ Network error while updating profile.');
    }
  };

  const handleDeleteAvatar = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('fullName', profile.fullName);
    formData.append('businessName', profile.businessName);
    formData.append('clearAvatar', 'true');

    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const updated = await res.json();

      if (res.ok) {
        setProfile(prev => ({ ...prev, avatarUrl: updated.avatarUrl || '' }));
        setAvatarFile(null);
        setMessage('🗑️ Avatar removed');
      }
    } catch (err) {
      console.error('Delete avatar failed', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
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
            <img src={`${API_URL}${profile.avatarUrl}`} alt="Avatar" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">📷</div>
          )}
         
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
