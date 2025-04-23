import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromURL = params.get('token');

    if (tokenFromURL) {
      // ✅ Save token from URL
      localStorage.setItem('token', tokenFromURL);

      // ✅ Clean up the URL
      window.history.replaceState({}, document.title, '/dashboard');
    }

    const token = localStorage.getItem('token');

    // 🚫 If no token found, redirect to login
    if (!token) {
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>🎉 Welcome to your Dashboard!</h2>
      <p>You are successfully signed in.</p>
    </div>
  );
};

export default Dashboard;


