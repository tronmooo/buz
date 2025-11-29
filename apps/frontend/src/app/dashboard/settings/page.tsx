'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBusinessStore } from '@/hooks/useBusiness';
import { useState } from 'react';

export default function SettingsPage() {
  const { currentBusiness } = useBusinessStore();
  const [businessName, setBusinessName] = useState(currentBusiness?.name || '');

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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your business settings and preferences
        </p>
      </div>

      <Card title="Business Information">
        <form className="space-y-4">
          <Input
            label="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />

          <Input
            label="Business Email"
            type="email"
            placeholder="contact@business.com"
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 123-4567"
          />

          <Input
            label="Website"
            type="url"
            placeholder="https://www.business.com"
          />

          <div className="pt-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>

      <Card title="Account Settings">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600 mb-3">
              Add an extra layer of security to your account
            </p>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
            <p className="text-sm text-gray-600 mb-3">
              Permanently delete this business and all its data
            </p>
            <Button variant="danger" size="sm">
              Delete Business
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
