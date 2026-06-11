import EventDetail from "./eventDetail";
import Events from "./events";
import FooterBtn from "./footerBtn";

const Main = () => {
  return (
    <div className="flex flex-col gap-2">
      <Events />
      <EventDetail />
      <FooterBtn />
    </div>
  );
};

export default Main;
