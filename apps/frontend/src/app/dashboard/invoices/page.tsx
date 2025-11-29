'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useBusinessStore } from '@/hooks/useBusiness';
import { useInvoices } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function InvoicesPage() {
  const { currentBusiness } = useBusinessStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [formData, setFormData] = useState({
    customerId: '',
    number: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    tax: 0,
    notes: '',
  });

  const { invoices, isLoading, createInvoice, isCreating } = useInvoices(
    currentBusiness?.id
  );
  const { customers } = useCustomers(currentBusiness?.id);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: '', quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    setLineItems(newItems);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + formData.tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice(
      {
        ...formData,
        items: lineItems,
        issueDate: new Date(formData.issueDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({
            customerId: '',
            number: '',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            tax: 0,
            notes: '',
          });
          setLineItems([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
        },
      }
    );
  };

  const customerOptions = [
    { value: '', label: 'Select a customer' },
    ...customers.map((c: any) => ({ value: c.id, label: c.name })),
  ];

  const invoiceColumns = [
    {
      header: 'Invoice #',
      accessor: 'number' as const,
    },
    {
      header: 'Customer',
      accessor: (row: any) => row.customer?.name || 'N/A',
    },
    {
      header: 'Amount',
      accessor: (row: any) => formatCurrency(parseFloat(row.total)),
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.status === 'PAID'
              ? 'bg-green-100 text-green-800'
              : row.status === 'OVERDUE'
              ? 'bg-red-100 text-red-800'
              : row.status === 'SENT'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Due Date',
      accessor: (row: any) =>
        new Date(row.dueDate).toLocaleDateString(),
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

  const stats = invoices.reduce(
    (acc, inv: any) => {
      const amount = parseFloat(inv.total);
      acc.total += amount;
      if (inv.status === 'SENT' || inv.status === 'OVERDUE') {
        acc.outstanding += amount;
      }
      if (inv.status === 'OVERDUE') {
        acc.overdue += amount;
      }
      if (inv.status === 'PAID' && new Date(inv.paidDate).getMonth() === new Date().getMonth()) {
        acc.paidThisMonth += amount;
      }
      return acc;
    },
    { total: 0, outstanding: 0, overdue: 0, paidThisMonth: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">
            Create and manage invoices for your business
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600">Total Invoiced</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(stats.total)}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {formatCurrency(stats.outstanding)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Unpaid invoices</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {formatCurrency(stats.overdue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Past due date</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Paid This Month</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {formatCurrency(stats.paidThisMonth)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Current month</p>
        </Card>
      </div>

      <Card>
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No invoices yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first invoice
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Invoice
            </Button>
          </div>
        ) : (
          <Table
            data={invoices}
            columns={invoiceColumns}
            isLoading={isLoading}
          />
        )}
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Invoice"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Customer"
              required
              value={formData.customerId}
              onChange={(e) =>
                setFormData({ ...formData, customerId: e.target.value })
              }
              options={customerOptions}
            />

            <Input
              label="Invoice Number"
              required
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
              helperText="Unique invoice identifier"
            />

            <Input
              label="Issue Date"
              type="date"
              required
              value={formData.issueDate}
              onChange={(e) =>
                setFormData({ ...formData, issueDate: e.target.value })
              }
            />

            <Input
              label="Due Date"
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Line Items
              </label>
              <Button type="button" size="sm" onClick={addLineItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
              {lineItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(index, 'description', e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(index, 'quantity', parseFloat(e.target.value))
                    }
                    className="w-20"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateLineItem(index, 'unitPrice', parseFloat(e.target.value))
                    }
                    className="w-28"
                  />
                  <div className="w-28 pt-2 text-right font-medium">
                    {formatCurrency(item.amount)}
                  </div>
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax:</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) =>
                      setFormData({ ...formData, tax: parseFloat(e.target.value) })
                    }
                    className="w-32"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              helperText="Additional notes or payment instructions"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
