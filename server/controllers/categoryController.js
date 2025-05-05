const Category = require('../models/category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category
      .find({ userId: req.user.id })
      .sort('type name');
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'Name and type are required' });

    // 🔒 Free users can only create 5 categories
    const existingCount = await Category.countDocuments({ userId: req.user.id });

    if (!req.user.isPremium && req.user.role !== 'admin' && existingCount >= 5) {
      return res.status(403).json({ message: 'Free plan limit reached. Upgrade to Premium to add more categories.' });
    }

    const category = new Category({ userId: req.user.id, name, type });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { name, type },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ message: 'Server error updating category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};
