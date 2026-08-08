export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-paper flex min-h-full flex-col">{children}</div>;
}
