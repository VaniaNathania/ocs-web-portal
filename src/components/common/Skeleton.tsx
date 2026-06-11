interface SkeletonProps {
  title: string;
}

const Skeleton = ({ title }: SkeletonProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="flex w-full space-x-4 animate-pulse">
        <div className="flex-1 py-1 space-y-4">
          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-gray-500">{title}...</p>
    </div>
  );
};

export default Skeleton;
