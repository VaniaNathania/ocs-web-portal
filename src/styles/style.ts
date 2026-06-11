import { HtmlHTMLAttributes } from "react";

const selectedRowHigligt: string = "bg-red-600 p-2 text-white rounded-md";
const selectedRowHighLight: string = "bg-gray-200 hover:bg-gray-200 truncate";
const nonSelectedRowHighLight: string =
  "cursor-pointer bg-white hover:bg-gray-100 truncate";

const verticalLineDivider: string = "h-5 border-r-2 border-slate-400";

export {
  selectedRowHigligt,
  selectedRowHighLight,
  nonSelectedRowHighLight,
  verticalLineDivider,
};
