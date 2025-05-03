// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const API_URL = 'http://localhost:5000';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalBalance: 0,
    incomeThisMonth: 0,
    expensesThisMonth: 0,
    netProfitLoss: 0
  });
  const [upcomingScheduled, setUpcomingScheduled] = useState(null);

  // Fetch financial summary
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
        setSummary({
          totalBalance:    data.balance        ?? 0,
          incomeThisMonth: data.totalIncome    ?? 0,
          expensesThisMonth: data.totalExpenses ?? 0,
          netProfitLoss:   data.balance        ?? 0
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchSummary();
  }, []);

  // Fetch upcoming schedule
  useEffect(() => {
    const token = localStorage.getItem('token');
    async function fetchUpcoming() {
      try {
        const res = await fetch(`${API_URL}/api/scheduled`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error(`Failed to fetch scheduled: ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUpcomingScheduled(data[0].amount);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUpcoming();
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
          <p>{upcomingScheduled != null ? `$${upcomingScheduled.toFixed(2)}` : '—'}</p>
        </div>
      </div>
    </div>
  );
}
