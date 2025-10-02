// components/SearchableSelect.tsx
import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SearchableSelectProps<T extends string | number> {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  onAddNew: (value: T) => void;
}

export function SearchableSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
  onAddNew,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (val: T) => {
    onChange(val);
    setOpen(false);
  };

  const handleAdd = () => {
    if (search.trim()) {
      const newVal = search.trim() as T;
      onAddNew(newVal);
      onChange(newVal);
      setOpen(false);
    }
  };

  const filtered = options.filter((opt) =>
    opt.toString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {value ? value.toString() : `Select ${label}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full max-h-[300px]">
          <Command>
            <CommandInput
              placeholder={`Search or add ${label}`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No results</CommandEmpty>
              <CommandGroup>
                {filtered.map((opt) => (
                  <CommandItem
                    key={opt.toString()}
                    onSelect={() => handleSelect(opt)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.toString()}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {search && !options.includes(search as T) && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleAdd}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add “{search}”
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

