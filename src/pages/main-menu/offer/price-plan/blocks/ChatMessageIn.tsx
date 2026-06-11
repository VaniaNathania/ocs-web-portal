interface IChatMessageInProps {
  text: string;
  time: string;
}

const ChatMessageIn = ({ text, time }: IChatMessageInProps) => {
  return (
    <div className="flex items-end gap-3.5 px-5">
      <div className="flex flex-col gap-1.5">
        <div
          className="card shadow-none flex flex-col bg-gray-100 gap-2.5 p-3 rounded-bl-none text-2sm font-medium text-gray-700"
          dangerouslySetInnerHTML={{ __html: text }}
        />
        <span className="text-2xs font-medium text-gray-500">{time}</span>
      </div>
    </div>
  );
};

export { ChatMessageIn, type IChatMessageInProps };
