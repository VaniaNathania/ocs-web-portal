import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { debounce } from "@/lib/helpers"; // Atau pakai lodash/debounce

export interface Option<T = string | number> {
  label: string;
  value: T;
  balType?: string;
}

interface MultiSelectProps<T extends string | number> {
  value: T[];
  onChange: (values: T[]) => void;
  loadOptions: (search: string) => Promise<Option<T>[]>;
  selectedOptions?: Option<T>[];
  placeholder?: string;
  onValidateSelect?: (selected: Option<T>, currentSelected: Option<T>[]) => boolean;
}

const MultiSelect = <T extends string | number>({ value, onChange, loadOptions, selectedOptions, placeholder = "Search...", onValidateSelect }: MultiSelectProps<T>) => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Option<T>[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const debouncedFetch = useMemo(
    () =>
      debounce(async (input: string) => {
        setLoading(true);
        try {
          const result = await loadOptions(input);

          console.log("Loaded options:", result);
          setOptions(result);
        } finally {
          setLoading(false);
        }
      }, 400),
    [loadOptions],
  );

  useEffect(() => {
    if (open) debouncedFetch(search);
  }, [search, open]);

  const toggleValue = (selectedOption: Option<T>) => {
    const isSelected = value.includes(selectedOption.value);

    console.log("SELECTED VALUE", selectedOption);

    if (isSelected) {
      onChange(value.filter((v) => v !== selectedOption.value));
      return;
    }

    const currentSelected = options.filter((opt) => value.includes(opt.value));

    // validasi custom
    if (onValidateSelect && !onValidateSelect(selectedOption, currentSelected)) {
      return;
    }

    onChange([...value, selectedOption.value]);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabels = (selectedOptions || options).filter((opt) => value.includes(opt.value)).map((opt) => opt.label);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="border px-3 py-2 rounded-md flex justify-between items-center cursor-pointer bg-white" onClick={() => setOpen((prev) => !prev)} title={selectedLabels.length > 0 ? selectedLabels.join(", ") : undefined}>
        <span className="text-sm text-gray-700 truncate">{selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-md max-h-60 overflow-y-auto">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-2 py-1 border-b outline-none text-sm" placeholder="Type to search..." />
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
          ) : (
            options.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <div key={String(opt.value)} onClick={() => toggleValue(opt)} className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center text-sm">
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-green-600" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
