import { type ILayoutConfig } from "@/providers";

// Defining the layout configuration specific to PricePlan layout
const LayoutConfig: ILayoutConfig = {
  name: "layout", // Unique name identifier for this layout
  options: {
    header: {
      stickyOffset: 20, // Offset value (in pixels) that determines when the header becomes sticky on scroll
    },
  },
};

export { LayoutConfig };
