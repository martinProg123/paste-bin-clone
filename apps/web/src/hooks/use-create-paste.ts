import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Paste, Visibility, CreatePasteInput } from '@pastebin/shared';
import { useNavigate } from '@tanstack/react-router'

// type CreatePasteInput = Omit<Paste, 'id' | 'createdAt' | 'updatedAt' | 'slug'>;

export function useCreatePaste() {
    const queryClient = useQueryClient();
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async (newPaste: CreatePasteInput): Promise<Paste> => {
            // API call logic will go here
            const response = await fetch(`http://localhost:${import.meta.env.VITE_API_PORT}/api/createPaste`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPaste),
            });
            return response.json();
        },
        onSuccess: (data) => {
            // Invalidate existing queries to refresh lists if necessary
            queryClient.invalidateQueries({ queryKey: ['createPaste'] });
            console.log('Paste created with slug:', data.slug);

            // For private pastes, store a flag in sessionStorage to allow immediate viewing
            if (data.visibility === 'private' && data.passwordHash) {
                sessionStorage.setItem(`paste_auth_${data.slug}`, 'true');
            }

            // Manually seed the cache for the individual paste query
            queryClient.setQueryData(['viewPaste', data.slug], data);
            // Redirect using only the slug
            navigate({ to: '/pastes/$slug', params: { slug: data.slug } });
        },
        onError: (error) => {
            console.error('Failed to create paste:', error);
        },
    });
}