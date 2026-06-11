import { cn } from "@/utils/cn";
import { DefaultTooltip } from "../tooltip";
import { Button, ButtonProps } from "../ui/button";

type ToolbarButtonProps = Omit<ButtonProps, "title"> & {
  title?: string;
  isTooltip?: boolean;
};

const ToolbarButton = ({
  children,
  className,
  isTooltip = false,
  title,
  ...props
}: ToolbarButtonProps) => {
  const button = (
    <Button
      type="button"
      variant="ghost"
      className={cn("h-7 w-7 p-0", className)}
      aria-label={title} // aksesibilitas ✔️
      {...props}
    >
      {children}
    </Button>
  );

  if (!isTooltip || !title) return button;

  return <DefaultTooltip title={title}>{button}</DefaultTooltip>;
};

export default ToolbarButton;
