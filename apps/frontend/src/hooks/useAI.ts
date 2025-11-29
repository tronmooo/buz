import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useAISummary = (businessId?: string) =>
  useQuery({
    queryKey: ['ai-summary', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const response = await api.get(`/businesses/${businessId}/ai/summary`);
      return response.data.data;
    },
    enabled: !!businessId,
  });

export const useAIInsights = (businessId?: string) =>
  useQuery({
    queryKey: ['ai-insights', businessId],
    queryFn: async () => {
      if (!businessId) return { insights: [] };
      const response = await api.get(`/businesses/${businessId}/ai/insights`);
      return response.data.data;
    },
    enabled: !!businessId,
  });

export const useAIAsk = (businessId?: string) =>
  useMutation({
    mutationFn: async (question: string) => {
      if (!businessId) throw new Error('No business selected');
      const response = await api.post(`/businesses/${businessId}/ai/ask`, {
        question,
      });
      return response.data.data;
    },
  });
