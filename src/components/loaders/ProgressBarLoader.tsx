import { LinearProgress } from "@mui/material";
import { Loader } from "lucide-react";

const ProgressBarLoader = () => {
  return (
    // <div className="fixed top-0 left-0 right-0 z-[9999]">
    //   <LinearProgress
    //     sx={{
    //       height: "2000px", // Customize the height
    //       opacity: "1",
    //       "& .MuiLinearProgress-bar": {
    //         backgroundColor: "black", // Change the color of the progress bar
    //       },
    //       zIndex: 999,
    //     }}
    //   />
    // </div>
    <div className="w-screen h-screen bg-black"></div>
  );
};

export { ProgressBarLoader };
