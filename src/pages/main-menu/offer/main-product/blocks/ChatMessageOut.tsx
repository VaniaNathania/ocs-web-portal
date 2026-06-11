import { toAbsoluteUrl } from '@/utils';
import { KeenIcon } from '@/components';
import clsx from 'clsx';

interface IChatMessageOutProps {
  text: string;
  time: string;
}

const ChatMessageOut = ({ text, time }: IChatMessageOutProps) => {
  return (
    <div className="flex items-end justify-end gap-3.5 px-5">
      <div className="flex flex-col gap-1.5">
        <div
          className="card shadow-none flex bg-primary text-primary-inverse text-2sm font-medium flex-col gap-2.5 p-3 rounded-be-none"
          dangerouslySetInnerHTML={{ __html: text }}
        />

        <div className="flex items-center justify-end relative">
          <span className="text-2xs font-medium text-gray-600 me-6">{time}</span>
        </div>
      </div>
    </div>
  );
};

export { ChatMessageOut, type IChatMessageOutProps };
