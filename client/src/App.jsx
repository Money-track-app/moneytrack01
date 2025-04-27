import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import AuthPage from './pages/auth';
import Dashboard from './pages/dashboard';
import Categories from './pages/categories';
import AddTransaction from './pages/addtransaction';
import Reports from './pages/reports';
import Recurring from './pages/recurring';
import Settings from './pages/settings';
import Receipts from './pages/receipts';

// Layout
import Sidebar from './components/sidebar';

function DashboardLayout({ children }) {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* Dashboard & Other Pages (with sidebar layout) */}
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
          path="/recurring"
          element={
            <DashboardLayout>
              <Recurring />
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




