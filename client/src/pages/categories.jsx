// client/src/pages/Categories.jsx
import React, { useState, useEffect, useContext } from 'react';
import './categories.css';
import { CategoryContext } from '../context/categorycontext';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'http://localhost:5000';

export default function Categories() {
  const { categories, fetchCategories } = useContext(CategoryContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Load categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load transactions
  useEffect(() => {
    async function loadTransactions() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/transactions`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setTransactions(data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Could not load transactions');
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, [token]);

  if (loading) return <p className="center">Loading…</p>;
  if (error)   return <p className="center error">{error}</p>;

  // Group transactions by category
  const grouped = categories.map(cat => ({
    ...cat,
    transactions: transactions.filter(tx => tx.category === cat._id)
  }));

  // Transactions without category
  const uncategorized = transactions.filter(tx => !tx.category);

  // Export handlers
  const exportCategoryCSV = (cat) => {
    const header = ['Date','Description','Amount'];
    const rows = cat.transactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      tx.amount.toFixed(2)
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${cat.name}_transactions.csv`);
  };

  const exportCategoryPDF = (cat) => {
    const doc = new jsPDF();
    const head = [['Date','Description','Amount']];
    const body = cat.transactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      tx.amount.toFixed(2)
    ]);
    autoTable(doc, { head, body, startY: 20 });
    doc.text(cat.name, 14, 15);
    doc.save(`${cat.name}_transactions.pdf`);
  };

  const exportAllCSV = () => {
    const header = ['Category','Date','Description','Amount'];
    const rows = grouped.flatMap(cat =>
      cat.transactions.map(tx => [
        cat.name,
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.amount.toFixed(2)
      ])
    );
    if (uncategorized.length) {
      rows.push(...uncategorized.map(tx => [
        'Uncategorized',
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.amount.toFixed(2)
      ]));
    }
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `all_categories_transactions.csv`);
  };

  const exportAllPDF = () => {
    const doc = new jsPDF();
    const head = [['Category','Date','Description','Amount']];
    const body = grouped.flatMap(cat =>
      cat.transactions.map(tx => [
        cat.name,
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.amount.toFixed(2)
      ])
    );
    if (uncategorized.length) {
      body.push(...uncategorized.map(tx => [
        'Uncategorized',
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.amount.toFixed(2)
      ]));
    }
    autoTable(doc, { head, body, startY: 20, styles: { fontSize: 8 }, headStyles: { fillColor: [33,150,243] } });
    doc.text('All Categories Transactions', 14, 15);
    doc.save('all_categories_transactions.pdf');
  };

  return (
    <div className="categories-container">
      <h1>Categories</h1>
      <div className="all-export-buttons">
        <button className="export-btn" onClick={exportAllCSV}>Export All CSV</button>
        <button className="export-btn" onClick={exportAllPDF}>Export All PDF</button>
      </div>

      {grouped.map(cat => (
        <section key={cat._id} className="category-section">
          <div className="section-header">
            <h2>{cat.name} ({cat.type})</h2>
            <div className="export-buttons">
              <button onClick={() => exportCategoryCSV(cat)}>CSV</button>
              <button onClick={() => exportCategoryPDF(cat)}>PDF</button>
            </div>
          </div>

          {cat.transactions.length > 0 ? (
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {cat.transactions.map(tx => (
                  <tr key={tx._id}>
                    <td data-label="Date">{new Date(tx.date).toLocaleDateString()}</td>
                    <td data-label="Description">{tx.description}</td>
                    <td data-label="Amount">${tx.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">No transactions in this category.</p>
          )}
        </section>
      ))}

      {uncategorized.length > 0 && (
        <section className="category-section">
          <div className="section-header">
            <h2>Uncategorized</h2>
            <div className="export-buttons">
              <button onClick={() => exportCategoryCSV({ name: 'Uncategorized', transactions: uncategorized })}>CSV</button>
              <button onClick={() => exportCategoryPDF({ name: 'Uncategorized', transactions: uncategorized })}>PDF</button>
            </div>
          </div>
          <table className="categories-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {uncategorized.map(tx => (
                <tr key={tx._id}>
                  <td data-label="Date">{new Date(tx.date).toLocaleDateString()}</td>
                  <td data-label="Description">{tx.description}</td>
                  <td data-label="Amount">${tx.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}