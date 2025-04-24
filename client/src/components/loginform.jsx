import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './authform.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setEmail('');
        setPassword('');
        setMessage('');
        navigate('/dashboard');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <form className="auth-form" onSubmit={handleLogin}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Login</button>

      <button type="button" onClick={handleGoogleLogin}>
        Continue with Google
      </button>

      {message && <p className="auth-message">{message}</p>}
    </form>
  );
};

export default LoginForm;
