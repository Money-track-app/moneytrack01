import React, { useEffect, useState, useContext } from 'react';
import './Dashboard.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
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
import { CategoryContext } from '../context/categorycontext';
import { SearchContext } from '../context/searchcontext';

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
const brightColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
];

const getCurrencySymbol = (code) => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AED: 'د.إ' };
  return symbols[code] || code;
};

function SummaryCard({ title, value, prefix }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const end = value;
    const duration = 1000;
    const stepTime = 16;
    const totalSteps = Math.ceil(duration / stepTime);
    let step = 0;

    const counter = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const eased = progress * (2 - progress);
      setDisplayValue((end * eased).toFixed(2));
      if (step >= totalSteps) {
        setDisplayValue(end.toFixed(2));
        clearInterval(counter);
      }
    }, stepTime);

    return () => clearInterval(counter);
  }, [value]);

  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{prefix}{displayValue}</p>
    </div>
  );
}

export default function Dashboard() {
  const { categories } = useContext(CategoryContext);
  const { searchTerm } = useContext(SearchContext);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    incomeThisMonth: 0,
    expensesThisMonth: 0,
    netProfitLoss: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [scheduled, setScheduled] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

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

        if (!sumRes.ok || !txRes.ok || !schedRes.ok) throw new Error("Fetch failed");

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
        setScheduled(Array.isArray(schedData) ? schedData : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    }

    fetchData();
  }, []);

  const getCategoryName = id => {
    if (!id) return 'Uncategorized';
    const cat = categories.find(c => c._id === id);
    return cat ? cat.name : 'Uncategorized';
  };

  const search = searchTerm.toLowerCase();
  const filteredTx = transactions.filter(tx =>
    tx.description?.toLowerCase().includes(search) ||
    getCategoryName(tx.category)?.toLowerCase().includes(search)
  );

  const filteredScheduled = scheduled.filter(item =>
    item.title?.toLowerCase().includes(search) ||
    item.category?.toLowerCase().includes(search)
  );

  const recentTx = filteredTx.slice(0, 5);
  const upcoming = filteredScheduled
    .map((item) => ({ ...item, _parsedDate: new Date(item.nextRun) }))
    .filter((it) => !isNaN(it._parsedDate.getTime()))
    .sort((a, b) => a._parsedDate - b._parsedDate)
    .slice(0, 5);

  const today = new Date();
  const dates = [];
  const incomeByDate = {};
  const expenseByDate = {};

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
      { label: 'Income', data: dates.map((d) => incomeByDate[d]), fill: false },
      { label: 'Expenses', data: dates.map((d) => expenseByDate[d]), fill: false },
    ],
  };

  const categoryTotals = {};
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const name = getCategoryName(tx.category);
      categoryTotals[name] = (categoryTotals[name] || 0) + tx.amount;
    }
  });

  const catLabels = Object.keys(categoryTotals);
  const catValues = Object.values(categoryTotals);
  const categoryChartData = {
    labels: catLabels,
    datasets: [
      {
        label: 'Expenses by Category',
        data: catValues,
        backgroundColor: catLabels.map((_, idx) => brightColors[idx % brightColors.length]),
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="summary-cards">
        <SummaryCard title="Total Balance" value={summary.totalBalance} prefix="$" />
        <SummaryCard title="Income This Month" value={summary.incomeThisMonth} prefix="+ $" />
        <SummaryCard title="Expenses This Month" value={summary.expensesThisMonth} prefix="- $" />
        <SummaryCard title="Net Profit/Loss" value={summary.netProfitLoss} prefix="$" />
      </div>

      <div className="charts-container">
        <div className="chart-item" data-aos="fade-up">
          <h4>Income vs. Expenses (30d)</h4>
          <Line data={trendChartData} />
        </div>
        <div className="chart-item" data-aos="fade-up" data-aos-delay="100">
          <h4>Expenses by Category</h4>
          <Pie data={categoryChartData} />
        </div>
      </div>

      <div className="details-container">
  <div className="list-section" data-aos="fade-up">
    <h4>Recent Transactions</h4>
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Description</th><th>Category</th><th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {recentTx.map((tx) => {
          const d = new Date(tx.date);
          return (
            <tr key={tx._id}>
              <td>{isNaN(d.getTime()) ? '—' : d.toLocaleDateString()}</td>
              <td>{tx.description}</td>
              <td>{getCategoryName(tx.category)}</td>
              <td className={tx.type === 'income' ? 'positive' : 'negative'}>
                {tx.type === 'income' ? '+' : '-'}
                {getCurrencySymbol(tx.currency)}{tx.amount.toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  <div className="list-section" data-aos="fade-up" data-aos-delay="100">
    <h4>Upcoming Scheduled</h4>
    <ul>
      {upcoming.length > 0 ? (
        upcoming.map((item) => (
          <li key={item._id}>
            {item._parsedDate.toLocaleDateString()} – ${item.amount.toFixed(2)}
          </li>
        ))
      ) : (
        <li>No upcoming items</li>
      )}
    </ul>
  </div>
</div>

    </div>
  );
}
