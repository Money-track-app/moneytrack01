// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const API_URL = 'http://localhost:5000';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalBalance: 0,
    incomeThisMonth: 0,
    expensesThisMonth: 0,
    netProfitLoss: 0,
    upcomingScheduled: '—'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    async function fetchSummary() {
      try {
        const res = await fetch(`${API_URL}/api/reports`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`);
        const data = await res.json();
        // Map backend fields to summary state
        setSummary({
          totalBalance: data.balance ?? 0,
          incomeThisMonth: data.totalIncome ?? 0,
          expensesThisMonth: data.totalExpenses ?? 0,
          netProfitLoss: data.balance ?? 0,
          upcomingScheduled: '—'
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="summary-cards">
        <div className="card">
          <h3>Total Balance</h3>
          <p>${summary.totalBalance.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Income This Month</h3>
          <p>+ ${summary.incomeThisMonth.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Expenses This Month</h3>
          <p>- ${summary.expensesThisMonth.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Net Profit/Loss</h3>
          <p>${summary.netProfitLoss.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Upcoming Scheduled</h3>
          <p>{summary.upcomingScheduled}</p>
        </div>
      </div>
    </div>
  );
}