import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // ✅ React navigation

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
        localStorage.setItem('token', data.token); // ✅ store token
        setEmail('');
        setPassword('');
        setMessage('');
        navigate('/dashboard'); // ✅ redirect to dashboard
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google login
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <form onSubmit={handleLogin} style={{ textAlign: 'center' }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />

      <div style={{ margin: '10px 0' }}>
        <button type="submit">Login</button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button type="button" onClick={handleGoogleLogin}>
          Continue with Google
        </button>
      </div>

      {message && <p>{message}</p>}
    </form>
  );
};

export default LoginForm;



