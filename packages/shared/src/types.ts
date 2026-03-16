export type Visibility = 'public' | 'private' | 'unlisted';
// export type CreatePasteInput = Omit<Paste, 'id' | 'createdAt' | 'updatedAt' | 'slug'>;


export interface Paste {
    id: number;
    slug: string;
    title: string;
    content: string | null;
    visibility: Visibility;
    passwordHash: string | null;
    passwordError?: boolean;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
}

export interface PasteError {
    message: string;
    requiresPassword?: boolean;
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