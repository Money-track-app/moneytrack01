import React, { useState, useEffect } from 'react';
import './authform.css';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState({ type: '', message: '' });
  const [strength, setStrength] = useState('');

  // Evaluate password strength
  useEffect(() => {
    const evaluateStrength = (pwd) => {
      if (pwd.length < 6) return 'Weak';
      if (/[A-Z]/.test(pwd) && /\d/.test(pwd) && pwd.length >= 8) return 'Strong';
      return 'Medium';
    };
    setStrength(evaluateStrength(password));
  }, [password]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmail('');
        setPassword('');
        showToast('success', data.message || 'Registration successful!');
      } else {
        showToast('error', data.message || 'Registration failed');
      }
    } catch {
      showToast('error', 'An error occurred. Please try again.');
    }
  };

  return (
    <>
      <form className="auth-form" onSubmit={handleRegister}>
        <img src="/logo.png" alt="MoneyTrack Logo" className="auth-logo-large" />

        <p className="form-subtitle">Register to start managing your finances</p>

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {password && (
          <p className={`password-strength ${strength.toLowerCase()}`}>
            Password Strength: {strength}
          </p>
        )}

        <button type="submit" className="primary-btn">Register</button>
      </form>

      {toast.message && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default RegisterForm;
