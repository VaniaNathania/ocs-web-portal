// import { AccNbrDetailsProps } from "../hooks/ChangeNumberProfileContext";
// import { saveAs } from "file-saver";
// import { columns } from "./headersMap";

// export const exportToCsv = (data: AccNbrDetailsProps[], fileName: string) => {
//   if (data.length === 0) return;

//   const headers = columns.map((c) => c.header);
//   const rows = data.map((row) => {
//     const rowValue = columns.map((c) => String(c.accessor(row)).replace(/"/g, '""')).join(",");
//     return `"${rowValue}"`;
//   });

//   const csvContent = [headers, ...rows].join("\n");

//   const blob = new Blob([csvContent], {
//     type: "text/csv;charset=utf-8;",
//   });

//   saveAs(blob, `${fileName}.csv`);
// };
