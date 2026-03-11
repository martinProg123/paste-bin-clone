export type Visibility = 'public' | 'private' | 'unlisted';
// export type CreatePasteInput = Omit<Paste, 'id' | 'createdAt' | 'updatedAt' | 'slug'>;


export interface Paste {
    id: number;
    slug: string;
    title: string;
    content: string;
    visibility: Visibility;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null; // Dates are often strings in JSON transit
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatarUrl: string | null;
    provider: string;
    providerUserId: string;
    createdAt: string;
}