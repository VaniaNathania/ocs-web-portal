import { KeenIcon } from "@/components";
import { CheckCircle } from "lucide-react";

interface SuccessBlock {
  custNbr: string | number;
  offerName: string;
  custOrderId?: number;
  orderId?: number;
}

const SuccessBlock = ({
  custNbr,
  offerName,
  custOrderId = 12376699987,
  orderId = 12376699987,
}: SuccessBlock) => {
  return (
    <div className="w-[680px] h-[268px] shadow-md m-auto border-2 border-t-4 border-t-green-500 rounded-md mt-10">
      <div className="h-full w-full border-b-4 border-dotted flex flex-row items-center mx-auto justify-around">
        <div className="flex flex-col items-center font-semibold">
          <CheckCircle
            className="w-16 h-16 text-green-500 mb-4"
            strokeWidth={1.5}
          />
          <div>Order Successfully!</div>
        </div>
        <div className="h-[60%] border-l-2"></div>
        <div className="flex flex-col w-3/5">
          <div className="flex flex-row gap-2">
            <div className="w-1/2">Customer Order Number</div>
            <div className="flex-1">{custOrderId}</div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="w-1/2">{offerName}</div>
            <div className="flex-1">{orderId}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessBlock;
