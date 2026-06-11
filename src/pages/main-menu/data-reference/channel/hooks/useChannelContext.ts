import { useContext } from "react";
import { ChannelContext } from "./ChannelContext";
// import { ChannelContext } from "./SpanTimeContext";

const useChannelContext = () => {
  const context = useContext(ChannelContext);
  if (!context) throw new Error("useChannelContext must be used within AuthProvider");

  return context;
};

export { useChannelContext };
