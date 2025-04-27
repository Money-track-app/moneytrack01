import { useState } from 'react';
import axios from 'axios';
import './addtransaction.css'; // ✨ Import the CSS below

const AddTransaction = () => {
  const [form, setForm] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: '',
    description: '',
  });
  const [receiptFile, setReceiptFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('category', form.category);
      formData.append('amount', form.amount);
      formData.append('date', form.date);
      formData.append('description', form.description);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await axios.post('http://localhost:5000/api/transactions', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          
        },
      });

      alert('Transaction added!');
      setForm({ type: 'expense', category: '', amount: '', date: '', description: '' });
      setReceiptFile(null);
    } catch (err) {
      console.error('Error adding transaction:', err);
      alert('Error adding transaction.');
    }
  };

  return (
    <div className="add-transaction-container">
      <h2>Add New Transaction</h2>
      <form className="transaction-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          Type:
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label>
          Category:
          <input
            type="text"
            name="category"
            placeholder="e.g. Rent, Sales"
            value={form.category}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Amount:
          <input
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date:
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            placeholder="Optional"
            value={form.description}
            onChange={handleChange}
          ></textarea>
        </label>

        <label>
          Attach Receipt (optional):
          <input
            type="file"
            name="receipt"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileChange}
          />
          {receiptFile && <p>Selected file: {receiptFile.name}</p>}
        </label>

        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
};

export default AddTransaction;


