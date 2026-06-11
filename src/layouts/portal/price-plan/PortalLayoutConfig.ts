import { type ILayoutConfig } from "@/providers";

// Defining the layout configuration specific to Portal layout
const PortalLayoutConfig: ILayoutConfig = {
  name: "Portal-layout", // Unique name identifier for this layout
  options: {
    header: {
      stickyOffset: 200, // Offset value (in pixels) that determines when the header becomes sticky on scroll
    },
  },
};

export { PortalLayoutConfig };
