type LoaderProps = {
  title?: string;
};

export const Loader = ({ title = "Loading" }: LoaderProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-b-2 border-red-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-600">{title}...</p>
    </div>
  </div>
);

export const Loading = () => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-2 m-auto space-x-2 text-sm transition-all ease-in-out bg-white rounded-md shadow-md bg-base-100/50 w-fit h-fit">
      <div className="border-t-3 border-l-3 border-b-2 border-r-2  border-t-gray-600 border-spacing-9 rounded-full animate-spin w-[20px] h-[20px]"></div>
      <div>loading...</div>
    </div>
  );
};

export const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="flex flex-col items-center p-8 space-y-4 bg-white shadow-2xl rounded-xl">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">Processing</div>
          <div className="text-sm text-gray-500">Please wait...</div>
        </div>
      </div>
    </div>
  );
};
