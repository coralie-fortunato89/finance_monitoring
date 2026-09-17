import { createFileRoute } from '@tanstack/react-router';
import { DemoTable } from '../components/demo-table';

export const Route = createFileRoute('/demo/table')({
  component: TableDemoPage,
});

function TableDemoPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-4">TanStack Table demo</h1>
      <DemoTable />
    </main>
  );
}
