import { createFileRoute } from '@tanstack/react-router'
import { useViewPaste } from '../hooks/use-view-paste';

export const Route = createFileRoute('/pastes/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
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
