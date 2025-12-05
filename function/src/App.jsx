import React, { createContext, useReducer, useContext, useState, useEffect, useRef } from 'react';
import { 
  Trash2, Plus, TrendingUp, TrendingDown, Wallet, History, Pencil, Save, X, 
  Utensils, Home, Zap, Film, HeartPulse, Banknote, Package, ChevronDown, Check, Search, Calendar 
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';

// ==========================================
// 0. CONFIGURATION (Icons & Colors)
// ==========================================

const CATEGORIES = [
  { id: 'Food', label: 'Food & Dining', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'Rent', label: 'Rent & Housing', icon: Home, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'Utilities', label: 'Utilities', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { id: 'Entertainment', label: 'Entertainment', icon: Film, color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: 'Health', label: 'Health & Fitness', icon: HeartPulse, color: 'text-red-600', bg: 'bg-red-100' },
  { id: 'Salary', label: 'Salary & Income', icon: Banknote, color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'Other', label: 'Other Expenses', icon: Package, color: 'text-slate-600', bg: 'bg-slate-100' }
];

// ==========================================
// 1. STATE MANAGEMENT
// ==========================================

const initialState = {
  transactions: [],
  error: null,
  loading: true,
  editing: null
};

const GlobalContext = createContext(initialState);

const AppReducer = (state, action) => {
  switch (action.type) {
    case 'GET_TRANSACTIONS':
      return { ...state, loading: false, transactions: action.payload };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t._id !== action.payload)
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t._id === action.payload._id ? action.payload : t
        ),
        editing: null
      };
    case 'SET_EDITING':
      return { ...state, editing: action.payload };
    case 'TRANSACTION_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  async function getTransactions() {
    try {
      const res = await axios.get('/api/v1/transactions');
      dispatch({ type: 'GET_TRANSACTIONS', payload: res.data.data });
    } catch (err) {
      dispatch({ type: 'TRANSACTION_ERROR', payload: err.response?.data?.error });
    }
  }

  async function deleteTransaction(id) {
    try {
      await axios.delete(`/api/v1/transactions/${id}`);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    } catch (err) {
      dispatch({ type: 'TRANSACTION_ERROR', payload: err.response?.data?.error });
    }
  }

  async function addTransaction(transaction) {
    try {
      const res = await axios.post('/api/v1/transactions', transaction, { headers: { 'Content-Type': 'application/json' } });
      dispatch({ type: 'ADD_TRANSACTION', payload: res.data.data });
    } catch (err) {
      dispatch({ type: 'TRANSACTION_ERROR', payload: err.response?.data?.error });
    }
  }

  async function updateTransaction(id, updatedData) {
    try {
      const res = await axios.put(`/api/v1/transactions/${id}`, updatedData, { headers: { 'Content-Type': 'application/json' } });
      dispatch({ type: 'UPDATE_TRANSACTION', payload: res.data.data });
    } catch (err) {
      dispatch({ type: 'TRANSACTION_ERROR', payload: err.response?.data?.error });
    }
  }

  function setEditing(transaction) {
    dispatch({ type: 'SET_EDITING', payload: transaction });
  }

  useEffect(() => { getTransactions(); }, []);

  return (
    <GlobalContext.Provider
      value={{
        transactions: state.transactions,
        editing: state.editing,
        getTransactions,
        deleteTransaction,
        addTransaction,
        updateTransaction,
        setEditing
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// ==========================================
// 2. COMPONENTS
// ==========================================

// --- Custom Dropdown Component ---
const CategoryDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategory = CATEGORIES.find(c => c.id === value) || CATEGORIES[6];
  const Icon = selectedCategory.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full mt-1 p-3 rounded-xl border bg-white flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${selectedCategory.bg} ${selectedCategory.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-medium text-slate-700">{selectedCategory.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu - UPDATED: Now opens UPWARDS (bottom-full mb-2) */}
      {isOpen && (
        <div className="absolute z-10 w-full bottom-full mb-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const isSelected = value === cat.id;
            return (
              <div 
                key={cat.id}
                onClick={() => { onChange(cat.id); setIsOpen(false); }}
                className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cat.bg} ${cat.color}`}>
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm ${isSelected ? 'font-bold text-indigo-900' : 'text-slate-600'}`}>
                    {cat.label}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Header = () => (
  <div className="mb-6 text-center">
    <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
      <Wallet className="w-8 h-8 text-indigo-600" /> Expense Tracker Pro
    </h2>
  </div>
);

const SpendingChart = () => {
  const { transactions } = useContext(GlobalContext);

  const data = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, curr) => {
      const cat = curr.category || 'Other';
      const existing = acc.find(item => item.name === cat);
      if (existing) {
        existing.value += Math.abs(curr.amount);
      } else {
        acc.push({ name: cat, value: Math.abs(curr.amount) });
      }
      return acc;
    }, []);
    
  // Calculate total expense to compute percentage
  const totalExpense = data.reduce((acc, item) => acc + item.value, 0);

  const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#8884d8', '#ffc658'];

  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col items-center">
      <h3 className="text-slate-500 font-bold mb-4">Spending by Category</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => {
                const percent = ((value / totalExpense) * 100).toFixed(1);
                return [`$${value} (${percent}%)`]; 
              }} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Balance = () => {
  const { transactions } = useContext(GlobalContext);
  const total = transactions.reduce((acc, item) => acc + item.amount, 0).toFixed(2);
  const sign = total < 0 ? '-' : '';
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg mb-6 text-center">
      <h4 className="text-blue-100 text-sm font-medium uppercase">Total Balance</h4>
      <h1 className="text-4xl font-bold mt-1">{sign}${Math.abs(total)}</h1>
    </div>
  );
};

const IncomeExpenses = () => {
  const { transactions } = useContext(GlobalContext);
  const income = transactions.filter(item => item.amount > 0).reduce((acc, item) => acc + item.amount, 0).toFixed(2);
  const expense = (transactions.filter(item => item.amount < 0).reduce((acc, item) => acc + item.amount, 0) * -1).toFixed(2);

  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"><TrendingUp className="w-5 h-5 text-green-600" /></div>
        <p className="text-green-600 text-lg font-bold">+${income}</p>
      </div>
      <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"><TrendingDown className="w-5 h-5 text-red-600" /></div>
        <p className="text-red-600 text-lg font-bold">-${expense}</p>
      </div>
    </div>
  );
};

// --- Updated Transaction List with Search & Filters ---
const TransactionList = () => {
  const { transactions, deleteTransaction, setEditing } = useContext(GlobalContext);
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'
  const [search, setSearch] = useState('');

  // Helper to get category details
  const getCatDetails = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[6];
  
  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'income' ? t.amount > 0 :
      t.amount < 0;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5" /> Recent History
        </h3>
        
        {/* Filter Tabs */}
        <div className="flex bg-slate-100 rounded-lg p-1">
            {['all', 'income', 'expense'].map((f) => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-all ${filter === f ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 text-slate-600"
        />
      </div>

      <ul className="space-y-3">
        {filteredTransactions.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-4 italic">No transactions match your search.</p>
        ) : (
            filteredTransactions.map((transaction) => {
                const isExpense = transaction.amount < 0;
                const cat = getCatDetails(transaction.category);
                const CatIcon = cat.icon;

                return (
                    <li key={transaction._id} className="bg-white flex justify-between items-center p-4 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isExpense ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        
                        <div className="flex items-center gap-3 flex-1">
                          {/* Category Icon */}
                          <div className={`p-2 rounded-lg ${cat.bg} ${cat.color} hidden sm:block`}>
                            <CatIcon className="w-5 h-5" />
                          </div>
                          
                          <div className="ml-2">
                              <span className="font-bold text-slate-700 block">{transaction.text}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium">{cat.label}</span>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {formatDate(transaction.createdAt)}
                                </span>
                              </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>{isExpense ? '-' : '+'}${Math.abs(transaction.amount)}</span>
                            <button onClick={() => setEditing(transaction)} className="text-slate-300 hover:text-indigo-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => deleteTransaction(transaction._id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </li>
                );
            })
        )}
      </ul>
    </div>
  );
};

const AddTransaction = () => {
  const { addTransaction, updateTransaction, editing, setEditing } = useContext(GlobalContext);
  
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');

  useEffect(() => {
    if (editing) {
      setText(editing.text);
      setAmount(editing.amount);
      setCategory(editing.category || 'Other');
    } else {
      setText(''); setAmount(''); setCategory('Other');
    }
  }, [editing]);

  const onSubmit = (e) => {
    e.preventDefault();
    const data = { text, amount: +amount, category };

    if (editing) {
      updateTransaction(editing._id, data);
    } else {
      addTransaction(data);
    }
    setText(''); setAmount(''); setCategory('Other');
  };

  const cancelEdit = () => {
    setEditing(null);
    setText(''); setAmount(''); setCategory('Other');
  }

  return (
    <div className={`p-6 rounded-2xl border transition-colors ${editing ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {editing ? <Pencil className="w-5 h-5 text-indigo-600"/> : <Plus className="w-5 h-5 text-indigo-600"/>}
            {editing ? 'Edit Transaction' : 'Add New Transaction'}
        </h3>
        {editing && <button onClick={cancelEdit} className="text-xs text-red-500 flex items-center gap-1 hover:underline"><X className="w-3 h-3"/> Cancel Edit</button>}
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Salary, Rent" className="w-full mt-1 p-3 rounded-xl border focus:ring-2 focus:ring-indigo-200 outline-none transition-all" required />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="-20 or 500" className="w-full mt-1 p-3 rounded-xl border focus:ring-2 focus:ring-indigo-200 outline-none transition-all" required />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                {/* NEW CUSTOM DROPDOWN */}
                <CategoryDropdown value={category} onChange={setCategory} />
            </div>
        </div>
        <button className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex justify-center gap-2 ${editing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-slate-900'}`}>
            {editing ? <Save className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
            {editing ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// 3. MAIN APP
// ==========================================

const App = () => {
  return (
    <GlobalProvider>
      <div className="min-h-screen bg-slate-50 font-sans py-10 px-4">
        <div className="max-w-md mx-auto">
          <Header />
          <Balance />
          <SpendingChart />
          <IncomeExpenses />
          <TransactionList />
          <AddTransaction />
        </div>
      </div>
    </GlobalProvider>
  );
};

export default App;