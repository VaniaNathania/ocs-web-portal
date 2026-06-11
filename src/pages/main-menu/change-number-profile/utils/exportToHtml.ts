// import { AccNbrDetailsProps } from "../hooks/ChangeNumberProfileContext";
// import { columns } from "./headersMap";

// export const generateHtml = (rows: AccNbrDetailsProps[]) => {
//   const thead = `<tr>${columns.map((item) => `<td>${item.header}</td>`).join("")}</tr> `;

//   const tbody = rows
//     .map(
//       (row) => `
//         <tr>
//           ${columns.map((c) => `<td>${c.accessor(row) ?? ""}</td>`).join("")}
//         </tr>
//       `
//     )
//     .join("");

//   return `
// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
//   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
// <html>
// <head>
// <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></meta>
// <title>Number Information</title>
// <style type="text/css">
//   @page {
//     size:1000in 1000in;
//   }
//   #dtTable {
//     border-collapse: collapse;
//     width: 90%;
//   }
//   #dtTable thead td {
//     border: 1px solid #000000;
//     text-align: center;
//     font-weight: bold;
//   }
//   #dtTable tbody td {
//     border: 1px solid #000000;
//     padding-left: 5px;
//   }
// </style>
// </head>

// <body>
//   <table id="dtTable">
//     <thead>
//       ${thead}
//     </thead>
//     <tbody>
//       ${tbody}
//     </tbody>
//   </table>
// </body>
// </html>
// `;
// };

// export const exportToHtml = (data: AccNbrDetailsProps[], fileName: string) => {
//   if (!data || data.length === 0) return;

//   const htmlContent = generateHtml(data);

//   const blob = new Blob([htmlContent], {
//     type: "text/html;charset=utf-8;",
//   });

//   const url = URL.createObjectURL(blob);

//   const link = document.createElement("a");
//   link.href = url;
//   link.download = `${fileName}.html`;
//   link.click();

//   URL.revokeObjectURL(url);
// };
