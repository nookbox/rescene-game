import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <div className='h-full w-full bg-black'>
      <Outlet />
    </div>
  );
}

function NotFound() {
  return (
    <div className='flex h-full w-full items-center justify-center font-retro text-xs text-cyan-300'>
      404 — NOT FOUND
    </div>
  );
}
