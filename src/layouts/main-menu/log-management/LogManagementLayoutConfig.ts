import { type ILayoutConfig } from "@/providers";

// Defining the layout configuration specific to PricePlan layout
const LogManagementLayoutConfig: ILayoutConfig = {
  name: "LogManagement-Layout", // Unique name identifier for this layout
  options: {
    header: {
      stickyOffset: 200, // Offset value (in pixels) that determines when the header becomes sticky on scroll
    },
  },
};

export { LogManagementLayoutConfig };
