// src/pages/receipts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './receipts.css';

export default function Receipts() {
  const [receipts, setReceipts]   = useState([]);
  const [filter, setFilter]       = useState('all');
  const [urls, setUrls]           = useState({});        // { [id]: objectURL }
  const [categoryMap, setCategoryMap] = useState({});    // { [categoryId]: categoryName }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // 1) Fetch all categories to build a lookup map
    axios.get('http://localhost:5000/api/categories', { headers })
      .then(res => {
        const map = {};
        res.data.forEach(cat => {
          // Adjust property name if your category model uses _id or id
          map[cat._id || cat.id] = cat.name;
        });
        setCategoryMap(map);
      })
      .catch(err => console.error('Failed to load categories:', err));

    // 2) Fetch receipt metadata
    axios.get('http://localhost:5000/api/receipts', { headers })
      .then(res => {
        setReceipts(res.data);
        // 3) For each receipt, fetch the image blob
        res.data.forEach(r => {
          axios.get(`http://localhost:5000/api/receipts/${r.id}`, {
            headers,
            responseType: 'blob'
          })
          .then(resp => {
            const objectUrl = URL.createObjectURL(resp.data);
            setUrls(u => ({ ...u, [r.id]: objectUrl }));
          })
          .catch(console.error);
        });
      })
      .catch(err => console.error('Failed to load receipts:', err));

  }, []);

  // Unique list of category IDs from receipts
  const categoryIds = Array.from(new Set(receipts.map(r => r.category)));
  const filtered = filter === 'all'
    ? receipts
    : receipts.filter(r => r.category === filter);

  if (receipts.length === 0) {
    return (
      <div className="receipts-page">
        <h1>Receipts</h1>
        <p>No receipts found.</p>
      </div>
    );
  }

  return (
    <div className="receipts-page">
      <h1>Receipts</h1>

      <label>
        Category:&nbsp;
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          {categoryIds.map(id => (
            <option key={id} value={id}>
              {categoryMap[id] || id}
            </option>
          ))}
        </select>
      </label>

      <div className="receipts-grid">
        {filtered.map(r => (
          <div key={r.id} className="receipt-card">
            {urls[r.id]
              ? (
                <a href={urls[r.id]} target="_blank" rel="noopener noreferrer">
                  <img src={urls[r.id]} className="receipt-thumb" alt="Receipt" />
                </a>
              ) : (
                <div className="receipt-thumb placeholder">Loading…</div>
              )}
            <p>{categoryMap[r.category] || r.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
