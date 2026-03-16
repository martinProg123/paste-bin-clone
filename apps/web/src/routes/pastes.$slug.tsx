import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { useViewPaste } from '../hooks/use-view-paste';
import { ViewPasteSchema } from '@pastebin/shared';
import { useRef, useState } from 'react';

function ViewSlug() {
  const { slug } = Route.useParams();
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { data: pasteObj, isLoading, isError, error, refetch } = useViewPaste(slug, password || undefined);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    refetch();
  };

  if (isError) {
    const errorMessage = error.message;
    if (errorMessage === 'Password required' || errorMessage === 'Invalid password') {
      setShowPasswordModal(true);
    }
  }

  if (isLoading) return <span>Loading...</span>;
  if (!pasteObj) return null;

  const requiresPassword = pasteObj.visibility === 'private' && pasteObj.passwordHash && !password;

  if (requiresPassword && showPasswordModal === false) {
    setShowPasswordModal(true);
  }

  const pasteSize = (new TextEncoder().encode(pasteObj.content).length / 1024).toFixed(2);

  const handleCopy = async () => {
    try {
      // The Native Browser API
      await navigator.clipboard.writeText(pasteObj.content);
      // 1. Clear any existing timer if the user clicks "Copy" rapidly
      if (timerRef.current) clearTimeout(timerRef.current);

      setCopied(true);

      // 2. Store the new timer ID
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([pasteObj.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${pasteObj.title || 'paste'}.txt`;
    link.click();

    // Clean up the memory
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {showPasswordModal && (
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
            />
            {passwordError && <p className="text-red-500 mb-4">{passwordError}</p>}
            <button
              type="submit"
              className="w-full bg-brand-green hover:bg-brand-green-hover text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </form>
        </div>
      )}

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
          <div className='text-sm px-2 font-sans my-auto '>{pasteSize} kb / 500 kb</div>
          <div className='flex gap-2 text-brand-green'>
            <button
              onClick={handleCopy}
              className='cursor-pointer rounded-md bg-brand-deep px-3 py-1 hover:text-brand-text-muted'>
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              className='cursor-pointer rounded-md bg-brand-deep px-3 py-1 hover:text-brand-text-muted'
              onClick={handleDownload}
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