import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <div className='min-h-screen bg-brand-black text-brand-text-primary font-sans selection:bg-brand-green selection:text-black caret-brand-green '>
      <nav className="p-4 flex gap-4 text-white">
        <Link to="/" className="[&.active]:font-bold   hover:text-brand-green ">Create</Link>
        <Link to="/search" className="[&.active]:font-bold hover:text-brand-green ">Search</Link>
        {/* <Link to="/login" className="[&.active]:font-bold">Login</Link> */}
      </nav>
      <hr className='border-brand-border' />
      <main className="p-4">
        <Outlet /> {/* This is where your sub-pages render */}
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});