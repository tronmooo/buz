import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  createdAt: string;
}

interface CreateContactData {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
}

export const useContacts = (businessId?: string, search?: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['contacts', businessId, search],
    queryFn: async () => {
      if (!businessId) return { contacts: [], pagination: { total: 0 } };
      const params = search ? { search } : {};
      const response = await api.get(
        `/businesses/${businessId}/contacts`,
        { params }
      );
      return response.data.data;
    },
    enabled: !!businessId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateContactData) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.post(
        `/businesses/${businessId}/contacts`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', businessId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateContactData>;
    }) => {
      if (!businessId) throw new Error('Business ID required');
      const response = await api.patch(
        `/businesses/${businessId}/contacts/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', businessId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!businessId) throw new Error('Business ID required');
      await api.delete(`/businesses/${businessId}/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', businessId] });
    },
  });

  return {
    contacts: data?.contacts || [],
    total: data?.pagination?.total || 0,
    isLoading,
    error,
    createContact: createMutation.mutate,
    updateContact: updateMutation.mutate,
    deleteContact: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
