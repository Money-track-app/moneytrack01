import React, { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        localStorage.setItem('token', data.token);
        setEmail('');
        setPassword('');
        // Optional: redirect after login
        window.location.href = '/';
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
  };

  // ✅ New function for Google login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
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
  
      {/* Login button */}
      <div style={{ margin: '10px 0' }}>
        <button type="submit">Login</button>
      </div>
  
      {/* Google button */}
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

