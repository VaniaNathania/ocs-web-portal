// import { KeenIcon } from "@/components";

interface LoadingProps {
  title?: string;
}

const Loading = ({ title = "Loading" }: LoadingProps) => {
  return (
    <div className="flex items-center justify-center mx-auto transition-all ease-in-out w-fit h-fit">
      <div className="border-2 rounded-lg bg-white p-1 shadow-md">
        {/* <KeenIcon icon="loading" className="animate-spin p-1" /> */}
        <div className="flex flex-row gap-2">
          <div className="border-t-3 border-l-3 border-b-2 border-r-2  border-t-gray-600 border-spacing-9 rounded-full animate-spin w-[20px] h-[20px]"></div>
          <div>{title}...</div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
