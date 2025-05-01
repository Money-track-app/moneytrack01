import React, { createContext, useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';  // ← your server

const CategoryContext = createContext({
  categories: [],
  fetchCategories: () => Promise.resolve()
});

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Category fetch error:', err);
    }
  };

  // initial load
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
}

export default CategoryContext;
