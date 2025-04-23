import './App.css';
import LoginForm from './components/loginform';
import RegisterForm from './components/registerform';
import Dashboard from './pages/dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="App">
      <h1>MoneyTrack</h1>

      {isRegistering ? <RegisterForm /> : <LoginForm />}

      <button
        style={{ marginTop: '20px' }}
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering
          ? 'Already have an account? Login'
          : "Don't have an account? Register"}
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

