import { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Dashboard | Todo App',
  description: 'Manage your tasks',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F9F7F2]">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}