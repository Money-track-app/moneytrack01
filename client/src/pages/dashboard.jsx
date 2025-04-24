import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './dashboard.css';


const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromURL = params.get('token');

    if (tokenFromURL) {
      localStorage.setItem('token', tokenFromURL);
      window.history.replaceState({}, document.title, '/dashboard');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div className="dashboard">
      <h2>🎉 Welcome to your Dashboard!</h2>
      <p>You are successfully signed in.</p>
    </div>
  );
};

export default Dashboard;



