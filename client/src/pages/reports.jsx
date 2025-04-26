import { useEffect, useState, useRef } from 'react';
import { Doughnut, Bar, Line }       from 'react-chartjs-2';
import { saveAs }                     from 'file-saver';
import * as XLSX                      from 'xlsx';
import { jsPDF }                      from 'jspdf';
import autoTable                      from 'jspdf-autotable';
import 'chart.js/auto';
import './reports.css';

export default function Reports() {
  const [report, setReport]             = useState(null);
  const [allTxns, setAllTxns]           = useState([]);
  const [filteredTxns, setFilteredTxns] = useState(null);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(true);
  const [start, setStart]               = useState('');
  const [end, setEnd]                   = useState('');

  const doughnutRef = useRef(null);
  const barRef      = useRef(null);

  const fetchReport = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) { setError('Not authenticated'); setLoading(false); return; }

    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end)   params.append('end', end);

    // Fetch summary + trend
    fetch(`http://localhost:5000/api/reports?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject(`Status ${r.status}`))
      .then(setReport)
      .catch(setError)
      .finally(() => setLoading(false));

    // Fetch all transactions
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

  // Filter helper
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

  const dateFilteredTxns = allTxns.filter(inRange);
  const displayedTxns    = filteredTxns !== null ? filteredTxns : dateFilteredTxns;
  const isFiltered       = filteredTxns !== null || start || end;

  // Compute summary values
  const totalIncome = dateFilteredTxns
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = dateFilteredTxns
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const doughnutData = {
    labels: ['Income','Expenses'],
    datasets: [{ data: [totalIncome, totalExpenses] }]
  };

  // Category breakdown
  const categoryMap = dateFilteredTxns.reduce((acc, t) => {
    const c = t.category || 'Uncategorized';
    acc[c] = (acc[c] || 0) + t.amount;
    return acc;
  }, {});
  const barData = {
    labels: Object.keys(categoryMap),
    datasets: [{ data: Object.values(categoryMap) }]
  };

  // Trend line
  const showTrend = Array.isArray(report.trend) && report.trend.length > 0;

  const chartOptions = { responsive: true, maintainAspectRatio: false };

  // Drill-down handlers
  const handlePieClick = evt => {
    const chart = doughnutRef.current;
    const elems = chart?.getElementsAtEventForMode(evt,'nearest',{intersect:true},false) || [];
    if (!elems.length) return;
    const type = doughnutData.labels[elems[0].index].toLowerCase();
    setFilteredTxns(dateFilteredTxns.filter(t => t.type === type));
  };

  const handleBarClick = evt => {
    const chart = barRef.current;
    const elems = chart?.getElementsAtEventForMode(evt,'nearest',{intersect:true},false) || [];
    if (!elems.length) return;
    const cat = barData.labels[elems[0].index];
    setFilteredTxns(dateFilteredTxns.filter(t => (t.category||'Uncategorized') === cat));
  };

  const clearFilters = () => {
    setFilteredTxns(null);
    setStart('');
    setEnd('');
  };

  // Export handlers
  const exportCSV = () => {
    const header = ['Date','Description','Category','Type','Amount'];
    const rows = displayedTxns.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      tx.category||'Uncategorized',
      tx.type,
      tx.amount.toFixed(2)
    ]);
    const csv = [header, ...rows].map(r=>r.join(',')).join('\n');
    saveAs(new Blob([csv], { type:'text/csv;charset=utf-8;' }), 'transactions.csv');
  };



  const exportPDF = () => {
    const doc = new jsPDF();
    const head = [['Date','Description','Category','Type','Amount']];
    const body = displayedTxns.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      tx.category||'Uncategorized',
      tx.type,
      tx.amount.toFixed(2)
    ]);
    autoTable(doc, {
      head, body,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33,150,243] },
      margin: { left: 10, right: 10 }
    });
    doc.text('Transactions Report', 14, 15);
    doc.save('transactions.pdf');
  };

  return (
    <div className="reports-page">
      <h1>Financial Reports</h1>

      {/* Date filters */}
      <div className="date-filters">
        <label>
          Start Date
          <input
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
          />
        </label>
        <label>
          End Date
          <input
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
          />
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

      {showTrend && (
        <div className="chart-container">
          <h2>Trend: Income vs. Expenses</h2>
          <Line
            data={{
              labels: report.trend.map(d => d._id),
              datasets: [
                { label: 'Income',   data: report.trend.map(d=>d.income),   fill:false, tension:0.3 },
                { label: 'Expenses', data: report.trend.map(d=>d.expense),  fill:false, tension:0.3 }
              ]
            }}
            options={{
              ...chartOptions,
              scales:{
                x:{ title:{ display:true, text:'Period' } },
                y:{ title:{ display:true, text:'Amount' }, beginAtZero:true }
              }
            }}
          />
        </div>
      )}

      {/* Transactions & Actions */}
      <div className="transactions-table">
        <h2>
          Transactions ({displayedTxns.length})
          <span className="table-actions">
            {isFiltered && (
              <button
                className="clear-filter-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
            <button className="export-btn" onClick={exportCSV}>
              CSV
            </button>
           
            <button className="export-btn" onClick={exportPDF}>
              PDF
            </button>
          </span>
        </h2>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Description</th>
              <th>Category</th><th>Type</th><th>Amount</th>
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
