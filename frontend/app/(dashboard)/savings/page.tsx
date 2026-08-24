'use client';

import { useEffect, useState, FormEvent } from 'react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Target, Plus, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';

interface SavingsGoalItem {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: 'active' | 'completed' | 'abandoned';
  percentage_completed: number;
  days_remaining: number;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoalItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoalItem | null>(null);
  const [txType, setTxType] = useState<'add' | 'withdraw'>('add');
  const [amount, setAmount] = useState('');

  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    target_date: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/savings');
      setGoals(res.data || []);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/savings', {
        title: newGoal.title,
        target_amount: parseFloat(newGoal.target_amount),
        target_date: new Date(newGoal.target_date).toISOString(),
      });
      setIsCreateModalOpen(false);
      setNewGoal({ title: '', target_amount: '', target_date: new Date().toISOString().split('T')[0] });
      fetchGoals();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      alert(apiErr.response?.data?.detail || 'Failed to create savings goal');
    }
  };

  const handleTxSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      const endpoint = txType === 'add' ? `/savings/${selectedGoal.id}/add` : `/savings/${selectedGoal.id}/withdraw`;
      await api.post(endpoint, { amount: parseFloat(amount) });
      setIsTxModalOpen(false);
      setAmount('');
      fetchGoals();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      alert(apiErr.response?.data?.detail || 'Transaction failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this savings goal?')) return;
    try {
      await api.delete(`/savings/${id}`);
      fetchGoals();
    } catch {
      alert('Failed to delete goal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Savings Goals</h1>
          <p className="text-xs text-slate-400 mt-1">Set target reserves for emergency funds, vacations, or equipment</p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="glass-card-hover flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm">{goal.title}</h3>
                    <p className="text-[11px] text-slate-400">{goal.days_remaining} days remaining</p>
                  </div>
                </div>
                <Badge variant={goal.status === 'completed' ? 'success' : 'info'}>
                  {goal.status}
                </Badge>
              </div>

              <div className="mt-4 mb-2">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-2xl font-bold text-purple-300">
                    ₹{goal.current_amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400">
                    Target: ₹{goal.target_amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${Math.min(100, goal.percentage_completed)}%` }}
                  ></div>
                </div>
                <div className="text-right text-[11px] text-purple-400 mt-1 font-semibold">
                  {goal.percentage_completed.toFixed(1)}% achieved
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setTxType('add');
                    setIsTxModalOpen(true);
                  }}
                  size="sm"
                  variant="secondary"
                  className="gap-1 text-xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deposit</span>
                </Button>

                <Button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setTxType('withdraw');
                    setIsTxModalOpen(true);
                  }}
                  size="sm"
                  variant="secondary"
                  className="gap-1 text-xs"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
                  <span>Withdraw</span>
                </Button>
              </div>

              <button
                onClick={() => handleDelete(goal.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Goal Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Savings Goal">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Title"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="New Laptop / Emergency Fund..."
            required
          />
          <Input
            label="Target Amount (₹)"
            type="number"
            value={newGoal.target_amount}
            onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
            placeholder="100000"
            required
          />
          <Input
            label="Target Date"
            type="date"
            value={newGoal.target_date}
            onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
            required
          />
          <Button type="submit" className="w-full mt-2">Create Goal</Button>
        </form>
      </Modal>

      {/* Deposit / Withdraw Modal */}
      <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title={`${txType === 'add' ? 'Deposit to' : 'Withdraw from'} ${selectedGoal?.title}`}>
        <form onSubmit={handleTxSubmit} className="space-y-4">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000.00"
            required
          />
          <Button type="submit" className="w-full mt-2">
            Confirm {txType === 'add' ? 'Deposit' : 'Withdrawal'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
