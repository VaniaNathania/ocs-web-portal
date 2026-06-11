import { Contact } from "lucide-react";
import z from "zod";

export const contactChannelSchema = z.object({
  comments: z.string().min(1, "Comments is required"),
  channelType: z.number().min(1, "Channel Type is required"),
  contactChannelName: z.string().min(1, "Contact Channel Name is required"),
  contactChannelCode: z.string().nullable(),
  systemReserve: z.string().min(1, "System Reserved is required"),
  spId: z.number(),
  contactChannelId: z.number().nullable(),
});

export type ContactChannelPayload = z.infer<typeof contactChannelSchema>;

export const createDefaultContactChannelPayload =
  (): ContactChannelPayload => ({
    comments: "",
    channelType: 0,
    contactChannelName: "",
    contactChannelCode: "",
    systemReserve: "Y",
    spId: 0,
    contactChannelId: null,
  });
