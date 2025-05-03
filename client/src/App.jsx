// client/src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Pages
import AuthPage     from './pages/auth';
import Dashboard    from './pages/dashboard';
import Categories   from './pages/categories';
import AddTransaction from './pages/addtransaction';
import Reports      from './pages/reports';
import Scheduled    from './pages/scheduled';
import Settings     from './pages/settings';
import Receipts     from './pages/receipts';

// Layout
import Sidebar      from './components/sidebar';

// Component to grab `?token=…` and stash it
function TokenHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      // Save JWT
      localStorage.setItem('token', token);
      // Remove query params from URL
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

function DashboardLayout({ children }) {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* handle OAuth token if present */}
      <TokenHandler />

      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* All protected pages in sidebar layout */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/categories"
          element={
            <DashboardLayout>
              <Categories />
            </DashboardLayout>
          }
        />
        <Route
          path="/add-transaction"
          element={
            <DashboardLayout>
              <AddTransaction />
            </DashboardLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          }
        />
        <Route
          path="/scheduled"
          element={
            <DashboardLayout>
              <Scheduled />
            </DashboardLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />
        <Route
          path="/receipts"
          element={
            <DashboardLayout>
              <Receipts />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
