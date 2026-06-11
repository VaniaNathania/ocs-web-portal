import { Button } from "@/components/ui/button";
import { useState } from "react";
// import { saveAs } from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
import { useUserManagement } from "../../../hook/useUserManagemet";
import { UserMData } from "../../../hook/UserManagementProvider";

export const UserExportContent = () => {
  const [selected, setSelected] = useState("");
  const { user } = useUserManagement();

  const options = [
    { value: "xlsx", label: "XLSX Document" },
    { value: "html", label: "HTML Document" },
    { value: "csv", label: "CSV Document" },
    { value: "pdf", label: "PDF Document" },
  ];


  //   /** HTML Export **/
  //   const exportHTML = () => {
  //     const headers = Object.keys(user[0]);
  //     const rows:string = user
  //       .map((row) => `<tr>${headers.map((h) => `<td>${row[h]}</td>`).join("")}</tr>`)
  //       .join("");
  //     const html = `
  //       <table border="1">
  //         <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  //         <tbody>${rows}</tbody>
  //       </table>
  //     `;
  //     const blob = new Blob([html], { type: "text/html" });
  //     saveAs(blob, "users.html");
  //   };

  //   /** CSV Export **/
  //   const exportCSV = (user) => {
  //     const headers = Object.keys(user[0]).join(",");
  //     const rows = user.map((row:UserMData) => Object.values(row).join(","));
  //     const csv = [headers, ...rows].join("\n");
  //     const blob = new Blob([csv], { type: "text/csv" });
  //     saveAs(blob, "users.csv");
  //   };

  //   /** PDF Export **/
  //   const exportPDF = (user) => {
  //     const doc = new jsPDF();
  //     const headers = [Object.keys(user[0])];
  //     const rows = data.map((row) => Object.values(row));

  //     autoTable(doc, {
  //       head: headers,
  //       body: rows,
  //     });

  //     doc.save("users.pdf");
  //   };

  //   /** Handle Export Button **/
  //   const handleExport = () => {
  //     if (!selected) {
  //       alert("Please select a format first!");
  //       return;
  //     }
  //     switch (selected) {
  //       case "xlsx":
  //         exportXLSX(MockUserMData);
  //         break;
  //       case "html":
  //         exportHTML(MockUserMData);
  //         break;
  //       case "csv":
  //         exportCSV(MockUserMData);
  //         break;
  //       case "pdf":
  //         exportPDF(MockUserMData);
  //         break;
  //       default:
  //         alert("Unsupported format");
  //     }
  //   };

  return (
    <div className="flex flex-col h-full justify-between mt-5">
      <div className="flex flex-col justify-center items-center h-full">
        <div className="space-y-5">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selected === opt.value}
                onChange={() =>
                  setSelected(selected === opt.value ? "" : opt.value)
                }
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>{opt.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex justify-end space-x-5">
        <Button variant="default" disabled={true}>
          OK
        </Button>
      </div>
    </div>
  );
};
