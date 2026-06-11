export const Loading = () => {
  return (
    <div className="absolute ease-in-out transition-all inset-0 bg-base-100/50 flex items-center justify-center z-40 space-x-2 w-full h-full m-auto  backdrop-blur-sm">
      <div className="w-fit h-fit bg-white gap-2 flex shadow-md p-2 text-sm rounded-md">
        <div className="border-t-3 border-l-3 border-b-2 border-r-2  border-t-gray-600 border-spacing-9 rounded-full animate-spin w-[20px] h-[20px]"></div>
        <div>loading...</div>
      </div>
    </div>
  );
};
