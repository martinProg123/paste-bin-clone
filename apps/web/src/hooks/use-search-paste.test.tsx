import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchPaste } from './use-search-paste';
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

describe('useSearchPaste', () => {
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

  it.skip('should search pastes by keyword', async () => {
    const mockResults = [
      {
        id: 1,
        slug: 'slug1',
        title: 'Test Paste 1',
        content: 'Content 1',
        visibility: 'public',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        expiresAt: null,
      },
      {
        id: 2,
        slug: 'slug2',
        title: 'Test Paste 2',
        content: 'Content 2',
        visibility: 'public',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        expiresAt: null,
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResults,
    });

    const { result } = renderHook(() => useSearchPaste('test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetched).toBe(true));

    expect(mockFetch).toHaveBeenCalled();
  });

  it('should not fetch when keyword is empty', async () => {
    const { result } = renderHook(() => useSearchPaste(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should not fetch when keyword is only whitespace', async () => {
    const { result } = renderHook(() => useSearchPaste('   '), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Keyword is required' }),
    });

    const { result } = renderHook(() => useSearchPaste('test'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
