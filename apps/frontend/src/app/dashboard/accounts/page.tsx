'use client';

import { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useBusinessStore } from '@/hooks/useBusiness';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const accountTypes = [
  { value: 'CHECKING', label: 'Checking Account' },
  { value: 'SAVINGS', label: 'Savings Account' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'ASSET', label: 'Asset' },
  { value: 'LIABILITY', label: 'Liability' },
];

export default function AccountsPage() {
  const { currentBusiness } = useBusinessStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CHECKING',
    institution: '',
    number: '',
    balance: 0,
  });

  const { accounts, isLoading, createAccount, isCreating } = useAccounts(
    currentBusiness?.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({
          name: '',
          type: 'CHECKING',
          institution: '',
          number: '',
          balance: 0,
        });
      },
    });
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as const,
    },
    {
      header: 'Type',
      accessor: (row: any) => (
        <span className="capitalize">{row.type.toLowerCase().replace('_', ' ')}</span>
      ),
    },
    {
      header: 'Institution',
      accessor: 'institution' as const,
    },
    {
      header: 'Balance',
      accessor: (row: any) => (
        <span className="font-semibold">
          {formatCurrency(parseFloat(row.balance), row.currency)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  if (!currentBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a business first</p>
        <Button
          className="mt-4"
          onClick={() => (window.location.href = '/dashboard')}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const totalBalance = accounts.reduce(
    (sum, account: any) => sum + parseFloat(account.balance),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">
            Manage your business bank accounts and balances
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Balance</p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Wallet className="w-12 h-12 text-primary-600 opacity-20" />
        </div>
      </Card>

      <Card>
        <Table
          data={accounts}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No accounts found. Add your first account to start tracking finances."
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Account"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Account Name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            helperText="e.g., Business Checking, Savings Account"
          />

          <Select
            label="Account Type"
            required
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            options={accountTypes}
          />

          <Input
            label="Institution"
            value={formData.institution}
            onChange={(e) =>
              setFormData({ ...formData, institution: e.target.value })
            }
            helperText="Bank or financial institution name"
          />

          <Input
            label="Account Number (last 4 digits)"
            value={formData.number}
            onChange={(e) =>
              setFormData({ ...formData, number: e.target.value })
            }
            maxLength={4}
            helperText="For reference only, last 4 digits"
          />

          <Input
            label="Initial Balance"
            type="number"
            step="0.01"
            value={formData.balance}
            onChange={(e) =>
              setFormData({ ...formData, balance: parseFloat(e.target.value) })
            }
            helperText="Starting balance for this account"
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
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
