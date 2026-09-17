import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

type DemoRow = {
  id: string;
  label: string;
  amount: number;
};

const columnHelper = createColumnHelper<DemoRow>();

const columns = [
  columnHelper.accessor('id', { header: 'ID' }),
  columnHelper.accessor('label', { header: 'Label' }),
  columnHelper.accessor('amount', { header: 'Amount' }),
];

const seed: DemoRow[] = [
  { id: '1', label: 'Example A', amount: 10 },
  { id: '2', label: 'Example B', amount: 25 },
];

export function DemoTable() {
  const [data] = useState(seed);
  const memoColumns = useMemo(() => columns, []);
  const table = useReactTable({
    data,
    columns: memoColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
