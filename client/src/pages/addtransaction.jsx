// client/src/pages/AddTransaction.jsx
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import './addtransaction.css';
import { CategoryContext } from '../context/categorycontext';

const API_URL = 'http://localhost:5000';

const AddTransaction = () => {
  const { categories, fetchCategories } = useContext(CategoryContext);
  const [form, setForm] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: '',
    description: ''
  });
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
  const [receiptFile, setReceiptFile] = useState(null);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNewCategoryChange = e =>
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });

  const handleFileChange = e => setReceiptFile(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let categoryValue = form.category;

      // 1) Create new category if requested
      if (useNewCategory) {
        const { data: created } = await axios.post(
          `${API_URL}/api/categories`,
          { name: newCategory.name, type: newCategory.type },
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
        );
        categoryValue = created._id;
        // refresh category list
        fetchCategories();
      }

      // 2) Prepare transaction payload
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('category', categoryValue);
      formData.append('amount', form.amount);
      formData.append('date', form.date);
      formData.append('description', form.description);
      if (receiptFile) formData.append('receipt', receiptFile);

      // 3) Submit transaction
      await axios.post(
        `${API_URL}/api/transactions`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Transaction added!');
      // Reset form
      setForm({ type: 'expense', category: '', amount: '', date: '', description: '' });
      setNewCategory({ name: '', type: 'expense' });
      setUseNewCategory(false);
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

        {/* Transaction Type */}
        <label>
          Type:
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        {/* Category Selector or New Category */}
        <label>
          Category:
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={useNewCategory}
            required
          >
            <option value="" disabled>Select existing category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
          <div className="new-cat-toggle">
            <input
              type="checkbox"
              id="newCategory"
              checked={useNewCategory}
              onChange={() => setUseNewCategory(prev => !prev)}
            />
            <label htmlFor="newCategory">Create new category</label>
          </div>
        </label>

        {/* New Category Inputs */}
        {useNewCategory && (
          <>
            <label>
              New Category Name:
              <input
                type="text"
                name="name"
                value={newCategory.name}
                onChange={handleNewCategoryChange}
                placeholder="e.g. Subscription"
                required
              />
            </label>
            <label>
              New Category Type:
              <select
                name="type"
                value={newCategory.type}
                onChange={handleNewCategoryChange}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
          </>
        )}

        {/* Amount */}
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

        {/* Date */}
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

        {/* Description */}
        <label>
          Description:
          <textarea
            name="description"
            placeholder="Optional"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        {/* Receipt File */}
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

        {/* Submit */}
        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
};

export default AddTransaction;