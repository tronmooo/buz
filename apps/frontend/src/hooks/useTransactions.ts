import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Transaction {
  id: string;
  accountId: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  currency: string;
  description?: string;
  category?: string;
  date: string;
  reconciled: boolean;
  account: {
    id: string;
    name: string;
    type: string;
  };
}

interface CreateTransactionData {
  accountId: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  currency?: string;
  description?: string;
  category?: string;
  date: string;
  reconciled?: boolean;
}

export const useTransactions = (
  businessId?: string,
  filters?: {
    accountId?: string;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', businessId, filters],
    queryFn: async () => {
      if (!businessId)
        return { transactions: [], pagination: { total: 0 } };
      const response = await api.get(
        `/businesses/${businessId}/transactions`,
        {
          params: filters,
        }
      );
      return response.data.data;
    },
    enabled: !!businessId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.post(
        `/businesses/${businessId}/transactions`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', businessId],
      });
      queryClient.invalidateQueries({ queryKey: ['accounts', businessId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateTransactionData>;
    }) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.patch(
        `/businesses/${businessId}/transactions/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', businessId],
      });
      queryClient.invalidateQueries({ queryKey: ['accounts', businessId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!businessId) throw new Error('Business ID required');
      await api.delete(`/businesses/${businessId}/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', businessId],
      });
      queryClient.invalidateQueries({ queryKey: ['accounts', businessId] });
    },
  });

  return {
    transactions: data?.transactions || [],
    total: data?.pagination?.total || 0,
    isLoading,
    error,
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
