import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const FeatureSearchBar = ({ value, onChange }: Props) => (
  <div className="relative">
    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
    <input
      type="text"
      placeholder="Search Features"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
    />
  </div>
);

export default FeatureSearchBar;
