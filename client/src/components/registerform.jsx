import React, { useState } from 'react';
import './authform.css';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

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
        setMessage(data.message || 'Registration successful!');
        setEmail('');
        setPassword('');
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleRegister}>
      <h2>Register</h2>

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

      <button type="submit">Register</button>

      {message && <p className="auth-message">{message}</p>}
    </form>
  );
};

export default RegisterForm;

