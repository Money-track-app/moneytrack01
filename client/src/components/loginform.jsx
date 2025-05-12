import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './authform.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // ✅ No 'credentials: include'
      });

      const data = await response.json();
      console.log('✅ Login response:', data); // Debug

      if (response.ok && data.token) {
        // ✅ Store token in localStorage
        localStorage.setItem('token', data.token);

        // ✅ Decode payload to extract role
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem('role', payload.role || '');

        // ✅ Store isPremium safely
        const isPremium = payload.role === 'admin' ? true : data.isPremium === true;
        localStorage.setItem('isPremium', isPremium ? 'true' : 'false');

        setEmail('');
        setPassword('');
        showToast('success', 'Login successful!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        showToast('error', data.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      showToast('error', 'An error occurred. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <>
      <form className="auth-form" onSubmit={handleLogin}>
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="primary-btn">Login</button>

        <div className="divider">or</div>

        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
          <img src="/google-icon.png" alt="Google" className="google-icon" />
          Continue with Google
        </button>
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
