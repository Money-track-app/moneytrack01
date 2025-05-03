import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_URL = 'http://localhost:5000';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalBalance: 0,
    incomeThisMonth: 0,
    expensesThisMonth: 0,
    netProfitLoss: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [scheduled, setScheduled] = useState([]);

  // Fetch summary, transactions, and scheduled data
  useEffect(() => {
    const token = localStorage.getItem('token');
    async function fetchData() {
      try {
        const [sumRes, txRes, schedRes] = await Promise.all([
          fetch(`${API_URL}/api/reports`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/transactions?limit=30`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/scheduled`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!sumRes.ok) throw new Error(`Summary fetch failed: ${sumRes.status}`);
        if (!txRes.ok) throw new Error(`Transactions fetch failed: ${txRes.status}`);
        if (!schedRes.ok) throw new Error(`Scheduled fetch failed: ${schedRes.status}`);

        const sumData = await sumRes.json();
        const txData = await txRes.json();
        const schedData = await schedRes.json();

        setSummary({
          totalBalance: sumData.balance ?? 0,
          incomeThisMonth: sumData.totalIncome ?? 0,
          expensesThisMonth: sumData.totalExpenses ?? 0,
          netProfitLoss: (sumData.totalIncome ?? 0) - (sumData.totalExpenses ?? 0),
        });
        setTransactions(txData);
        setScheduled(schedData);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    }
    fetchData();
  }, []);

  // Prepare data for trend chart (last 30 days)
  const dates = [];
  const incomeByDate = {};
  const expenseByDate = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dates.push(key);
    incomeByDate[key] = 0;
    expenseByDate[key] = 0;
  }
  transactions.forEach((tx) => {
    const dateKey = new Date(tx.date).toISOString().split('T')[0];
    if (incomeByDate[dateKey] !== undefined) {
      if (tx.type === 'income') incomeByDate[dateKey] += tx.amount;
      else expenseByDate[dateKey] += tx.amount;
    }
  });
  const trendChartData = {
    labels: dates,
    datasets: [
      { label: 'Income', data: dates.map((d) => incomeByDate[d]), borderColor: 'green', fill: false },
      { label: 'Expenses', data: dates.map((d) => expenseByDate[d]), borderColor: 'red', fill: false },
    ],
  };

  // Prepare data for category pie chart
  const categoryTotals = {};
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    }
  });
  const catLabels = Object.keys(categoryTotals);
  const catValues = Object.values(categoryTotals);
  const categoryChartData = {
    labels: catLabels,
    datasets: [{ label: 'Expenses by Category', data: catValues, backgroundColor: catLabels.map(() => 'rgba(0,0,0,0.1)') }],
  };

  // Slice recent transactions and upcoming scheduled items
  const recentTx = transactions.slice(0, 5);
  const upcoming = scheduled
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      {/* Summary Cards */}
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
      </div>

      {/* Charts */}
      <div className="charts-container">
        <div className="chart-item">
          <h4>Income vs. Expenses (30d)</h4>
          <Line data={trendChartData} />
        </div>
        <div className="chart-item">
          <h4>Expenses by Category</h4>
          <Pie data={categoryChartData} />
        </div>
      </div>

      {/* Details Lists */}
      <div className="details-container">
        <div className="list-section">
          <h4>Recent Transactions</h4>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((tx) => (
                <tr key={tx._id}>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td>{tx.description}</td>
                  <td>{tx.category}</td>
                  <td className={tx.type === 'income' ? 'positive' : 'negative'}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="list-section">
          <h4>Upcoming Scheduled</h4>
          <ul>
            {upcoming.map((item) => (
              <li key={item._id}>
                {new Date(item.date).toLocaleDateString()} – ${item.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
