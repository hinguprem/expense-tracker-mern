const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  addTransaction, 
  deleteTransaction, 
  updateTransaction 
} = require('../controllers/transactions');

router
  .route('/')
  .get(getTransactions)
  .post(addTransaction);

router
  .route('/:id')
  .delete(deleteTransaction)
  .put(updateTransaction);

module.exports = router;