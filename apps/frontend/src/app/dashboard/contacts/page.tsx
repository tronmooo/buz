'use client';

import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useBusinessStore } from '@/hooks/useBusiness';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Plus, Search } from 'lucide-react';

export default function ContactsPage() {
  const { currentBusiness } = useBusinessStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
  });

  const { contacts, isLoading, createContact, isCreating } = useContacts(
    currentBusiness?.id,
    search
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContact(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          position: '',
        });
      },
    });
  };

  const columns = [
    {
      header: 'Name',
      accessor: (row: any) => (
        <div>
          <div className="font-medium">
            {row.firstName} {row.lastName}
          </div>
          {row.position && (
            <div className="text-sm text-gray-500">{row.position}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Company',
      accessor: 'company' as const,
    },
    {
      header: 'Email',
      accessor: 'email' as const,
    },
    {
      header: 'Phone',
      accessor: 'phone' as const,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">
            Manage your business contacts and relationships
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <Table
          data={contacts}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No contacts found. Create your first contact to get started."
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Contact"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>

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
            label="Company"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
          />

          <Input
            label="Position"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
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
              Create Contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
