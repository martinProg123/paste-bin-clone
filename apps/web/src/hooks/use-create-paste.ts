import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Paste, CreatePasteInput } from '@pastebin/shared';
import { useNavigate } from '@tanstack/react-router'

// type CreatePasteInput = Omit<Paste, 'id' | 'createdAt' | 'updatedAt' | 'slug'>;

export function useCreatePaste() {
    const queryClient = useQueryClient();
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async (newPaste: CreatePasteInput): Promise<Paste> => {
            const response = await fetch(`http://localhost:${import.meta.env.VITE_API_PORT}/api/createPaste`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPaste),
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to create paste' }));
                throw new Error(error.message || 'Failed to create paste');
            }
            return response.json();
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['searchPaste'] });
            console.log('Paste created with slug:', data.slug);

            // For private pastes, store password in sessionStorage to allow immediate viewing
            if (data.visibility === 'private' && variables.password) {
                sessionStorage.setItem(`paste_auth_${data.slug}`, variables.password);
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