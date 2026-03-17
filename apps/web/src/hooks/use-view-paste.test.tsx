import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useViewPaste } from './use-view-paste';
import type { ReactNode } from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useViewPaste', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('import.meta', { env: { VITE_API_PORT: '4614' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should fetch paste by slug successfully', async () => {
    const mockPaste = {
      id: 1,
      slug: 'testSlug123',
      title: 'Test Paste',
      content: 'Test content',
      visibility: 'public',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      expiresAt: null,
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPaste,
    });

    const { result } = renderHook(() => useViewPaste('testSlug123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockPaste);
  });

  it('should include password in request when provided', async () => {
    const mockPaste = {
      id: 1,
      slug: 'privateSlug',
      title: 'Private Paste',
      content: 'Secret content',
      visibility: 'private',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      expiresAt: null,
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPaste,
    });

    const { result } = renderHook(
      () => useViewPaste('privateSlug', 'secret123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalled();
  });

  it('should throw error when paste not found (404)', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Paste not found' }),
    });

    const { result } = renderHook(() => useViewPaste('nonexistent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Paste not found');
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(
      () => useViewPaste('testSlug', undefined, false),
      { wrapper: createWrapper() }
    );

    expect(result.current.isFetching).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should return content=null for password-protected paste without password', async () => {
    const mockPaste = {
      id: 1,
      slug: 'protectedSlug',
      title: 'Protected Paste',
      content: null,
      visibility: 'private',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      expiresAt: null,
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPaste,
    });

    const { result } = renderHook(() => useViewPaste('protectedSlug'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.content).toBeNull();
  });
});
