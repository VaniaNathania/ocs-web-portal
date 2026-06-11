import React from "react";
import { DataGridEmpty, TDataGridLayoutCellSpacing } from ".";
import { flexRender, HeaderGroup, Row, Cell } from "@tanstack/react-table";
import { useDataGrid } from ".";
import { cn } from "@/utils/cn";

interface DataGridTableProps {
  show?: boolean; // Menambahkan properti 'show' untuk kontrol visibilitas header
}

const DataGridTable = <TData,>({ show = true }: DataGridTableProps) => {
  const { table, props } = useDataGrid();
  const headCellSpacingOptions: Record<TDataGridLayoutCellSpacing, string> = {
    xs: "px-2.5",
    sm: "px-3",
    md: "px-4",
    lg: "px-6",
  };
  const bodyCellSpacingOptions: Record<TDataGridLayoutCellSpacing, string> = {
    xs: "p-2.5",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const headCellSpacing = props.layout?.cellSpacing
    ? headCellSpacingOptions[props.layout?.cellSpacing]
    : headCellSpacingOptions["md"];
  const bodyCellSpacing = props.layout?.cellSpacing
    ? bodyCellSpacingOptions[props.layout?.cellSpacing]
    : bodyCellSpacingOptions["md"];
  const cellBorder = props.layout?.cellBorder ?? false;

  return (
    <table
      className={cn(
        "w-full align-middle text-left rtl:text-right caption-bottom text-sm",
        props.layout?.classes?.table
      )}
      data-table
    >
      {/* Header tabel hanya dirender jika show=true */}
      {show && (
        <thead className="[&_tr]:border-b">
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
            <tr
              key={headerGroup.id}
              className={cn(
                "border-b bg-muted/30 data-[state=selected]:bg-black",
                cellBorder && "[&_>:last-child]:border-e-0"
              )}
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={cn(
                    headCellSpacing,
                    cellBorder && "border-e",
                    "h-12 text-left rtl:text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pe-0",
                    header.column.columnDef.meta?.headerClassName
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
      )}

      {/* Body tabel */}
      <tbody className="[&_tr:last-child]:border-0">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row: Row<TData>) => {
            // Get custom row props if provided
            const customRowProps = props.getRowProps?.(row) || {};

            return (
              <tr
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                {...customRowProps}
                className={cn(
                  "border-b hover:bg-muted/30 data-[state=selected]:bg-muted/50",
                  cellBorder && "[&_>:last-child]:border-e-0",
                  customRowProps.className // Add custom row classes
                )}
                style={customRowProps.style} // Add custom row styles
              >
                {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                  <td
                    data-column-id={cell.id}
                    key={cell.id}
                    className={cn(
                      bodyCellSpacing,
                      cellBorder && "border-e",
                      "align-middle [&:has([role=checkbox])]:pe-0",
                      cell.column.columnDef.meta?.cellClassName
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })
        ) : (
          <DataGridEmpty />
        )}
      </tbody>
    </table>
  );
};

export { DataGridTable };
