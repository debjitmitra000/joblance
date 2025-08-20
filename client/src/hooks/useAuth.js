import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/utils/api";

export function useAuth() {
  const token = getAuthToken();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!token,
    retry: false,
  });

  return {
    user,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user && !!token,
    error
  };
}
