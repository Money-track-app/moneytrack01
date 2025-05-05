import React, { useState, useEffect, useContext, useCallback } from 'react';
import './categories.css';
import { CategoryContext } from '../context/categorycontext';
import { SearchContext } from '../context/searchcontext';
import { FaCog, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'http://localhost:5000';

export default function Categories() {
  const { categories, fetchCategories } = useContext(CategoryContext);
  const { searchTerm } = useContext(SearchContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  const token = localStorage.getItem('token');

  const getCurrencySymbol = (code) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      AED: 'د.إ',
    };
    return symbols[code] || code;
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setTransactions(await res.json());
      setError('');
    } catch {
      setError('Could not load transactions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
    loadTransactions();
  }, [fetchCategories, loadTransactions]);

  const exportCategoryCSV = (cat) => {
    const header = ['Date', 'Description', 'Amount'];
    const rows = cat.transactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      `${getCurrencySymbol(tx.currency)}${tx.amount.toFixed(2)}`
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${cat.name}_transactions.csv`);
  };

  const exportAllCSV = () => {
    const header = ['Category', 'Date', 'Description', 'Amount'];
    const rows = [];
    categories.forEach(cat => {
      const catTransactions = transactions.filter(tx => tx.category === cat._id);
      catTransactions.forEach(tx => {
        rows.push([
          cat.name,
          new Date(tx.date).toLocaleDateString(),
          tx.description,
          `${getCurrencySymbol(tx.currency)}${tx.amount.toFixed(2)}`
        ]);
      });
    });
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `all_categories_transactions.csv`);
  };

  const exportCategoryPDF = (cat) => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Date', 'Description', 'Amount']],
      body: cat.transactions.map(tx => [
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        `${getCurrencySymbol(tx.currency)}${tx.amount.toFixed(2)}`
      ]),
      startY: 20
    });
    doc.text(cat.name, 14, 15);
    doc.save(`${cat.name}_transactions.pdf`);
  };

  const exportAllPDF = () => {
    const doc = new jsPDF();
    const tableRows = [];
    categories.forEach(cat => {
      const catTransactions = transactions.filter(tx => tx.category === cat._id);
      catTransactions.forEach(tx => {
        tableRows.push([
          cat.name,
          new Date(tx.date).toLocaleDateString(),
          tx.description,
          `${getCurrencySymbol(tx.currency)}${tx.amount.toFixed(2)}`
        ]);
      });
    });
    autoTable(doc, {
      head: [['Category', 'Date', 'Description', 'Amount']],
      body: tableRows,
      startY: 20
    });
    doc.text('All Categories Transactions', 14, 15);
    doc.save('all_categories_transactions.pdf');
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category and its transactions?')) return;
    await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCategories();
    loadTransactions();
    setOpenMenu(null);
  };

  const handleDeleteTransaction = async (txId) => {
    if (!window.confirm('Delete this transaction?')) return;
    await fetch(`${API_URL}/api/transactions/${txId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadTransactions();
  };

  const handleSelectCat = (id) => {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedCats.length) {
      setSelectMode(false);
      return;
    }
    if (!window.confirm(`Delete ${selectedCats.length} selected categories and their transactions?`)) return;
    await Promise.all(
      selectedCats.map(id =>
        fetch(`${API_URL}/api/categories/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      )
    );
    setSelectedCats([]);
    setSelectMode(false);
    fetchCategories();
    loadTransactions();
  };

  if (loading) return <p className="center">Loading…</p>;
  if (error) return <p className="center error">{error}</p>;

  const filteredCats = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const grouped = filteredCats.map(cat => ({
    ...cat,
    transactions: transactions.filter(tx => tx.category === cat._id)
  }));

  return (
    <div className="categories-container">
      <h1>Categories</h1>
      <div className="toolbar">
        {!selectMode && (
          <>
            <button className="btn export small" onClick={exportAllCSV}>
              <FaFileCsv /> Export All CSV
            </button>
            <button className="btn export small" onClick={exportAllPDF}>
              <FaFilePdf /> Export All PDF
            </button>
          </>
        )}
        {selectMode ? (
          <button
            className="btn delete-all small"
            onClick={handleDeleteSelected}
            disabled={false}
          >
            Delete Selected ({selectedCats.length})
          </button>
        ) : (
          <button className="btn delete-all" onClick={() => setSelectMode(true)}>
            Delete All
          </button>
        )}
      </div>

      {grouped.map(cat => (
        <section key={cat._id} className="category-section">
          <div className="section-header">
            <label>
              {selectMode && (
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat._id)}
                  onChange={() => handleSelectCat(cat._id)}
                />
              )}{' '}
              {cat.name}
            </label>
            <div className="actions">
              <FaCog
                className="settings-btn"
                onClick={() => setOpenMenu(openMenu === cat._id ? null : cat._id)}
              />
              {openMenu === cat._id && (
                <div className="settings-menu">
                  <button
                    className="btn small delete"
                    onClick={() => handleDeleteCategory(cat._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn small export"
                    onClick={() => { exportCategoryCSV(cat); setOpenMenu(null); }}
                  >
                    CSV
                  </button>
                  <button
                    className="btn small export"
                    onClick={() => { exportCategoryPDF(cat); setOpenMenu(null); }}
                  >
                    PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {cat.transactions.length ? (
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cat.transactions.map(tx => (
                  <tr key={tx._id}>
                    <td data-label="Date">{new Date(tx.date).toLocaleDateString()}</td>
                    <td data-label="Description">{tx.description}</td>
                    <td data-label="Amount">{getCurrencySymbol(tx.currency)}{tx.amount.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn small delete"
                        onClick={() => handleDeleteTransaction(tx._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">No transactions in this category.</p>
          )}
        </section>
      ))}
    </div>
  );
}
