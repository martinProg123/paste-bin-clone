import { useInfiniteQuery } from '@tanstack/react-query';
import type { Paste } from '@pastebin/shared';


export function useSearchPaste(keyword: string) {
    return useInfiniteQuery<Paste[]>({
        queryKey: ['searchPaste', keyword],
        queryFn: async ({ pageParam }) => {
            const url = new URL(`http://localhost:${import.meta.env.VITE_API_PORT}/api/search`);
            url.searchParams.set('keyword', keyword);
            if (pageParam) url.searchParams.set('cursor', pageParam as string);

            const response = await fetch(url.toString());
            if (!response.ok) {
                if (response.status === 400) {
                    const error = await response.json().catch(() => ({ message: 'Keyword is required' }));
                    throw new Error(error.message || 'Keyword is required');
                }
                throw new Error('Failed to fetch paste');
            }

            return response.json();
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < 10) return undefined
            return lastPage[lastPage.length - 1].createdAt
        },
        enabled: !!keyword.trim(), // Prevents auto-running on mount
        staleTime: 1000 * 60 * 5,
    });
}