import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";
import { addLogActivity } from "@/actions/GlobalActions";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-0 focus:ring-0 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Metronic variants
        light: "btn btn-light",
      },
      size: {
        default: "text-sm h-10 rounded-md px-4 py-2",
        sm: "text-xs btn-sm h-8 rounded-md px-3 gap-1",
        lg: "text-sm h-11 rounded-md px-8",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, onClick, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const location = window.location.pathname;

    const SaveLog = (str: string) => {
      if (
        str.includes("new") ||
        str.includes("create") ||
        str.includes("copy")
      ) {
        addLogActivity(
          "audit",
          "ADD_DATA",
          `Adding data on ${location}`,
          location,
        );
      } else if (str.includes("edit")) {
        addLogActivity(
          "audit",
          "UPDATE_DATA",
          `Updating data on ${location}`,
          location,
        );
      } else if (str.includes("delete") || str.includes("remove")) {
        addLogActivity(
          "audit",
          "DELETE_DATA",
          `Deleting data on ${location}`,
          location,
        );
      } else if (str.includes("cancel")) {
        addLogActivity(
          "audit",
          "CANCEL_FUNCTION",
          `Canceling data modification on ${location}`,
          location,
        );
      } else {
        addLogActivity(
          "audit",
          str.toUpperCase(),
          `function ${str} on ${location}`,
          location,
        );
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (typeof children === "string") {
        // console.log("ini child string doang", children);
        SaveLog(children);
      } else {
        const arr = React.Children.toArray(children);
        if (arr.length === 2 && typeof arr[1] === "string") {
          // console.log("scnd string child", arr[1]);
          SaveLog(arr[1]);
        }
      }
      // console.log("clicked", location);
      if (onClick) onClick(e); // call user handler if provided
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
