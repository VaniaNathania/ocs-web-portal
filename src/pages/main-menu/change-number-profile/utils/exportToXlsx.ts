// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { AccNbrDetailsProps } from "../hooks/ChangeNumberProfileContext";
// import { columns } from "./headersMap";

// export const exportToXlsx = (data: AccNbrDetailsProps[], fileName: string) => {
//   if (!data || data.length === 0) return;

//   const formattedData = data.map((row) => {
//     return Object.fromEntries(columns.map((c) => [c.header, c.accessor(row)]));
//   });

//   const worksheet = XLSX.utils.json_to_sheet(formattedData);

//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, "AccNbr");

//   const excelBuffer = XLSX.write(workbook, {
//     bookType: "xlsx",
//     type: "array",
//   });

//   const blob = new Blob([excelBuffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });

//   saveAs(blob, `${fileName}.xlsx`);
// };
