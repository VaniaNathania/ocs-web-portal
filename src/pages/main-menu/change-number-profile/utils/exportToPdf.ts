// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { AccNbrDetailsProps } from "../hooks/ChangeNumberProfileContext";
// import { columns } from "./headersMap";

// export const exportToPdf = (data: AccNbrDetailsProps[], fileName: string) => {
//   const doc = new jsPDF("l", "mm", "a4");

//   const headers = columns.map((c) => c.header);
//   const body = data.map((row) => columns.map((c) => c.accessor(row)));

//   autoTable(doc, {
//     head: [headers],
//     body,
//     startY: 20,
//     styles: { fontSize: 8 },
//   });

//   doc.save(`${fileName}.pdf`);
// };
