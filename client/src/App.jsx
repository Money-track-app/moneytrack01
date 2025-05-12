import './app.css';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Context Providers
import { CategoryProvider } from './context/categorycontext';
import { SearchProvider } from './context/searchprovider';

// Pages
import auth from './pages/auth';
import dashboard from './pages/dashboard';
import categories from './pages/categories';
import addtransaction from './pages/addtransaction';
import reports from './pages/reports';
import scheduled from './pages/scheduled';
import settings from './pages/settings';
import receipts from './pages/receipts';
import upgrade from './pages/upgrade';   // ✅ Premium Upgrade page
import support from './pages/support';   // ✅ Help & Support page
import Privacy from './pages/privacy'; // ✅ Privacy Policy page
import Terms from './pages/terms';     // ✅ Terms of Service page
import TestExport from './pages/TestExport';



// Layout Components
import sidebar from './components/sidebar';
import header from './components/header';
import footer from './components/footer';

// Handle OAuth token in URL
function TokenHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

// Dashboard layout
function DashboardLayout({ children }) {
  const Sidebar = sidebar;
  const Header = header;
  const Footer = footer;

  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="main-content">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}

function App() {
  const Auth = auth;
  const Dashboard = dashboard;
  const Categories = categories;
  const AddTransaction = addtransaction;
  const Reports = reports;
  const Scheduled = scheduled;
  const Settings = settings;
  const Receipts = receipts;
  const Upgrade = upgrade;
  const Support = support;

  return (
    <CategoryProvider>
      <SearchProvider>
        <Router>
          <TokenHandler />
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/categories" element={<DashboardLayout><Categories /></DashboardLayout>} />
            <Route path="/add-transaction" element={<DashboardLayout><AddTransaction /></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
            <Route path="/scheduled" element={<DashboardLayout><Scheduled /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/receipts" element={<DashboardLayout><Receipts /></DashboardLayout>} />
            <Route path="/upgrade" element={<DashboardLayout><Upgrade /></DashboardLayout>} /> {/* ✅ Upgrade Route */}
            <Route path="/support" element={<DashboardLayout><Support /></DashboardLayout>} /> {/* ✅ Help Route */}
            <Route path="/privacy" element={<DashboardLayout><Privacy /></DashboardLayout>} /> {/* ✅ Help Route */}
            <Route path="/terms" element={<DashboardLayout><Terms/></DashboardLayout>} /> {/* ✅ Help Route */}
            <Route path="/test-export" element={<TestExport />} />
          </Routes>
        </Router>
      </SearchProvider>
    </CategoryProvider>
  );
}

export default App;
