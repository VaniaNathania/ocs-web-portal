import { toAbsoluteUrl } from "@/utils";

export interface UnderConstruc {
  desc?: string;
}

const UnderConstruction = ({ desc = "item" }: UnderConstruc) => {
  return (
    <div className="m-auto h-full flex flex-col justify-center text-center">
      <img
        src={toAbsoluteUrl("/media/illustrations/31.svg")}
        className="dark:hidden max-h-[500px]"
        alt="image"
      />
      <img
        src={toAbsoluteUrl("/media/illustrations/31-dark.svg")}
        className="light:hidden max-h-[500px]"
        alt="image"
      />
      <div className="flex flex-col justify-center">
        <div>Opss, {desc} is under construction</div>
        <div className="text-sm opacity-50">
          Please wait for the next updates
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
