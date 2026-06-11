import { toAbsoluteUrl } from '@/utils';

const LoaderContainer = ({ bg = 'bg-white' }) => {
  return (
    <div
      className={`flex flex-col items-center gap-2 justify-center inset-0 z-50 absolute transition-opacity duration-700 ease-in-out ${bg} bg-opacity-30`}
    >
      <img
        className="h-[30px] max-w-none"
        src={toAbsoluteUrl('/media/app/mini-logo.svg')}
        alt="logo"
      />
      <div className="text-gray-500 font-medium text-sm">Loading...</div>
    </div>
  );
};

export { LoaderContainer };
