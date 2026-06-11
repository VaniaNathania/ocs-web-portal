import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SelectContentProps } from "@radix-ui/react-select";

interface CustomSelectItemProps
  extends React.ComponentProps<typeof SelectItem> {
  onSelect?: () => void;
}

interface SearchSelectProps {
  children?: React.ReactNode;
  onSelect?: (value: string | null) => void;
  selectedValue?: string | null;
  onSearch?: (query: string) => void;
  className?: string;
}

const SearchSelect = React.forwardRef<
  HTMLDivElement,
  SearchSelectProps & SelectContentProps
>(({ children, onSearch, onSelect, selectedValue, ...props }, ref) => {
  const [search, setSearch] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleSelect = (value: string) => {
    setSearch("");
    if (onSelect) {
      if (value === selectedValue) {
        onSelect(null);
      } else {
        onSelect(value);
      }
    }
  };

  useEffect(() => {
    if (onSearch) {
      const timer = setTimeout(() => {
        onSearch(search);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search]);

  const filteredChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;

    const childElement = child as React.ReactElement<CustomSelectItemProps>;

    if ((childElement.type as any).displayName === "SelectItem") {
      const childText = String(childElement.props.children).toLowerCase();
      if (search && !childText.includes(search.toLowerCase())) {
        return null;
      }
      return React.cloneElement(childElement, {
        onSelect: () => handleSelect(childElement.props.value),
      });
    }

    return child;
  });

  return (
    <SelectContent ref={ref} {...props}>
      <div className="sticky top-0 p-2 bg-popover z-10 w-full border-b">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          className="h-8 w-full"
        />
      </div>
      <div className="pt-1">{filteredChildren}</div>
    </SelectContent>
  );
});

SearchSelect.displayName = "SearchSelect";

export { SearchSelect };
