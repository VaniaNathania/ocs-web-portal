import { toAbsoluteUrl } from '@/utils';
import { useMemo, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import moment from 'moment';

interface IDropdownNotificationsItemProps {
  userName: string;
  avatar: string;
  description: string;
  time: string;
  text: string;
  company: string;
}

const View = ({
  userName,
  avatar,
  description,
  time,
  text,
  company
}: IDropdownNotificationsItemProps) => {
  const [emailInput, setEmailInput] = useState('');
  return (
    <div className="flex grow gap-2.5">
      <div className="relative shrink-0 mt-0.5">
        <img className="h-[20px] max-w-none" src={toAbsoluteUrl(avatar)} alt="logo" />
      </div>

      <div className="flex flex-col gap-1 w-full">
        <div className="flex flex-col gap-1">
          <div className="text-2sm font-medium flex justify-between">
            <p className="text-gray-900 font-semibold">{userName}</p>
            <span className="text-gray-700"> {description} </span>
            <span className="flex items-center text-2xs font-medium text-gray-500">{time}</span>
          </div>
        </div>
        <div
          className="card shadow-none flex flex-col gap-2.5 p-3.5 rounded-lg bg-light-active"
          style={{ borderColor: company == 'BRI' ? '#02529c' : '' }}
        >
          <div className="text-2sm font-semibold text-gray-600 mb-px">
            <span className="text-gray-700 font-medium"> {text} </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const transformRequestData = (data: any) => {
  if (!data) return null;

  const chat = [
    {
      created_at: data.spv_approved_at,
      message: data.spv_approved_note,
      name: data.spv_approved_by
    },
    {
      created_at: data.ga_approved_at,
      message: data.ga_approved_note,
      name: data.ga_approved_by
    },
    {
      created_at: data.gm_approved_at,
      message: data.gm_approved_note,
      name: data.gm_approved_by
    }
  ].filter((msg) => msg.created_at && msg.name);

  return {
    ...data,
    chat
  };
};

const Notes = ({ data, newChat, setNewChat, setData }: any) => {
  const transformedData = useMemo(() => transformRequestData(data), [data]);
  return (
    <div className=" card shadow-none border-0 w-full ">
      <div className="card-body p-3 pl-10 pr-10">
        <p className="card-title text-[14px]">History</p>
        <hr className="my-2 border-dashed border-gray-300" />
        <div className="flex flex-col gap-5 py-5">
          {transformedData?.chat?.length ? (
            transformedData.chat
              .sort(
                (a: any, b: any) =>
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
              .map((message: any, index: number) => (
                <View
                  key={`CHATS++${index}`}
                  userName={message.name}
                  avatar={
                    message.company === 'BRI'
                      ? '/media/app/mini-logo.svg'
                      : '/media/avatars/blank.png'
                  }
                  description=""
                  time={moment(message.created_at).format('ddd DD MMM, hh.mm A')}
                  text={message.message}
                  company={message.company}
                />
              ))
          ) : (
            <p className="text-[14px]">No note's available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export { Notes };
