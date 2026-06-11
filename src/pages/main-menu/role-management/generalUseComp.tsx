import { Button } from "@/components/ui/button";
import { AccessWrapper } from "./hook/useRoleCheck";
import { DefaultTooltip, TDataGridProps } from "@/components";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { KeenIcon } from "@/components";
import React, {
  Children,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

interface MenusCompGroupBtnAccess {
  buttonMenuOps: buttonMenusOps[];
  hasAccess: boolean;
  handleButton: (prosses: () => void, description: string) => void;
}

export interface buttonMenusOps {
  ops: () => void;
  desc: string;
  icon: JSX.Element;
}

export interface ParentChildNode {
  index: number;
  parentIndex: number;
  level: number;
  isChild: boolean;
}

export const MenusCompGroupBtnAccess = ({
  buttonMenuOps,
  hasAccess,
  handleButton,
}: MenusCompGroupBtnAccess) => {
  return (
    <div className="flex flex-row justify-center align-middle gap-2">
      {buttonMenuOps.map((btn, idx) => (
        <AccessWrapper
          hasAccess={hasAccess}
          key={idx}
          // type="card"
        >
          <Button
            variant="ghost"
            key={idx}
            className="text-blue-500 hover:bg-blue-500 hover:text-white"
            onClick={() => handleButton(btn.ops, btn.desc)}
          >
            {btn.icon}
          </Button>
        </AccessWrapper>
      ))}
    </div>
  );
};

interface buttonCursor {
  children: React.ReactNode;
  onClick?: () => void;
  disable?: boolean;
  title?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "light";
  // key?: any;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export const ButtonCursor = ({
  children,
  onClick = () => {},
  disable = false,
  title = "",
  variant = "default",
  className = "",
  size = "default",
  // key,
}: buttonCursor) => {
  return (
    <DefaultTooltip title={title}>
      <Button
        onClick={() => {
          if (!disable) onClick();
        }}
        className={`${disable ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
        variant={variant}
        type="button"
        size={size}
        // key={key}
      >
        {children}
      </Button>
    </DefaultTooltip>
  );
};

import { Loading } from "./block/loadingBlock";
import { FaCheck, FaExclamation, FaQuestion } from "react-icons/fa";
import { Label } from "@/components/ui/label";

export interface PopUpProps {
  isOpen: boolean;
  handleDialog: (bool: boolean) => void;
  title?: string;
  desc?: string;
  onConfirm?: () => Promise<any>;
  type?: "confirm" | "alert";
  alertType?: "success" | "default";
  bgOn?: boolean;
  children?: React.ReactNode;
}

export const PopUpDialog = ({
  isOpen,
  handleDialog,
  title = "Are You Sure?",
  desc = "This are confirmation Dialog",
  onConfirm = async () => {},
  type = "confirm",
  alertType = "default",
  bgOn = true,
  children = "",
}: PopUpProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicked directly on the backdrop
    if (e.target === e.currentTarget) {
      handleDialog(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      //  console.log("di conf dialog");

      await onConfirm();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return;

  return (
    <div
      className={`${bgOn ? "fixed inset-0 bg-black bg-opacity-50 " : ""}flex items-center justify-center z-50`}
      onClick={handleBackdropClick}
    >
      <Dialog open={isOpen} onOpenChange={(open) => handleDialog(open)}>
        <DialogContent
          className={`container-fixed max-w-sm flex flex-col p-0 overflow-hidden [&>button]:hidden`}
          aria-describedby={title}
        >
          <DialogHeader className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex flex-row gap-2">
                <span className="flex items-center gap-2">
                  {type === "confirm" ? (
                    <FaQuestion className="w-6 h-6 text-yellow-300 border-2 border-yellow-300 rounded-full p-1" />
                  ) : alertType === "default" ? (
                    <FaExclamation className="w-6 h-6 text-red-600 border-2 border-red-600 rounded-full p-1" />
                  ) : (
                    <FaCheck className="w-6 h-6 text-green-600 border-2 border-green-600 rounded-full p-1" />
                  )}

                  <span>{title}</span>
                </span>
                {/* <div className="my-auto">
                </div> */}
              </DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDialog(false)}
              className="h-8 w-8 p-0"
            >
              <KeenIcon icon="cross" className="text-sm" />
            </Button>
          </DialogHeader>

          <DialogBody className="">
            {loading && <Loading />}
            <div className="flex flex-col gap-5">
              <DialogDescription className="text-gray-600">
                {desc}
              </DialogDescription>
              {children}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleDialog(false)}>
                  {type === "confirm" ? "Cancel" : "Ok"}
                </Button>
                {type === "confirm" && (
                  <Button
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    Confirm
                  </Button>
                )}
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface size {
  width?: string;
  height?: string;
}

interface WrapperProps {
  children: React.ReactNode;
  title: string;
  desc?: string;
  onClose?: () => void;
  size?: size;
  isOpen: boolean;
  bgOn?: boolean;
  handleDialog: (open: boolean) => void;
}

export interface ParentDialogProps {
  isOpen: boolean;
  handleDialog: (open: boolean) => void;
}

export const DialogWrapper = ({
  children,
  title,
  desc = "",
  size = { width: "6xl", height: "93vh" },
  isOpen,
  bgOn = true,
  handleDialog,
}: WrapperProps) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const dragStart = React.useRef({ x: 0, y: 0 });

  const onDragStart = (e: React.MouseEvent) => {
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const onDragEnd = (e: React.MouseEvent) => {
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  React.useEffect(() => {
    if (!isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleDialog(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-opacity-30 flex items-center justify-center z-50 ${bgOn ? "bg-black" : "bg-none"}`}
      onClick={handleBackdropClick}
    >
      <Dialog open={isOpen} onOpenChange={handleDialog}>
        <DialogContent
          style={{
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
          }}
          className={` max-w-${size.width} h-[${size.height}] flex flex-col p-0 overflow-hidden [&>button]:hidden`}
          // draggable
          // onDragEnd={onDragEnd}
        >
          {/* 🔹 DRAG HANDLE */}
          <DialogHeader
            onMouseDownCapture={onDragStart}
            // onMouse={onDragEnd}
            draggable
            onDragEnd={onDragEnd}
            className="p-5 border-b border-gray-200 cursor-move select-none"
          >
            <div className="flex items-center w-full justify-between">
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-md text-gray-900">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {desc}
                </DialogDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDialog(false)}
                className="h-8 w-8 p-0"
              >
                <KeenIcon icon="cross" className="text-sm" />
              </Button>
            </div>
          </DialogHeader>

          <DialogBody className="p-5 pt-0 overflow-y-auto">
            {children}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export interface paging {
  search?: string;
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

interface TooltipLabelProps {
  text: string;
  required?: boolean;
  className?: string;
}

export const TooltipLabel = ({
  text,
  required,
  className,
}: TooltipLabelProps) => (
  <DefaultTooltip title={text} placement="top">
    <Label className={`truncate h-full flex items-center ${className || ""}`}>
      {required && <span className="text-red-500">*</span>}
      <div className="flex-1 truncate">{text}</div>
    </Label>
  </DefaultTooltip>
);

export interface MultiSelect {
  rows: any[];
  setAction: Dispatch<SetStateAction<any[]>>;
  action: any[];
  keyRow: string;
  showKeyRow: string;
  disabled?: boolean;
}
export const MultiSelect = ({
  rows,
  setAction,
  action,
  keyRow,
  showKeyRow,
  disabled = false,
}: MultiSelect) => {
  // persist across renders
  const recordRef = useRef<Record<string | number, boolean>>({});

  useEffect(() => {
    recordRef.current = {};
    if (action.length === 0) {
      return;
    }
    action.forEach((item) => {
      const key = item[keyRow];

      recordRef.current[key] = true;
    });
    // console.log(recordRef);
  }, [action]);

  const toggleItem = (item: any) => {
    const key = item[keyRow];

    setAction((prev) => {
      const exists = recordRef.current[key];

      if (exists) {
        // ❌ remove
        recordRef.current[key] = false;
        return prev.filter((v) => v[keyRow] !== key);
      } else {
        // ✅ add
        recordRef.current[key] = true;
        return [...prev, item];
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        disabled={disabled}
        className="disabled:cursor-not-allowed"
      >
        <button
          disabled={disabled}
          className="flex flex-wrap border w-full h-10 overflow-y-auto rounded-md gap-1 p-0.5
               disabled:cursor-not-allowed disabled:opacity-50"
        >
          {action.map((item, index) => {
            return (
              <DefaultTooltip title={item[showKeyRow]} key={index}>
                <div
                  key={index}
                  className="text-4xs bg-primary-clarity p-0.75 rounded-md h-fit w-fit max-w-24 truncate cursor-default disabled:cursor-not-allowed"
                >
                  {item[showKeyRow]}
                </div>
              </DefaultTooltip>
            );
          })}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="disabled:cursor-not-allowed"
      >
        <div className="flex flex-col h-[200px] overflow-y-auto">
          {rows
            .sort((a, b) => a[showKeyRow].localeCompare(b[showKeyRow]))
            .map((item, index) => {
              const key = item[keyRow];
              const selected = action.some((a) => a[keyRow] === key);

              return (
                <DropdownMenuItem
                  key={index}
                  onClick={() => toggleItem(item)}
                  className="flex justify-between"
                >
                  {item[showKeyRow]}
                  {selected && <span>✓</span>}
                </DropdownMenuItem>
              );
            })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
