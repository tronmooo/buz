import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  number: string;
  customerId: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: LineItem[];
  notes?: string;
  customer: {
    id: string;
    name: string;
    email?: string;
  };
}

interface CreateInvoiceData {
  customerId: string;
  number: string;
  issueDate: string;
  dueDate: string;
  items: LineItem[];
  tax: number;
  notes?: string;
}

export const useInvoices = (businessId?: string, status?: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices', businessId, status],
    queryFn: async () => {
      if (!businessId) return { invoices: [], pagination: { total: 0 } };
      const params = status ? { status } : {};
      const response = await api.get(`/businesses/${businessId}/invoices`, {
        params,
      });
      return response.data.data;
    },
    enabled: !!businessId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.post(
        `/businesses/${businessId}/invoices`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', businessId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateInvoiceData>;
    }) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.patch(
        `/businesses/${businessId}/invoices/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', businessId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!businessId) throw new Error('Business ID required');
      await api.delete(`/businesses/${businessId}/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', businessId] });
    },
  });

  return {
    invoices: data?.invoices || [],
    total: data?.pagination?.total || 0,
    isLoading,
    error,
    createInvoice: createMutation.mutate,
    updateInvoice: updateMutation.mutate,
    deleteInvoice: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
