import React, { useEffect, useState, useRef, useContext } from 'react';
import { Doughnut, Bar, Line }       from 'react-chartjs-2';
import { saveAs }                     from 'file-saver';
import * as XLSX                      from 'xlsx';
import { jsPDF }                      from 'jspdf';
import autoTable                      from 'jspdf-autotable';
import 'chart.js/auto';
import './reports.css';

// Import CategoryContext
import { CategoryContext } from '../context/categorycontext';

export default function Reports() {
  const { categories }              = useContext(CategoryContext);
  const [report, setReport]         = useState(null);
  const [allTxns, setAllTxns]       = useState([]);
  const [filteredTxns, setFilteredTxns] = useState(null);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [start, setStart]           = useState('');
  const [end, setEnd]               = useState('');

  const doughnutRef = useRef(null);
  const barRef      = useRef(null);

  // Fetch data
  const fetchReport = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) { setError('Not authenticated'); setLoading(false); return; }

    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end)   params.append('end', end);

    fetch(`http://localhost:5000/api/reports?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject(`Status ${r.status}`))
      .then(setReport)
      .catch(setError)
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

  // Filter transactions
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

  // Summary totals
  const totalIncome = dateFilteredTxns.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0);
  const totalExpenses = dateFilteredTxns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);

  const doughnutData = { labels:['Income','Expenses'], datasets:[{ data:[totalIncome,totalExpenses] }] };

  // Category breakdown
  const getCategoryName = id => {
    if (!id) return 'Uncategorized';
    const cat = categories.find(c=>c._id===id);
    return cat ? cat.name : 'Uncategorized';
  };
  const categoryMap = dateFilteredTxns.reduce((acc,t)=>{ const id=t.category; acc[id]=(acc[id]||0)+t.amount; return acc;},{});
  const namedCategoryMap = {};
  Object.entries(categoryMap).forEach(([id,total])=>{ namedCategoryMap[getCategoryName(id)] = total; });
  const barData = { labels:Object.keys(namedCategoryMap), datasets:[{ data:Object.values(namedCategoryMap) }] };

  // Trend
  const showTrend = Array.isArray(report.trend) && report.trend.length>0;

  const chartOptions = { responsive:true, maintainAspectRatio:false };

  // Handlers
  const handlePieClick = evt => {
    const elems = doughnutRef.current?.getElementsAtEventForMode(evt,'nearest',{intersect:true},false)||[];
    if (!elems.length) return;
    const type = doughnutData.labels[elems[0].index].toLowerCase();
    setFilteredTxns(dateFilteredTxns.filter(t=>t.type===type));
  };
  const handleBarClick = evt => {
    const elems = barRef.current?.getElementsAtEventForMode(evt,'nearest',{intersect:true},false)||[];
    if (!elems.length) return;
    const clicked = barData.labels[elems[0].index];
    setFilteredTxns(dateFilteredTxns.filter(t=>getCategoryName(t.category)===clicked));
  };
  const clearFilters = () => { setFilteredTxns(null); setStart(''); setEnd(''); };

  // Exports
  const exportCSV = () => {
    const header=['Date','Description','Category','Type','Amount'];
    const rows = displayedTxns.map(tx=>[new Date(tx.date).toLocaleDateString(),tx.description,getCategoryName(tx.category),tx.type,tx.amount.toFixed(2)]);
    const csv=[header,...rows].map(r=>r.join(',')).join('\n');
    saveAs(new Blob([csv],{type:'text/csv;charset=utf-8;'}),'transactions.csv');
  };
  const exportPDF = () => {
    const doc=new jsPDF();
    const head=[['Date','Description','Category','Type','Amount']];
    const body=displayedTxns.map(tx=>[new Date(tx.date).toLocaleDateString(),tx.description,getCategoryName(tx.category),tx.type,tx.amount.toFixed(2)]);
    autoTable(doc,{ head, body, startY:20, styles:{ fontSize:8 }, headStyles:{ fillColor:[26,115,232] }, margin:{ left:10,right:10} });
    doc.text('Transactions Report',14,15);
    doc.save('transactions.pdf');
  };

  return (
    <div className="reports-page">
      <h1>Financial Reports</h1>
      {/* Date filters */}
      <div className="date-filters">
        <label>Start Date<input type="date" value={start} onChange={e=>setStart(e.target.value)}/></label>
        <label>End Date<input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></label>
        {isFiltered && <button className="clear-filter-btn" onClick={clearFilters}>Clear Filters</button>}
      </div>

      <div className="chart-container">
        <h2>Breakdown by Category</h2>
        <Bar ref={barRef} data={barData} options={chartOptions} onClick={handleBarClick}/>
      </div>

      {showTrend && (
        <div className="chart-container">
          <h2>Trend: Income vs. Expenses</h2>
          <Line data={{ labels:report.trend.map(d=>d._id), datasets:[{ label:'Income', data:report.trend.map(d=>d.income), fill:false, tension:0.3 }, { label:'Expenses', data:report.trend.map(d=>d.expense), fill:false, tension:0.3 } ] }} options={{ ...chartOptions, scales:{ x:{ title:{ display:true, text:'Period' } }, y:{ title:{ display:true, text:'Amount' }, beginAtZero:true } } }}/>
        </div>
      )}

      {/* Moved Pie chart above transactions */}
      <div className="chart-container">
        <h2>Income vs. Expenses</h2>
        <Doughnut ref={doughnutRef} data={doughnutData} options={chartOptions} onClick={handlePieClick}/>
      </div>

      <div className="transactions-table">
        <h2>
          Transactions ({displayedTxns.length})
          <span className="table-actions">
            <button className="export-btn" onClick={exportCSV}>CSV</button>
            <button className="export-btn" onClick={exportPDF}>PDF</button>
          </span>
        </h2>
        <table>
          <thead>
            <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {displayedTxns.map(tx=>(
              <tr key={tx._id}>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>{tx.description}</td>
                <td>{getCategoryName(tx.category)}</td>
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