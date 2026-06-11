import { type ILayoutConfig } from "@/providers";

// Defining the layout configuration specific to PricePlan layout
export const UserLayoutConfig: ILayoutConfig = {
  name: "User-layout", // Unique name identifier for this layout
  options: {
    header: {
      stickyOffset: 200, // Offset value (in pixels) that determines when the header becomes sticky on scroll
    },
  },
};
