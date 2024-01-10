const express = require('express');
const router = express.Router();
const SalesController = require('../controller/SalesController.js')


router.get('/total-revenue', SalesController.getTotalRevenue)
router.get('/quantity-by-product', SalesController.getQuantityByProduct)
router.get('/top-products', SalesController.TopProduct)
router.get('/average-price', SalesController.AveragePrice)
router.get('/revenue-by-month', SalesController.revenueByMonth)
router.get('/highest-quantity-sold', SalesController.highestQuantityBySold)
router.get('/department-salary-expense', SalesController.DepartmentSalaryExpense)

module.exports = router