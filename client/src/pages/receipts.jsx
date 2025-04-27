// src/pages/receipts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './receipts.css';

export default function Receipts() {
  const [receipts, setReceipts]     = useState([]);
  const [filter, setFilter]         = useState('all');
  const [urls,    setUrls]          = useState({});   // { [id]: objectURL }

  useEffect(() => {
    const token = localStorage.getItem('token');
    // 1) Fetch metadata
    axios.get('http://localhost:5000/api/receipts', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setReceipts(res.data);
      // 2) For each receipt, fetch the image blob
      res.data.forEach(r => {
        axios.get(`http://localhost:5000/api/receipts/${r.id}`, {
          headers:       { Authorization: `Bearer ${token}` },
          responseType:  'blob'
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

  const categories = Array.from(new Set(receipts.map(r => r.category)));
  const filtered   = filter === 'all' 
                     ? receipts 
                     : receipts.filter(r => r.category === filter);

  if (receipts.length === 0) {
    return <div className="receipts-page"><h1>Receipts</h1><p>No receipts found.</p></div>;
  }

  return (
    <div className="receipts-page">
      <h1>Receipts</h1>
      <label>
        Category:&nbsp;
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </label>

      <div className="receipts-grid">
        {filtered.map(r => (
          <div key={r.id} className="receipt-card">
            {/* Wrap in a link to view full-size */}
            {urls[r.id]
              ? <a href={urls[r.id]} target="_blank" rel="noopener noreferrer">
                  <img src={urls[r.id]} className="receipt-thumb" alt="Receipt"/>
                </a>
              : <div className="receipt-thumb placeholder">Loading…</div>
            }
            <p>{r.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

