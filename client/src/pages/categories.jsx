import React, { useState, useEffect, useContext, useCallback } from 'react';
import './categories.css';
import { CategoryContext } from '../context/categorycontext';
import { SearchContext } from '../context/searchcontext';
import { FaCog } from 'react-icons/fa';
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
  const [toast, setToast] = useState({ show: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const checkExportAllowed = async () => {
    if (role === 'admin') return true;
    try {
      const res = await fetch(`${API_URL}/api/export/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!result.allowed) showToast('❌ Export limit reached. Upgrade to Premium.');
      return result.allowed;
    } catch {
      showToast('❌ Export check failed.');
      return false;
    }
  };

  const logExport = async (type) => {
    try {
      const res = await fetch(`${API_URL}/api/export/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(`❌ ${data.message || 'Export failed'}`);
        return false;
      }

      return true;
    } catch {
      showToast('❌ Export log failed.');
      return false;
    }
  };

  const exportCategoryCSV = async (cat) => {
    const allowed = await checkExportAllowed();
    if (!allowed) return;
    const logged = await logExport('csv');
    if (!logged) return;

    const header = ['Date', 'Description', 'Amount'];
    const rows = cat.transactions.map((tx) => [
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      tx.amount.toFixed(2),
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${cat.name}_transactions.csv`);
    showToast(`✅ ${cat.name} CSV exported!`);
  };

  const exportCategoryPDF = async (cat) => {
    const allowed = await checkExportAllowed();
    if (!allowed) return;
    const logged = await logExport('pdf');
    if (!logged) return;

    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Date', 'Description', 'Amount']],
      body: cat.transactions.map((tx) => [
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.amount.toFixed(2),
      ]),
      startY: 20,
    });
    doc.text(cat.name, 14, 15);
    doc.save(`${cat.name}_transactions.pdf`);
    showToast(`✅ ${cat.name} PDF exported!`);
  };

  const handleExportAllCSV = async () => {
    const allowed = await checkExportAllowed();
    if (!allowed) return;
    const logged = await logExport('csv');
    if (!logged) return;

    const allTxns = grouped.flatMap((cat) =>
      cat.transactions.map((tx) => [
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.amount.toFixed(2),
      ])
    );
    const csv = [['Date', 'Description', 'Amount'], ...allTxns].map((r) => r.join(',')).join('\n');
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'all_transactions.csv');
    showToast('✅ All transactions exported as CSV');
  };

  const handleExportAllPDF = async () => {
    const allowed = await checkExportAllowed();
    if (!allowed) return;
    const logged = await logExport('pdf');
    if (!logged) return;

    const allTxns = grouped.flatMap((cat) =>
      cat.transactions.map((tx) => [
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.amount.toFixed(2),
      ])
    );

    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Date', 'Description', 'Amount']],
      body: allTxns,
      startY: 20,
    });
    doc.text('All Transactions', 14, 15);
    doc.save('all_transactions.pdf');
    showToast('✅ All transactions exported as PDF');
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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

  const handleDeleteTransaction = (txId) => {
    setConfirmModal({
      show: true,
      message: 'Are you sure you want to delete this transaction?',
      onConfirm: async () => {
        await fetch(`${API_URL}/api/transactions/${txId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        loadTransactions();
      },
    });
  };

  const handleDeleteCategory = (id) => {
    setConfirmModal({
      show: true,
      message: 'Are you sure you want to delete this category and its transactions?',
      onConfirm: async () => {
        await fetch(`${API_URL}/api/categories/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCategories();
        loadTransactions();
        setOpenMenu(null);
      },
    });
  };

  const handleDeleteSelected = () => {
    if (!selectedCats.length) {
      setSelectMode(false);
      return;
    }
    setConfirmModal({
      show: true,
      message: `Are you sure you want to delete ${selectedCats.length} selected categories and their transactions?`,
      onConfirm: async () => {
        await Promise.all(
          selectedCats.map((id) =>
            fetch(`${API_URL}/api/categories/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setSelectedCats([]);
        setSelectMode(false);
        fetchCategories();
        loadTransactions();
      },
    });
  };

  const handleSelectCat = (id) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading) return <p className="center">Loading…</p>;
  if (error) return <p className="center error">{error}</p>;

  const filteredCats = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const grouped = filteredCats.map((cat) => ({
    ...cat,
    transactions: transactions.filter((tx) => tx.category === cat._id),
  }));

  return (
    <div className="categories-container">
      <h1>Categories</h1>

      <div className="toolbar">
        <button className="btn export-all" onClick={handleExportAllCSV}>
          Export All CSV
        </button>
        <button className="btn export-all" onClick={handleExportAllPDF}>
          Export All PDF
        </button>
        {selectMode ? (
          <button className="btn delete-all small" onClick={handleDeleteSelected}>
            Delete Selected ({selectedCats.length})
          </button>
        ) : (
          <button className="btn delete-all" onClick={() => setSelectMode(true)}>
            Delete All
          </button>
        )}
      </div>

      {grouped.map((cat) => (
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
                  <button className="btn small delete" onClick={() => handleDeleteCategory(cat._id)}>
                    Delete
                  </button>
                  <button className="btn small export" onClick={() => { exportCategoryCSV(cat); setOpenMenu(null); }}>
                    CSV
                  </button>
                  <button className="btn small export" onClick={() => { exportCategoryPDF(cat); setOpenMenu(null); }}>
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
                {cat.transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>{tx.description}</td>
                    <td>${tx.amount.toFixed(2)}</td>
                    <td>
                      <button className="btn small delete" onClick={() => handleDeleteTransaction(tx._id)}>
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

      {toast.show && (
        <div className="toast-notification">
          {toast.message}
        </div>
      )}

      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>{confirmModal.message}</p>
            <div className="modal-actions">
              <button
                className="btn confirm-yes"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ show: false, message: '', onConfirm: null });
                }}
              >
                Yes
              </button>
              <button
                className="btn confirm-no"
                onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
