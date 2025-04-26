import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';  // auto-registers everything
import './reports.css';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      return;
    }

    fetch('http://localhost:5000/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(setReport)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p className="reports-error">{error}</p>;
  if (!report) return <p>Loading reports…</p>;

  // Prepare doughnut data
  const doughnutData = {
    labels: ['Income', 'Expenses'],
    datasets: [{ data: [report.totalIncome, report.totalExpenses] }]
  };

  // Prepare bar chart for categories
  const barData = {
    labels: report.byCategory.map(c => c._id),
    datasets: [{ data: report.byCategory.map(c => c.total) }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="reports-page">
      <h1>Financial Reports</h1>

      <div className="chart-container">
        <h2>Income vs. Expenses</h2>
        <Doughnut
          data={doughnutData}
          options={chartOptions}
        />
      </div>

      <div className="chart-container">
        <h2>Breakdown by Category</h2>
        <Bar
          data={barData}
          options={chartOptions}
        />
      </div>
    </div>
  );
}
