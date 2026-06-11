import { motion } from "framer-motion";
import { toAbsoluteUrl } from "@/utils";

const ScreenLoader = ({ bg = "bg-light" }) => {
  return (
    <motion.div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 ${bg}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.img
        className="h-[30px] max-w-none"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      />

      <motion.div
        className="text-gray-500 font-medium text-sm"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        Loading...
      </motion.div>
    </motion.div>
  );
};

export { ScreenLoader };
