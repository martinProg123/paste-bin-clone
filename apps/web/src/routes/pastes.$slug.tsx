import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { useViewPaste } from '../hooks/use-view-paste';
import { ViewPasteSchema } from '@pastebin/shared';
import { useRef, useState } from 'react';

function ViewSlug() {
  const { slug } = Route.useParams();
  const { data: pasteObj, isLoading, isError, error } = useViewPaste(slug);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (isLoading) return <span>Loading...</span>;
  if (isError) return <span>Error: {error.message}</span>;
  if (!pasteObj) return null;
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
      <div>
        <h1 className="text-2xl font-bold">{pasteObj.title || 'Untitled Paste'}</h1>

        <div className="mt-2 text-sm text-gray-500">
          Visibility: {pasteObj.visibility.toUpperCase()} | Created: {new Date(pasteObj.createdAt).toLocaleString()}
          | Expired: {pasteObj.expiresAt ? new Date(pasteObj.expiresAt).toLocaleString() : 'Never'}
        </div>
      </div>

      <div className=' border border-brand-border bg-brand-slate rounded p-2 '>
        <div className='flex justify-between mb-3'>
          <div className='text-sm  px-1 py-3 font-sans'>{pasteSize} kb / 500 kb</div>
          <div className='flex gap-2 text-brand-green'>
            <button
              onClick={handleCopy}
              className='cursor-pointer rounded-md bg-brand-deep px-3 py-1 hover:text-brand-text-muted'>
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              className=''
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