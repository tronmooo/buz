import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const useAuth = () => {
  const router = useRouter();
  const { setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post('/auth/register', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push('/dashboard');
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post('/auth/login', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      clearAuth();
      router.push('/auth/login');
    },
  });

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    },
    enabled: isAuthenticated(),
    retry: false,
  });

  return {
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading:
      registerMutation.isPending ||
      loginMutation.isPending ||
      logoutMutation.isPending ||
      isLoadingUser,
    error:
      registerMutation.error || loginMutation.error || logoutMutation.error,
    currentUser,
    isAuthenticated: isAuthenticated(),
  };
};
