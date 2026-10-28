import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { LayoutDashboard, Wallet, TrendingUp, Target, PieChart as PieIcon, LogOut, Download, Bell, User, Edit, Trash2, PlusCircle } from 'lucide-react'

const API = 'http://127.0.0.1:8000/api'
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [me, setMe] = useState(null)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // App Data
  const [stats, setStats] = useState({ income: 0, expense: 0, savings: 0 })
  const [expenses, setExpenses] = useState([])
  const [incomes, setIncomes] = useState([])
  const [goals, setGoals] = useState([])
  const [budgets, setBudgets] = useState([])
  const [notifications, setNotifications] = useState([])
  
  // Forms
  const [expForm, setExpForm] = useState({ category: 'food', amount: '', description: '' })
  const [incForm, setIncForm] = useState({ source: 'pocket_money', amount: '', description: '' })
  const [goalForm, setGoalForm] = useState({ name: '', target_amount: '', deadline: '' })
  const [budgetForm, setBudgetForm] = useState({ month: new Date().toISOString().slice(0, 7), total_amount: '' })

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    if (token) {
      axios.get(`${API}/me/`, authHeaders).then(r => setMe(r.data)).catch(logout)
      refreshData()
    }
  }, [token])

  const refreshData = () => {
    axios.get(`${API}/dashboard-stats/`, authHeaders).then(r => setStats(r.data))
    axios.get(`${API}/expenses/`, authHeaders).then(r => setExpenses(r.data))
    axios.get(`${API}/incomes/`, authHeaders).then(r => setIncomes(r.data))
    axios.get(`${API}/goals/`, authHeaders).then(r => setGoals(r.data))
    axios.get(`${API}/budgets/`, authHeaders).then(r => setBudgets(r.data))
    axios.get(`${API}/notifications/`, authHeaders).then(r => setNotifications(r.data))
  }

  const logout = () => { localStorage.clear(); setToken(null); setMe(null) }

  const submitAuth = async (e) => {
    e.preventDefault()
    try {
      if (mode === 'register') await axios.post(`${API}/register/`, form)
      const { data } = await axios.post(`${API}/token/`, { username: form.username, password: form.password })
      localStorage.setItem('token', data.access)
      setToken(data.access)
    } catch (err) { alert("Authentication Failed. Check credentials or backend server.") }
  }

  // --- CRUD HANDLERS ---
  const handleAddExpense = async (e) => {
    e.preventDefault()
    await axios.post(`${API}/expenses/`, { ...expForm, date: new Date().toISOString().split('T')[0] }, authHeaders)
    setExpForm({ category: 'food', amount: '', description: '' })
    refreshData()
  }

  const deleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await axios.delete(`${API}/expenses/${id}/`, authHeaders)
      refreshData()
    }
  }

  const editExpense = async (exp) => {
    const newAmount = window.prompt("Enter new amount:", exp.amount)
    const newDesc = window.prompt("Enter new description:", exp.description)
    if (newAmount && newDesc) {
      await axios.patch(`${API}/expenses/${exp.id}/`, { amount: newAmount, description: newDesc }, authHeaders)
      refreshData()
    }
  }

  const handleAddGoal = async (e) => {
    e.preventDefault()
    await axios.post(`${API}/goals/`, goalForm, authHeaders)
    setGoalForm({ name: '', target_amount: '', deadline: '' })
    refreshData()
  }

  const addFundsToGoal = async (goal) => {
    const amountToAdd = window.prompt(`How much would you like to add to "${goal.name}"?`)
    if (amountToAdd) {
      const newSaved = parseFloat(goal.saved_amount) + parseFloat(amountToAdd)
      await axios.patch(`${API}/goals/${goal.id}/`, { saved_amount: newSaved }, authHeaders)
      refreshData()
    }
  }

  const handleAddIncome = async (e) => {
    e.preventDefault()
    await axios.post(`${API}/incomes/`, { ...incForm, date: new Date().toISOString().split('T')[0] }, authHeaders)
    setIncForm({ source: 'pocket_money', amount: '', description: '' })
    refreshData()
  }

  const handleAddBudget = async (e) => {
    e.preventDefault()
    await axios.post(`${API}/budgets/`, budgetForm, authHeaders)
    setBudgetForm({ month: new Date().toISOString().slice(0, 7), total_amount: '' })
    refreshData()
  }

  const exportCSV = async () => {
    const res = await axios.get(`${API}/export-csv/`, authHeaders)
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'BudgetBuddy_Report.csv'
    a.click()
  }

  // --- LOGIN SCREEN ---
  if (!me) return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-900 p-4">
      <form onSubmit={submitAuth} className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.2)] w-full max-w-md border border-white/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/50"><Wallet className="text-white w-8 h-8" /></div>
          <h1 className="text-3xl font-extrabold text-white">BudgetBuddy</h1>
        </div>
        <div className="space-y-4">
          <input className="w-full bg-slate-900/50 text-white px-5 py-4 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition" placeholder="Username" required onChange={e => setForm({ ...form, username: e.target.value })} />
          {mode === 'register' && <input className="w-full bg-slate-900/50 text-white px-5 py-4 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition" placeholder="Email" type="email" required onChange={e => setForm({ ...form, email: e.target.value })} />}
          <input type="password" className="w-full bg-slate-900/50 text-white px-5 py-4 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition" placeholder="Password" required onChange={e => setForm({ ...form, password: e.target.value })} />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1">{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
        </div>
        <p className="text-center text-slate-400 mt-6 cursor-pointer hover:text-white transition" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}</p>
      </form>
    </div>
  )

  const pieData = expenses.reduce((acc, exp) => {
    const existing = acc.find(item => item.name === exp.category)
    if (existing) existing.value += Number(exp.amount)
    else acc.push({ name: exp.category, value: Number(exp.amount) })
    return acc;
  }, []);

  const barData = [ { name: 'Income', amount: stats.income }, { name: 'Expenses', amount: stats.expense }, { name: 'Savings', amount: stats.savings } ]

  // --- MAIN LAYOUT ---
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      {/* SIDEBAR */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50"><Wallet className="text-white w-5 h-5" /></div>
            <h1 className="text-xl font-bold text-white tracking-wide">BudgetBuddy</h1>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-400'}`}><LayoutDashboard size={20} /> Dashboard</button>
            <button onClick={() => setActiveTab('income')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'income' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'hover:bg-slate-800 text-slate-400'}`}><TrendingUp size={20} /> Income</button>
            <button onClick={() => setActiveTab('expenses')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'expenses' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'hover:bg-slate-800 text-slate-400'}`}><Wallet size={20} /> Expenses</button>
            <button onClick={() => setActiveTab('goals')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'goals' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'hover:bg-slate-800 text-slate-400'}`}><Target size={20} /> Savings Goals</button>
            <button onClick={() => setActiveTab('budgets')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${activeTab === 'budgets' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'hover:bg-slate-800 text-slate-400'}`}><PieIcon size={20} /> Budgets</button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-slate-800/50 rounded-xl"><User size={20} className="text-indigo-400" /><div><p className="text-sm font-bold text-white">{me.username}</p><p className="text-xs text-slate-400 capitalize">{me.role}</p></div></div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all"><LogOut size={18} /> Sign Out</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR WITH NOTIFICATIONS */}
        <header className="h-20 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-8 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white capitalize">{activeTab}</h2>
          <div className="flex items-center gap-6">
            
            {/* NOTIFICATION BELL */}
            <div className="relative group">
              <Bell className="text-slate-400 cursor-pointer hover:text-white transition" />
              {notifications.length > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  <div className="absolute right-0 mt-4 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 hidden group-hover:block z-50">
                    <h4 className="text-sm font-bold text-white mb-2 border-b border-slate-700 pb-2">Alerts</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="text-xs border-l-2 border-red-500 pl-2">
                          <p className="font-bold text-red-400">{n.title}</p>
                          <p className="text-slate-300">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={exportCSV} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-all text-sm"><Download size={16} /> Export Report</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
             <div className="space-y-8">
             <div className="grid grid-cols-3 gap-6">
               <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl"><p className="text-slate-400 font-semibold mb-1">Total Income</p><h3 className="text-3xl font-bold text-emerald-400">${stats.income.toFixed(2)}</h3></div>
               <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl"><p className="text-slate-400 font-semibold mb-1">Total Expenses</p><h3 className="text-3xl font-bold text-red-400">${stats.expense.toFixed(2)}</h3></div>
               <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-xl shadow-indigo-900/20"><p className="text-indigo-300 font-semibold mb-1">Net Savings</p><h3 className="text-3xl font-bold text-indigo-400">${stats.savings.toFixed(2)}</h3></div>
             </div>
             <div className="grid grid-cols-2 gap-6">
               <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl"><h3 className="text-lg font-bold text-white mb-4">Income vs Expenses</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={barData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}/><Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50}>{barData.map((entry, index) => (<Cell key={index} fill={entry.name === 'Income' ? '#10b981' : entry.name === 'Expenses' ? '#ef4444' : '#8b5cf6'} />))}</Bar></BarChart></ResponsiveContainer></div></div>
               <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl"><h3 className="text-lg font-bold text-white mb-4">Expense Categories</h3>{pieData.length > 0 ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">{pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}/><Legend verticalAlign="bottom" height={36} /></PieChart></ResponsiveContainer></div> : <div className="h-64 flex items-center justify-center text-slate-500">Add expenses to see chart</div>}</div>
             </div>
           </div>
          )}

          {/* INCOME TAB */}
          {activeTab === 'income' && (
             <div className="grid grid-cols-3 gap-8">
               <div className="col-span-1 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl h-fit">
                 <h3 className="text-lg font-bold text-white mb-6">Add Income</h3>
                 <form onSubmit={handleAddIncome} className="flex flex-col gap-4">
                   <select className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500" value={incForm.source} onChange={e => setIncForm({ ...incForm, source: e.target.value })}><option value="pocket_money">Pocket Money</option><option value="scholarship">Scholarship</option><option value="freelance">Freelance</option></select>
                   <input type="number" required placeholder="Amount ($)" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500" value={incForm.amount} onChange={e => setIncForm({ ...incForm, amount: e.target.value })} />
                   <input required placeholder="Description" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500" value={incForm.description} onChange={e => setIncForm({ ...incForm, description: e.target.value })} />
                   <button type="submit" className="mt-2 bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all">Add Income</button>
                 </form>
               </div>
               <div className="col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
                 <h3 className="text-lg font-bold text-white mb-6">Income History</h3>
                 <div className="space-y-3">
                   {incomes.map(inc => (
                     <div key={inc.id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                       <div><p className="font-bold text-white capitalize">{inc.source.replace('_', ' ')}</p><p className="text-sm text-slate-400">{inc.description} • {inc.date}</p></div>
                       <p className="font-bold text-emerald-400 text-lg">+${inc.amount}</p>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          )}

          {/* EXPENSES TAB */}
          {activeTab === 'expenses' && (
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-1 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl h-fit">
                <h3 className="text-lg font-bold text-white mb-6">Add Expense</h3>
                <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
                  <select className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-red-500" value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}><option value="food">Food</option><option value="travel">Travel</option><option value="shopping">Shopping</option><option value="education">Education</option><option value="entertainment">Entertainment</option></select>
                  <input type="number" required placeholder="Amount ($)" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-red-500" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} />
                  <input required placeholder="Description" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-red-500" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} />
                  <button type="submit" className="mt-2 bg-red-600 hover:bg-red-500 p-3 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all">Add Expense</button>
                </form>
              </div>
              <div className="col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6">Expense History</h3>
                <div className="space-y-3">
                  {expenses.map(ex => (
                    <div key={ex.id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div>
                        <p className="font-bold text-white capitalize">{ex.category}</p>
                        <p className="text-sm text-slate-400">{ex.description} • {ex.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-red-400 text-lg">-${ex.amount}</p>
                        <button onClick={() => editExpense(ex)} className="text-slate-400 hover:text-indigo-400"><Edit size={18} /></button>
                        <button onClick={() => deleteExpense(ex.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-1 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl h-fit">
                <h3 className="text-lg font-bold text-white mb-6">New Savings Goal</h3>
                <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
                  <input required placeholder="Goal Name" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500" value={goalForm.name} onChange={e => setGoalForm({ ...goalForm, name: e.target.value })} />
                  <input type="number" required placeholder="Target Amount ($)" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500" value={goalForm.target_amount} onChange={e => setGoalForm({ ...goalForm, target_amount: e.target.value })} />
                  <input type="date" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500" value={goalForm.deadline} onChange={e => setGoalForm({ ...goalForm, deadline: e.target.value })} />
                  <button type="submit" className="mt-2 bg-amber-600 hover:bg-amber-500 p-3 rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all">Create Goal</button>
                </form>
              </div>
              <div className="col-span-2 space-y-4">
                {goals.map(goal => {
                  const progress = (goal.saved_amount / goal.target_amount) * 100 || 0;
                  return (
                    <div key={goal.id} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-white">{goal.name}</h4>
                          <p className="text-sm text-slate-400">Deadline: {goal.deadline || 'None'}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="text-amber-400 font-bold">${goal.saved_amount} / ${goal.target_amount}</p>
                          <button onClick={() => addFundsToGoal(goal)} className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-600 transition"><PlusCircle size={14}/> Add Funds</button>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 mt-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 text-right">{progress.toFixed(1)}% Saved</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* BUDGETS TAB */}
          {activeTab === 'budgets' && (
             <div className="grid grid-cols-3 gap-8">
               <div className="col-span-1 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl h-fit">
                 <h3 className="text-lg font-bold text-white mb-6">Set Monthly Budget</h3>
                 <form onSubmit={handleAddBudget} className="flex flex-col gap-4">
                   <input type="month" required className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-purple-500" value={budgetForm.month} onChange={e => setBudgetForm({ ...budgetForm, month: e.target.value })} />
                   <input type="number" required placeholder="Total Budget Amount ($)" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-purple-500" value={budgetForm.total_amount} onChange={e => setBudgetForm({ ...budgetForm, total_amount: e.target.value })} />
                   <button type="submit" className="mt-2 bg-purple-600 hover:bg-purple-500 p-3 rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all">Set Budget</button>
                 </form>
               </div>
               <div className="col-span-2 space-y-4">
                 {budgets.map(b => (
                    <div key={b.id} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl flex justify-between items-center">
                      <div><h4 className="text-lg font-bold text-white mb-1">Budget for {b.month}</h4><p className="text-slate-400 text-sm">Allocated Limit</p></div>
                      <p className="text-2xl font-bold text-purple-400">${b.total_amount}</p>
                    </div>
                 ))}
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  )
}