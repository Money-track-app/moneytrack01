import './scheduled.css';

// Base API URL (backend)
const API_URL = 'http://localhost:5000';

import { useState, useEffect, useCallback } from 'react';

export default function Scheduled() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({
    title: '',
    type: 'income',
    amount: '',
    category: '',
    frequency: 'monthly',
    dayOfMonth: 1,
    month: 1,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // Added success state

  // JWT token from localStorage
  const token = localStorage.getItem('token');

  // Fetch scheduled rules
  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/scheduled`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load scheduled rules');
    }
  }, [token]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/scheduled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Save failed');

      // Reset form fields
      setForm({ ...form, title: '', amount: '', category: '' });
      setSuccess('Schedule saved successfully!'); // Set success message
      setTimeout(() => setSuccess(null), 3000); // Clear after 3s

      fetchRules();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="scheduled-container">
      <h2 className="scheduled-header">Add Scheduled Transaction</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>} {/* Success message */}

      <form onSubmit={handleSubmit} className="scheduled-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Salary"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            type="text"
            placeholder="e.g. Salary"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="frequency">Frequency</label>
          <select
            id="frequency"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dayOfMonth">Day of Month</label>
          <input
            id="dayOfMonth"
            type="number"
            min="1"
            max="31"
            placeholder="Day of Month"
            value={form.dayOfMonth}
            onChange={(e) => setForm({ ...form, dayOfMonth: +e.target.value })}
            required
          />
        </div>

        {form.frequency === 'yearly' && (
          <div className="form-group">
            <label htmlFor="month">Month</label>
            <input
              id="month"
              type="number"
              min="1"
              max="12"
              placeholder="Month (1–12)"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: +e.target.value })}
              required
            />
          </div>
        )}

        <button type="submit" className="btn-primary full-width">
          Save Schedule
        </button>
      </form>

      
      <ul className="scheduled-list">
        {rules.map((r) => (
          <li key={r._id}>
            <span>
              {r.title} — every {r.frequency}{' '}
              {r.frequency === 'monthly'
                ? `on day ${r.dayOfMonth}`
                : `on ${r.month}/${r.dayOfMonth}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
