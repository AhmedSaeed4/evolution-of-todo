import { Metadata } from 'next';
import { isAuthBypassEnabled } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Auth | Todo App',
  description: 'Authentication for Todo App',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If bypass is enabled, redirect to tasks immediately
  if (isAuthBypassEnabled()) {
    redirect('/tasks');
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}