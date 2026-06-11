import Main from "./blocks/main";
import { DetailProvider } from "./hooks/DetailContext";

const Detail = () => {
  return (
    <DetailProvider>
      <Main />
    </DetailProvider>
  );
};

export default Detail;
