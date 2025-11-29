import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  paymentTerms?: string;
  createdAt: string;
}

interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  paymentTerms?: string;
}

export const useCustomers = (businessId?: string, search?: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', businessId, search],
    queryFn: async () => {
      if (!businessId) return { customers: [], pagination: { total: 0 } };
      const params = search ? { search } : {};
      const response = await api.get(`/businesses/${businessId}/customers`, {
        params,
      });
      return response.data.data;
    },
    enabled: !!businessId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.post(
        `/businesses/${businessId}/customers`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCustomerData>;
    }) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.patch(
        `/businesses/${businessId}/customers/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!businessId) throw new Error('Business ID required');
      await api.delete(`/businesses/${businessId}/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', businessId] });
    },
  });

  return {
    customers: data?.customers || [],
    total: data?.pagination?.total || 0,
    isLoading,
    error,
    createCustomer: createMutation.mutate,
    updateCustomer: updateMutation.mutate,
    deleteCustomer: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
