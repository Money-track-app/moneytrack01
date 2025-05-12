import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './authform.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('✅ Login response:', data);

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        const role = data.role || payload.role || '';
        localStorage.setItem('role', role);
        const isPremium = role === 'admin' ? true : data.isPremium === true;
        localStorage.setItem('isPremium', isPremium ? 'true' : 'false');

        setEmail('');
        setPassword('');
        showToast('success', 'Login successful!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        showToast('error', 'Login unsuccessful: ' + (data.message || 'Please try again.'));
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      showToast('error', 'An error occurred. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          currentPassword: password,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Password updated successfully!');
        setForgotMode(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast('error', data.message || 'Reset failed');
      }
    } catch {
      showToast('error', 'Server error. Try again later.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <>
      <form className="auth-form" onSubmit={forgotMode ? handleResetPassword : handleLogin}>
        <img src="/logo.png" alt="MoneyTrack Logo" className="auth-logo-large" />

        <div className="input-wrapper">
          <span className="input-icon">📧</span>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-wrapper">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder={forgotMode ? 'Current password' : 'Enter your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {forgotMode && (
          <>
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <span className="input-icon">✅</span>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="primary-btn">
          {forgotMode ? 'Reset Password' : 'Login'}
        </button>

        {!forgotMode && (
          <>
            <div className="divider">or</div>
            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <img src="/google-icon.png" alt="Google" className="google-icon" />
              Continue with Google
            </button>
          </>
        )}

        <div className="extra-links">
          <button
            type="button"
            className="back-link"
            onClick={() => setForgotMode((prev) => !prev)}
          >
            {forgotMode ? '← Back to Login' : 'Forgot Password?'}
          </button>
        </div>
      </form>

      {toast.message && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default LoginForm;
