import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { useViewPaste } from '../hooks/use-view-paste';
import { ViewPasteSchema } from '@pastebin/shared';
import { useEffect, useRef, useState } from 'react';

function ViewSlug() {
  const { slug } = Route.useParams();
  const [password, setPassword] = useState('');
  const [submittedPassword, setSubmittedPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);
  
  const { data: pasteObj, isLoading, isFetching, isError, error, refetch } = useViewPaste(
    slug, 
    submittedPassword || undefined,
    hasAttemptedAuth
  );
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setPasswordError('Please enter a password');
      return;
    }
    setPasswordError('');
    setSubmittedPassword(password);
    setHasAttemptedAuth(true);
    refetch();
  };

  useEffect(() => {
    if (isError) {
      const errorMessage = error.message;
      if (errorMessage === 'Password required' || errorMessage === 'Invalid password') {
        setShowPasswordModal(true);
      }
    }
  }, [isError, error]);

  const showModal = showPasswordModal && (isError || !pasteObj);
  const isInitialLoading = isLoading && !hasAttemptedAuth;
  const isRetrying = isFetching && hasAttemptedAuth;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handlePasswordSubmit} className="bg-brand-slate p-6 rounded-lg shadow-xl border border-brand-border">
            <h3 className="text-lg font-bold mb-4">Password Required</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-4 bg-brand-deep border border-brand-border rounded"
              placeholder="Enter password"
              autoFocus
              disabled={isRetrying}
            />
            {passwordError && <p className="text-red-500 mb-4">{passwordError}</p>}
            {isError && hasAttemptedAuth && (
              <p className="text-red-500 mb-4">{error.message}</p>
            )}
            <button
              type="submit"
              className="w-full bg-brand-green hover:bg-brand-green-hover text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={isRetrying}
            >
              {isRetrying ? 'Verifying...' : 'Submit'}
            </button>
          </form>
        </div>
      )}

      {isError && !showModal && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded text-red-400">
          {error.message}
        </div>
      )}

      {!pasteObj && !showModal && !isInitialLoading && !isError && (
        <div className="p-4 text-gray-400">Paste not found</div>
      )}

      {pasteObj && (
        <>
          <div>
            <h1 className="text-2xl font-bold">{pasteObj.title || 'Untitled Paste'}</h1>

            <div className="mt-2 text-sm text-gray-500">
              ID: {pasteObj.slug}
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              Visibility: {pasteObj.visibility.toUpperCase()} | Created: {new Date(pasteObj.createdAt).toLocaleString()}
              | Expired: {pasteObj.expiresAt ? new Date(pasteObj.expiresAt).toLocaleString() : 'Never'}
            </div>

          </div>

          <div className=' border border-brand-border bg-brand-slate rounded p-2 '>
            <div className='flex justify-between mb-3'>
              <div className='text-sm px-2 font-sans my-auto '>{(new TextEncoder().encode(pasteObj.content).length / 1024).toFixed(2)} kb / 500 kb</div>
              <div className='flex gap-2 text-brand-green'>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(pasteObj.content);
                      if (timerRef.current) clearTimeout(timerRef.current);
                      setCopied(true);
                      timerRef.current = setTimeout(() => setCopied(false), 2000);
                    } catch (err) {
                      console.error('Failed to copy text: ', err);
                    }
                  }}
                  className='cursor-pointer rounded-md bg-brand-deep px-3 py-1 hover:text-brand-text-muted'>
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                <button
                  className='cursor-pointer rounded-md bg-brand-deep px-3 py-1 hover:text-brand-text-muted'
                  onClick={() => {
                    const blob = new Blob([pasteObj.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${pasteObj.title || 'paste'}.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download
                </button>
              </div>
            </div>

            <hr className='border border-brand-border ' />

            <div>
              <pre className="mt-4 p-4  hover:bg-[#262729] text-white rounded font-paste whitespace-pre-wrap break-all ">
                {pasteObj.content}
              </pre>
            </div>
          </div>
        </>
      )}

    </div>
  )
}

const PasteErrorState = ({ error }: ErrorComponentProps) => {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">Oops! Something went wrong.</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <a href="/" className="mt-4 inline-block text-blue-500 underline">
        Go back home
      </a>
    </div>
  );
}

export const Route = createFileRoute('/pastes/$slug')({
  component: ViewSlug,
  errorComponent: PasteErrorState, // Define the UI for errors
  loader: ({ params }) => {
    // Basic validation before fetching
    const check = ViewPasteSchema.safeParse(params);
    if (!check.success) {
      throw new Error("Invalid URL format");
    }
    return { slug: params.slug };
  },
})