
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

// Types
interface BalanceTypeOption {
  acctResId: string | number;
  acctResName: string;
  [key: string]: any; // untuk property tambahan lainnya
}

interface SearchSelectProps {
  options: BalanceTypeOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  loading?: boolean;
}

const SearchSelectBalancedComponent: React.FC<SearchSelectProps> = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Search...",
  loading = false 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option: BalanceTypeOption) =>
    option.acctResName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option display text
  const selectedOption = options.find((opt: BalanceTypeOption) => opt.acctResId === value);
  const displayText = selectedOption?.acctResName || '';

  const handleSelect = (option: BalanceTypeOption): void => {
    onChange(option.acctResId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent<SVGElement>): void => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between hover:border-gray-400 transition-colors"
      >
        <span className={`${!displayText ? 'text-gray-400' : 'text-gray-900'}`}>
          {loading ? 'Loading...' : displayText || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {displayText && (
            <X 
              size={16} 
              className="text-gray-400 hover:text-gray-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown 
            size={20} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search balance type..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-center text-gray-500">
                Loading...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((option: BalanceTypeOption) => (
                <button
                  key={option.acctResId}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors ${
                    option.acctResId === value ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  {option.acctResName}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSelectBalancedComponent;