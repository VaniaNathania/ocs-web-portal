interface ChannelContactList {
  contactChannelId: number;
  contactChannelName: string;
  contactChannelCode: string;
  spId: number;
  comments: string;
  channelType: number;
  channelTypeName: string;
  systemReserve: string;
}
interface ChannelContactPayloadFromTypes {
  contactChannelId: number;
  contactChannelName: string;
  contactChannelCode: string;
  spId: number;
  comments: string;
  channelType: number;
  channelTypeName: string;
}

interface ChannelType {
  channelType: number;
  channelTypeName: string;
  comments: string;
}
