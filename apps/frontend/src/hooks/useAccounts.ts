import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string;
  number?: string;
  isActive: boolean;
  createdAt: string;
}

interface CreateAccountData {
  name: string;
  type: string;
  balance?: number;
  currency?: string;
  institution?: string;
  number?: string;
}

export const useAccounts = (businessId?: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts', businessId],
    queryFn: async () => {
      if (!businessId) return { accounts: [] };
      const response = await api.get(`/businesses/${businessId}/accounts`);
      return response.data.data;
    },
    enabled: !!businessId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateAccountData) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.post(
        `/businesses/${businessId}/accounts`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', businessId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateAccountData>;
    }) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.patch(
        `/businesses/${businessId}/accounts/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', businessId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!businessId) throw new Error('Business ID required');
      await api.delete(`/businesses/${businessId}/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', businessId] });
    },
  });

  return {
    accounts: data?.accounts || [],
    isLoading,
    error,
    createAccount: createMutation.mutate,
    updateAccount: updateMutation.mutate,
    deleteAccount: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
