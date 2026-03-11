import { useQuery } from '@tanstack/react-query';
import type { Paste } from '@pastebin/shared';


export function useSearchPaste(keyword: string) {
    return useQuery<Paste>({
        queryKey: ['searchPaste', keyword],
        queryFn: async () => {
            const params = { keyword };
            const queryString = new URLSearchParams(params).toString();

            const response = await fetch(
                `http://localhost:${import.meta.env.VITE_API_PORT}/api/search?${queryString}`);
            if (!response.ok) {
                if (response.status === 400) throw new Error('Keyword is required');
                throw new Error('Failed to fetch paste');
            }

            return response.json();
        },
        staleTime: 1000 * 60 * 5,
    });
}