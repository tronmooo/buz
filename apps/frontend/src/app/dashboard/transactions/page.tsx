'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useBusinessStore } from '@/hooks/useBusiness';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { CreditCard, Plus, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function TransactionsPage() {
  const { currentBusiness } = useBusinessStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE' | 'TRANSFER',
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const { transactions, isLoading, createTransaction, isCreating } = useTransactions(
    currentBusiness?.id
  );
  const { accounts } = useAccounts(currentBusiness?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTransaction(
      {
        ...formData,
        date: new Date(formData.date).toISOString(),
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({
            accountId: '',
            type: 'INCOME',
            amount: 0,
            description: '',
            category: '',
            date: new Date().toISOString().split('T')[0],
          });
        },
      }
    );
  };

  const accountOptions = [
    { value: '', label: 'Select an account' },
    ...accounts.map((a: any) => ({ value: a.id, label: `${a.name} (${a.type})` })),
  ];

  const typeOptions = [
    { value: 'INCOME', label: 'Income' },
    { value: 'EXPENSE', label: 'Expense' },
    { value: 'TRANSFER', label: 'Transfer' },
  ];

  const transactionColumns = [
    {
      header: 'Date',
      accessor: (row: any) => new Date(row.date).toLocaleDateString(),
    },
    {
      header: 'Type',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {row.type === 'INCOME' ? (
            <ArrowUpCircle className="w-4 h-4 text-green-600" />
          ) : (
            <ArrowDownCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="capitalize">{row.type.toLowerCase()}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description' as const,
    },
    {
      header: 'Category',
      accessor: 'category' as const,
    },
    {
      header: 'Account',
      accessor: (row: any) => row.account?.name || 'N/A',
    },
    {
      header: 'Amount',
      accessor: (row: any) => (
        <span
          className={`font-semibold ${
            row.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {row.type === 'INCOME' ? '+' : '-'}
          {formatCurrency(parseFloat(row.amount))}
        </span>
      ),
    },
  ];

  if (!currentBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a business first</p>
        <Button className="mt-4" onClick={() => (window.location.href = '/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Calculate stats
  const now = new Date();
  const thisMonth = transactions.filter((t: any) => {
    const date = new Date(t.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const income = thisMonth
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum, t: any) => sum + parseFloat(t.amount), 0);

  const expenses = thisMonth
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum, t: any) => sum + parseFloat(t.amount), 0);

  const netCashFlow = income - expenses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">
            Track all financial transactions
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {formatCurrency(income)}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                {formatCurrency(expenses)}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-600 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Cash Flow</p>
              <p className={`text-2xl font-bold mt-1 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netCashFlow)}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <CreditCard className="w-10 h-10 text-primary-600 opacity-20" />
          </div>
        </Card>
      </div>

      <Card>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start tracking your income and expenses
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Transaction
            </Button>
          </div>
        ) : (
          <Table
            data={transactions}
            columns={transactionColumns}
            isLoading={isLoading}
          />
        )}
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Transaction"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Account"
            required
            value={formData.accountId}
            onChange={(e) =>
              setFormData({ ...formData, accountId: e.target.value })
            }
            options={accountOptions}
          />

          <Select
            label="Transaction Type"
            required
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            options={typeOptions}
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) })
            }
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            helperText="What was this transaction for?"
          />

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            helperText="e.g., Payroll, Office Supplies, Sales"
          />

          <Input
            label="Date"
            type="date"
            required
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Add Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
