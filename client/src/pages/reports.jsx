import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Reports = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    };
    fetchData();
  }, []);

  const income = transactions.filter(t => t.type === 'income')
  const expense = transactions.filter(t => t.type === 'expense')

  const incomeTotal = income.reduce((acc, t) => acc + t.amount, 0);
  const expenseTotal = expense.reduce((acc, t) => acc + t.amount, 0);

  // Bar Chart Data (Monthly Summary — dummy data for now)
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Income',
        data: [1000, 1500, 2000, 1800],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
      {
        label: 'Expenses',
        data: [800, 1200, 900, 1400],
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
    ],
  };

  // Pie Chart (Category Breakdown)
  const categoryData = {
    labels: [...new Set(expense.map(t => t.category))],
    datasets: [
      {
        data: [...new Set(expense.map(cat =>
          expense.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
        ))],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#6f42c1', '#20c997'],
      },
    ],
  };

  return (
    <div className="reports-container" style={{ padding: '2rem' }}>
      <h2>📊 Reports</h2>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3>💵 Total Income: ${incomeTotal}</h3>
          <h3>💸 Total Expense: ${expenseTotal}</h3>
          <h3>📈 Profit: ${incomeTotal - expenseTotal}</h3>
        </div>
      </div>

      <div>
        <h3>Monthly Overview (Bar Chart)</h3>
        <Bar data={barData} />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Expense by Category (Pie Chart)</h3>
        <Pie data={categoryData} />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button style={{
          padding: '0.7rem 1.5rem',
          backgroundColor: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Export Report (Coming Soon)
        </button>
      </div>
    </div>
  );
};

export default Reports;
