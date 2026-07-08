import { cn } from "@chambitas/ui";
import { ChevronDown, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface SearchableSelectOption {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  noOptionsText?: string;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  noOptionsText = "No se encontraron opciones",
  className = ""
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
  const selectedOption = options.find(o => o.id === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={cn(
          "w-full h-12 px-3 rounded-md border flex items-center justify-between bg-white text-sm cursor-pointer transition-colors",
          isOpen ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-500"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen ? "rotate-180" : "")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg flex flex-col">
          <div className="p-2 border-b border-slate-100 shrink-0 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-2 text-sm bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-emerald-500 text-slate-900"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-60 custom-scrollbar">
            {filteredOptions.length > 0 ? filteredOptions.map(o => (
              <div
                key={o.id}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-emerald-50 hover:text-emerald-900 transition-colors",
                  value === o.id ? "bg-emerald-100 text-emerald-900 font-bold" : "text-slate-700"
                )}
                onClick={() => {
                  onChange(o.id);
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                {o.name}
              </div>
            )) : (
              <div className="px-3 py-4 text-sm text-center text-slate-500">{noOptionsText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
