'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessStore } from '@/hooks/useBusiness';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { Building2, Plus, TrendingUp, Users, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { currentBusiness, setCurrentBusiness } = useBusinessStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessSlug, setBusinessSlug] = useState('');
  const queryClient = useQueryClient();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const response = await api.get('/businesses');
      return response.data.data.businesses;
    },
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const response = await api.post('/businesses', data);
      return response.data.data.business;
    },
    onSuccess: (business) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      setCurrentBusiness(business);
      setIsCreateModalOpen(false);
      setBusinessName('');
      setBusinessSlug('');
    },
  });

  useEffect(() => {
    if (businesses && businesses.length > 0 && !currentBusiness) {
      setCurrentBusiness(businesses[0]);
    }
  }, [businesses, currentBusiness, setCurrentBusiness]);

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    createBusinessMutation.mutate({ name: businessName, slug: businessSlug });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {currentUser?.firstName || 'there'}!
        </p>
      </div>

      {/* Business Selector */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Business</h3>
            {currentBusiness ? (
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                <span className="font-medium">{currentBusiness.name}</span>
              </div>
            ) : (
              <p className="text-gray-600">No business selected</p>
            )}
          </div>
          <div className="flex gap-2">
            {businesses && businesses.length > 0 && (
              <select
                value={currentBusiness?.id || ''}
                onChange={(e) => {
                  const business = businesses.find(
                    (b: any) => b.id === e.target.value
                  );
                  if (business) setCurrentBusiness(business);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {businesses.map((business: any) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            )}
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Business
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {currentBusiness && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <Users className="w-10 h-10 text-primary-600 opacity-20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Invoices</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <FileText className="w-10 h-10 text-primary-600 opacity-20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">$0</p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary-600 opacity-20" />
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {!currentBusiness && (
        <Card title="Get Started">
          <p className="text-gray-600 mb-4">
            Create your first business to start managing your operations.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Business
          </Button>
        </Card>
      )}

      {/* Create Business Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Business"
        size="md"
      >
        <form onSubmit={handleCreateBusiness} className="space-y-4">
          <Input
            label="Business Name"
            required
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setBusinessSlug(
                e.target.value.toLowerCase().replace(/\s+/g, '-')
              );
            }}
            helperText="The name of your business"
          />

          <Input
            label="Business Slug"
            required
            value={businessSlug}
            onChange={(e) => setBusinessSlug(e.target.value)}
            helperText="URL-friendly identifier (lowercase, no spaces)"
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createBusinessMutation.isPending}
            >
              Create Business
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
