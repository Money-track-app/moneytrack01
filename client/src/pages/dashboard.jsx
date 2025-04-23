import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get('token');

    if (tokenFromURL) {
      localStorage.setItem('token', tokenFromURL);
      setToken(tokenFromURL);
      window.history.replaceState(null, '', '/dashboard');
    } else {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
      } else {
        window.location.href = '/';
      }
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>🚀 Welcome to your Dashboard</h1>
      <p>You are logged in!</p>
      <p>Token: {token.slice(0, 20)}... 🔐</p>
    </div>
  );
};

// ✅ This line is required
export default Dashboard;

