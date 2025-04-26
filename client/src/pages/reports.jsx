import { useEffect, useState, useRef } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './reports.css';

export default function Reports() {
  const [report, setReport]               = useState(null);
  const [allTxns, setAllTxns]             = useState([]);
  const [filteredTxns, setFilteredTxns]   = useState(null);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(true);
  const [start, setStart]                 = useState('');
  const [end, setEnd]                     = useState('');

  const doughnutRef = useRef(null);
  const barRef      = useRef(null);

  const fetchReport = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end)   params.append('end', end);

    fetch(`http://localhost:5000/api/reports?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject(`Status ${r.status}`))
      .then(data => setReport(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));

    fetch('http://localhost:5000/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject(`Status ${r.status}`))
      .then(setAllTxns)
      .catch(err => console.error('Txns load error:', err));
  };

  useEffect(fetchReport, [start, end]);

  if (loading) return <p>Loading reports…</p>;
  if (error)   return <p className="reports-error">{error}</p>;
  if (!report) return null;

  // date-in-range helper
  const inRange = txn => {
    const d = new Date(txn.date);
    if (start && d < new Date(start)) return false;
    if (end) {
      const e = new Date(end);
      e.setHours(23,59,59,999);
      if (d > e) return false;
    }
    return true;
  };

  // always apply date filter
  const dateFilteredTxns = allTxns.filter(inRange);
  // show chart-filtered if set, else date-filtered
  const displayedTxns = filteredTxns !== null 
    ? filteredTxns 
    : dateFilteredTxns;

  // whether any filter is active
  const isFiltered = filteredTxns !== null || start !== '' || end !== '';

  const totalIncome   = report.totalIncome   ?? 0;
  const totalExpenses = report.totalExpenses ?? 0;
  const categories    = Array.isArray(report.byCategory) ? report.byCategory : [];

  const doughnutData = {
    labels: ['Income','Expenses'],
    datasets: [{ data: [totalIncome, totalExpenses] }]
  };
  const barData = {
    labels: categories.map(c => c._id),
    datasets: [{ data: categories.map(c => c.total ?? 0) }]
  };
  const chartOptions = { responsive:true, maintainAspectRatio:false };

  // handlers
  const handlePieClick = evt => {
    const chart = doughnutRef.current;
    if (!chart) return;
    const elems = chart.getElementsAtEventForMode(evt,'nearest',{intersect:true},false);
    if (!elems.length) return;
    const type = doughnutData.labels[elems[0].index].toLowerCase();
    setFilteredTxns(dateFilteredTxns.filter(t => t.type === type));
  };
  const handleBarClick = evt => {
    const chart = barRef.current;
    if (!chart) return;
    const elems = chart.getElementsAtEventForMode(evt,'nearest',{intersect:true},false);
    if (!elems.length) return;
    const cat = barData.labels[elems[0].index];
    setFilteredTxns(dateFilteredTxns.filter(t => (t.category||'Uncategorized') === cat));
  };
  const clearFilters = () => {
    setFilteredTxns(null);
    setStart('');
    setEnd('');
  };

  return (
    <div className="reports-page">
      <h1>Financial Reports</h1>

      {/* Date filters */}
      <div className="date-filters">
        <label>
          Start Date
          <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        </label>
        <label>
          End Date
          <input type="date" value={end}   onChange={e => setEnd(e.target.value)} />
        </label>
      </div>

      {/* Summary */}
      <div className="summary">
        <p>Total Income: {totalIncome.toFixed(2)}</p>
        <p>Total Expenses: {totalExpenses.toFixed(2)}</p>
        <p>Balance: {(totalIncome - totalExpenses).toFixed(2)}</p>
      </div>

      {/* Charts */}
      <div className="chart-container">
        <h2>Income vs. Expenses</h2>
        <Doughnut
          ref={doughnutRef}
          data={doughnutData}
          options={chartOptions}
          onClick={handlePieClick}
        />
      </div>

      <div className="chart-container">
        <h2>Breakdown by Category</h2>
        <Bar
          ref={barRef}
          data={barData}
          options={chartOptions}
          onClick={handleBarClick}
        />
      </div>

      {/* Transactions table */}
      <div className="transactions-table">
        <h2>
          Transactions ({displayedTxns.length})
          {isFiltered && (
            <button className="clear-filter-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </h2>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Description</th><th>Category</th>
              <th>Type</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {displayedTxns.map(tx => (
              <tr key={tx._id}>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>{tx.description}</td>
                <td>{tx.category || 'Uncategorized'}</td>
                <td>{tx.type}</td>
                <td>{tx.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


