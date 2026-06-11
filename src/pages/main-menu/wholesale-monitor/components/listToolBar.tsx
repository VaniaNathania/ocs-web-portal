import { Button } from "@/components/ui/button";

const ListToolBar = () => {
  return (
    <div className="flex gap-2 p-5">
      <Button size={"sm"} disabled className="disabled:cursor-not-allowed">
        Modify
      </Button>
      <Button
        size={"sm"}
        disabled
        className="disabled:cursor-not-allowed"
        variant={"outline"}
      >
        Submit
      </Button>
    </div>
  );
};

export default ListToolBar;
