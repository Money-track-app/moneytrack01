import './scheduled.css';
import { useState, useEffect, useCallback } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const API_URL = 'http://localhost:5000';

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
  const [success, setSuccess] = useState(null);
  const [editingRuleId, setEditingRuleId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/scheduled`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setRules(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load scheduled rules');
    }
  }, [token]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  function startEditing(rule) {
    setEditingRuleId(rule._id);
    setForm({
      title: rule.title,
      type: rule.type,
      amount: rule.amount,
      category: rule.category,
      frequency: rule.frequency,
      dayOfMonth: rule.dayOfMonth,
      month: rule.month,
    });
    setError(null);
    setSuccess(null);
  }

  async function deleteRule(id) {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      const res = await fetch(`${API_URL}/api/scheduled/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchRules();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete schedule');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const url = editingRuleId
        ? `${API_URL}/api/scheduled/${editingRuleId}`
        : `${API_URL}/api/scheduled`;
      const method = editingRuleId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Save failed');

      setSuccess(
        editingRuleId ? 'Schedule updated successfully!' : 'Schedule saved successfully!'
      );
      setTimeout(() => setSuccess(null), 3000);
      setEditingRuleId(null);
      setForm({
        title: '',
        type: 'income',
        amount: '',
        category: '',
        frequency: 'monthly',
        dayOfMonth: 1,
        month: 1,
      });
      fetchRules();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  return (
    <div className="scheduled-container">
      <h2 className="scheduled-header">
        {editingRuleId ? 'Edit Scheduled Transaction' : 'Add Scheduled Transaction'}
      </h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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
            placeholder="e.g. Food"
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
            value={form.dayOfMonth}
            onChange={(e) => setForm({ ...form, dayOfMonth: +e.target.value })}
            required
          />
        </div>

        {form.frequency === 'yearly' && (
          <div className="form-group">
            <label htmlFor="month">Month</label>
            <select
              id="month"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: +e.target.value })}
              required
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="btn-primary full-width">
          {editingRuleId ? 'Update Schedule' : 'Save Schedule'}
        </button>

        {editingRuleId && (
          <button
            type="button"
            onClick={() => {
              setEditingRuleId(null);
              setForm({
                title: '',
                type: 'income',
                amount: '',
                category: '',
                frequency: 'monthly',
                dayOfMonth: 1,
                month: 1,
              });
            }}
            className="btn-secondary full-width"
          >
            Cancel
          </button>
        )}
      </form>

      <h2 style={{ textAlign: 'left', marginTop: '2rem' }}>Your Scheduled Transactions</h2>

      {rules.length === 0 ? (
        <p>No schedules yet.</p>
      ) : (
        <table className="scheduled-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Frequency</th>
              <th>Next Run</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule._id}>
                <td data-label="Title">{rule.title}</td>
                <td data-label="Type">{rule.type}</td>
                <td data-label="Amount">{rule.amount}</td>
                <td data-label="Category">{rule.category}</td>
                <td data-label="Frequency">
                  {rule.frequency === 'monthly'
                    ? `Monthly (day ${rule.dayOfMonth})`
                    : `Yearly (${months.find((m) => m.value === rule.month)?.name || rule.month}/${rule.dayOfMonth})`}
                </td>
                <td data-label="Next Run">
                  {new Date(rule.nextRun).toLocaleDateString()}
                </td>
                <td data-label="Actions">
                  <button onClick={() => startEditing(rule)} title="Edit">
                    <FiEdit2 /> Edit
                  </button>
                  <button onClick={() => deleteRule(rule._id)} title="Delete">
                    <FiTrash2 /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
