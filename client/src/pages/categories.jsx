// client/src/pages/categories.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './categories.css';

const API_URL = 'http://localhost:5000';

export default function Categories() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [editingId, setEditingId]       = useState(null);
  const [editForm, setEditForm]         = useState({
    date: '',
    description: '',
    category: '',
    type: 'expense',
    amount: ''
  });

  const token = localStorage.getItem('token');

  // Fetch the transactions; wrap in useCallback so we can safely add it to deps
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setTransactions(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not load transactions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Only run once on mount (or if token changes)
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // DELETE handler
  const handleDelete = async id => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      fetchTransactions();
    } catch (err) {
      console.error(err);
      setError('Failed to delete');
    }
  };

  // Begin inline edit
  const startEdit = tx => {
    setEditingId(tx._id);
    setEditForm({
      date: new Date(tx.date).toISOString().slice(0, 10),
      description: tx.description || '',
      category: tx.category || '',
      type: tx.type,
      amount: tx.amount.toString()
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: '', description: '', category: '', type: 'expense', amount: '' });
  };

  // Handle form field changes
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit the edited transaction
  const submitEdit = async id => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: editForm.date,
          description: editForm.description,
          category: editForm.category,
          type: editForm.type,
          amount: parseFloat(editForm.amount)
        })
      });
      if (!res.ok) throw new Error();
      cancelEdit();
      fetchTransactions();
    } catch (err) {
      console.error(err);
      setError('Failed to update');
    }
  };

  if (loading) return <p className="center">Loading…</p>;
  if (error)   return <p className="center error">{error}</p>;

  return (
    <div className="categories-container">
      <h1>Categories</h1>
      <table className="categories-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx =>
            editingId === tx._id ? (
              <tr key={tx._id}>
                <td>
                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <button className="save-btn" onClick={() => submitEdit(tx._id)}>
                    Save
                  </button>
                  <button className="cancel-btn" onClick={cancelEdit}>
                    Cancel
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={tx._id}>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>{tx.description}</td>
                <td>{tx.category}</td>
                <td>{tx.type}</td>
                <td>{tx.amount.toFixed(2)}</td>
                <td>
                  <button onClick={() => startEdit(tx)}>Edit</button>
                  <button onClick={() => handleDelete(tx._id)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
