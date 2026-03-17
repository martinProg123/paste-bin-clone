import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreatePaste } from './use-create-paste';
import type { ReactNode } from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCreatePaste', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('import.meta', { env: { VITE_API_PORT: '4614' } });
    
    vi.mock('@tanstack/react-router', () => ({
      useNavigate: () => vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should create a paste successfully', async () => {
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

    const { result } = renderHook(() => useCreatePaste(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: 'Test Paste',
      content: 'Test content',
      visibility: 'public',
      expiresAt: 'n',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/createPaste'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Paste',
          content: 'Test content',
          visibility: 'public',
          expiresAt: 'n',
        }),
      })
    );
  });

  it('should handle error when API returns non-OK', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid input' }),
    });

    const { result } = renderHook(() => useCreatePaste(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: '',
      content: '',
      visibility: 'public',
      expiresAt: 'n',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    
    expect(result.current.error).toBeDefined();
  });
});
