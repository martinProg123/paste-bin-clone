import { useQuery } from '@tanstack/react-query';
import type { Paste } from '@pastebin/shared';


export function useViewPaste(slug: string, password?: string, enabled: boolean = true) {

    return useQuery<Paste>({
        queryKey: ['viewPaste', slug],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (password) params.set('password', password);
            const queryString = params.toString();
            const response = await fetch(
                `http://localhost:${import.meta.env.VITE_API_PORT}/api/viewPaste/${slug}${queryString ? '?' + queryString : ''}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('Paste not found');
                if (response.status === 401) {
                    const data = await response.json();
                    throw new Error(data.message || 'Password required');
                }
                if (response.status === 403) throw new Error('Invalid password');
                throw new Error('Failed to fetch paste');
            }

            return response.json();
        },
        enabled,
        staleTime: 1000 * 60 * 5,
    });
}