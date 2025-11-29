'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { useBusinessStore } from '@/hooks/useBusiness';
import { useContacts } from '@/hooks/useContacts';
import { useCustomers } from '@/hooks/useCustomers';
import { Users, Users2, Search, Loader2 } from 'lucide-react';

export default function GlobalSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { currentBusiness } = useBusinessStore();

  const { contacts, isLoading: contactsLoading } = useContacts(
    currentBusiness?.id,
    query || undefined
  );
  const { customers, isLoading: customersLoading } = useCustomers(
    currentBusiness?.id,
    query || undefined
  );

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.replace(`/dashboard/search${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''}`);
  };

  if (!currentBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Select or create a business to search across data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Search</h1>
          <p className="text-gray-600 mt-1">
            Searching within {currentBusiness.name}. Start typing to find contacts and customers.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm"
      >
        <Search className="w-5 h-5 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, company..."
          className="flex-1 text-sm bg-transparent outline-none"
        />
      </form>

      {!query.trim() ? (
        <Card>
          <p className="text-gray-600">Enter a search term to see results.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Contacts" action={<span className="text-sm text-gray-500">{contacts.length} results</span>}>
            {contactsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-gray-600">No contacts match "{query}".</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {contacts.slice(0, 6).map((contact) => (
                  <li key={contact.id} className="py-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName || ''}
                        </p>
                        <p className="text-sm text-gray-600">
                          {contact.email || contact.phone || contact.company || 'No details'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Customers" action={<span className="text-sm text-gray-500">{customers.length} results</span>}>
            {customersLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              </div>
            ) : customers.length === 0 ? (
              <p className="text-sm text-gray-600">No customers match "{query}".</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {customers.slice(0, 6).map((customer) => (
                  <li key={customer.id} className="py-3">
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-600">
                          {customer.email || customer.phone || 'No details'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
