import { KeenIcon } from "@/components";
import { usePreNew } from "../hooks/context";

const PncStep1 = () => {
  const { form, setForm } = usePreNew();

  return (
    <div
      className={`rounded-md border-2 transition-all duration-300 relative py-2 px-4  overflow-hidden 
                ${form?.actionType === "0" ? "border-primary cursor-default" : "border-slate-200 text-slate-600 cursor-pointer"}`}
      onClick={() => setForm((prev) => (prev = { ...prev, actionType: "0" }))}
    >
      <div className="flex flex-col gap-2">
        <div className="text-xl font-semibold">Pre New Connection</div>
        <div className="">Create subscriber in batch</div>
      </div>
      <div
        className={`bg-primary absolute w-[40px] h-[40px] rotate-45 transition-all duration-300
                    translate-x-1/2 translate-y-1/2 ${form?.actionType === "0" ? "right-0 bottom-0" : "-right-5 -bottom-5"}`}
      >
        <div className="absolute text-white -rotate-45 bottom-2 left-0">
          <KeenIcon icon="check" />
        </div>
      </div>
    </div>
  );
};

export default PncStep1;
