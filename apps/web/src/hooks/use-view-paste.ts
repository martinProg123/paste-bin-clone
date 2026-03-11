import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Paste, Visibility } from '@pastebin/shared';


export function useViewPaste(slug: string) {

    return useQuery<Paste>({
        queryKey: ['viewPaste', slug],
        queryFn: async () => {
            const params = { slug };
            const queryString = new URLSearchParams(params).toString();
            // API call logic will go here
            const response = await fetch(
                `http://localhost:${import.meta.env.VITE_API_PORT}/api/viewPaste?${queryString}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('Paste not found');
                throw new Error('Failed to fetch paste');
            }

            return response.json();
        },
        // Optional: staleTime ensures it doesn't refetch immediately if data exists
        staleTime: 1000 * 60 * 5,
    });
}