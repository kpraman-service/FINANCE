'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SummaryData {
  total_income: number;
  total_expenses: number;
  total_savings: number;
  savings_rate: number;
  average_daily_spending: number;
  top_income_source?: string;
  financial_health?: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

interface MonthlyItem {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savings_rate: number;
}

interface CategoryItem {
  name: string;
  icon?: string;
  amount: number;
  percentage: number;
}

interface TransactionItem {
  id: number;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  payment_method?: string;
  date: string;
  amount: number | string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, monthRes, catRes, txRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/monthly'),
        api.get('/analytics/categories'),
        api.get('/transactions?limit=5')
      ]);

      setSummary(sumRes.data);
      setMonthly(monthRes.data.months || []);
      setCategories(catRes.data.categories || []);
      setTransactions(txRes.data.items || []);
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-800 rounded-xl"></div>
          <div className="h-72 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const balance = (summary?.total_income || 0) - (summary?.total_expenses || 0);

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Financial Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time overview of your income, expenses, and savings health</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => window.location.href = '/income'} size="sm" variant="secondary" className="gap-1">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Income</span>
          </Button>
          <Button onClick={() => window.location.href = '/expenses'} size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Net Balance</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-100">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
              <Activity className="w-3 h-3 text-blue-400" />
              <span>Current balance pool</span>
            </div>
          </div>
        </Card>

        <Card className="glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Monthly Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400">₹{(summary?.total_income || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400/80">
              <ArrowUpRight className="w-3 h-3" />
              <span>Top source: {summary?.top_income_source || 'Salary'}</span>
            </div>
          </div>
        </Card>

        <Card className="glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Monthly Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-400">₹{(summary?.total_expenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-red-400/80">
              <ArrowDownLeft className="w-3 h-3" />
              <span>Avg daily: ₹{summary?.average_daily_spending || 0}/day</span>
            </div>
          </div>
        </Card>

        <Card className="glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Net Savings & Health</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-300">{summary?.savings_rate || 0}%</div>
              <div className="text-[11px] text-slate-400">Savings rate target</div>
            </div>
            <Badge variant={summary?.financial_health === 'Excellent' ? 'success' : 'warning'}>
              {summary?.financial_health || 'Good'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <Card title="Income vs Expenses (Monthly)" className="lg:col-span-2">
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Expense Distribution Pie Chart */}
        <Card title="Expenses Breakdown">
          {categories.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No expense categories recorded yet
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions Section */}
      <Card
        title="Recent Transactions Ledger"
        subtitle="Showing latest financial transactions across all payment methods"
        action={
          <Button onClick={() => window.location.href = '/transactions'} size="sm" variant="ghost">
            View All &rarr;
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Payment Method</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-medium text-slate-200">{tx.description}</td>
                  <td className="py-3">
                    <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>
                      {tx.type.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-400">{tx.payment_method || 'Cash'}</td>
                  <td className="py-3 text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={`py-3 text-right font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{floatVal(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No transactions recorded. Click Add Income or Add Expense to start tracking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function floatVal(val: number | string): number {
  return typeof val === 'number' ? val : parseFloat(val || '0');
}
