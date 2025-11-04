import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const priceBGN = parseFloat(req.body.priceBGN);
    const image = req.file ? "/uploads/" + req.file.filename : null;
    const product = new Product({ name, description, category, priceBGN, image });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedData = { ...req.body };
    if (req.file) updatedData.image = "/uploads/" + req.file.filename;
    const updated = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Продуктът не е намерен" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Продуктът не е намерен" });
    res.json({ message: "Продуктът е изтрит успешно" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
