'use client';

import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBusinessStore } from '@/hooks/useBusiness';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Users2 } from 'lucide-react';

export default function CustomersPage() {
  const { currentBusiness } = useBusinessStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    taxId: '',
    paymentTerms: '',
  });

  const { customers, isLoading, createCustomer, isCreating } = useCustomers(
    currentBusiness?.id,
    search
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          taxId: '',
          paymentTerms: '',
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
      header: 'Email',
      accessor: 'email' as const,
    },
    {
      header: 'Phone',
      accessor: 'phone' as const,
    },
    {
      header: 'Payment Terms',
      accessor: 'paymentTerms' as const,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage customers and their billing information
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <Table
          data={customers}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No customers found. Create your first customer to get started."
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Customer"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer Name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <Input
            label="Tax ID"
            value={formData.taxId}
            onChange={(e) =>
              setFormData({ ...formData, taxId: e.target.value })
            }
            helperText="VAT, EIN, or other tax identification number"
          />

          <Input
            label="Payment Terms"
            value={formData.paymentTerms}
            onChange={(e) =>
              setFormData({ ...formData, paymentTerms: e.target.value })
            }
            helperText="e.g., Net 30, Net 60, Due on Receipt"
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
              Create Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
