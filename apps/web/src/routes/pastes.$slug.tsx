import { createFileRoute } from '@tanstack/react-router'
import type {  ErrorComponentProps } from '@tanstack/react-router'
import { useViewPaste } from '../hooks/use-view-paste';
import { ViewPasteSchema } from '@pastebin/shared';

function ViewSlug() {
  const { slug } = Route.useParams();
  const { data: pasteObj, isLoading, isError, error  } = useViewPaste(slug);

  if (isLoading) return <span>Loading...</span>;
  if (isError) return <span>Error: {error.message}</span>;
  if (!pasteObj) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{pasteObj.title || 'Untitled Paste'}</h1>
      <pre className="mt-4 p-4 bg-gray-900 text-white rounded">
        <code>{pasteObj.content}</code>
      </pre>
      <div className="mt-2 text-sm text-gray-500">
        Visibility: {pasteObj.visibility} | Created: {new Date(pasteObj.createdAt).toLocaleString()}
      </div>
    </div>
  )
}

const PasteErrorState = ({ error }: ErrorComponentProps)=> {
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