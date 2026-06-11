import { toAbsoluteUrl } from "@/utils";

const LoaderTransparant = ({ bg = "bg-light" }) => {
  return (
    <div
      className={`flex flex-col items-center gap-2 justify-center fixed inset-0 z-50 transition-opacity bg-slate-400/50 duration-700 ease-in-out ${bg}`}
    >
      <img
        className="h-[30px] max-w-none"
        src={toAbsoluteUrl("/media/app/mini-logo.svg")}
        alt="logo"
      />
      <div className="text-gray-500 font-medium text-sm">Loading...</div>
    </div>
  );
};

export { LoaderTransparant };
