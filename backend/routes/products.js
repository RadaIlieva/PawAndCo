import express from 'express';
import multer from 'multer';
import path from 'path';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/ProductsController.js';

const router = express.Router();

// Настройка на Multer за качване на файлове
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // папка за изображения
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Само PNG и JPEG са позволени'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Вземане на продукти
router.get('/', getProducts);

// Добавяне на продукт с изображение
router.post('/', upload.single('image'), createProduct);

// Редакция на продукт
router.put('/:id', upload.single('image'), updateProduct);

// Изтриване на продукт
router.delete('/:id', deleteProduct);

export default router;
