import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(value !== undefined ? value : defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    onChange(optionValue);
  };

  const selectedOption = options.find((opt) => String(opt.value) === String(selectedValue));

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs cursor-pointer transition-all ${
          isOpen ? "border-[#7db9fb] ring-3 ring-[#7db9fb]/20" : "hover:border-gray-400"
        } ${
          selectedValue
            ? "text-gray-800"
            : "text-gray-400"
        } ${className}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <svg className="h-5 w-5" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L10 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L10.7071 12.7071C10.3166 13.0976 9.68342 13.0976 9.29289 12.7071L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289Z" fill="currentColor" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 max-h-60 overflow-auto custom-scrollbar">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center italic">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = String(option.value) === String(selectedValue);
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2.5 text-sm cursor-pointer mx-1.5 rounded-lg transition-colors ${
                    isSelected 
                      ? "bg-[#f0f7ff] text-[#0066cc] font-semibold" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
