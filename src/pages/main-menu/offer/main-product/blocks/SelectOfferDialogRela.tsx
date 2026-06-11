import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface OfferItem {
  offerName: string;
  productCode: string;
}

interface OfferData {
  id: number;
  name: string;
  networkType: string;
}

interface SelectOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: OfferItem[]) => void;
  data?: OfferItem[];
  onConfirm: (selected: OfferData[]) => void;
}


const SelectOfferDialogRela: React.FC<SelectOfferDialogProps> = ({ isOpen, onClose, onSelect, data = [], onConfirm }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffers, setSelectedOffers] = useState<any[]>([]);

  // Sample offer data - replace with your actual data
  const offers = [
    { id: 1, name: 'Telkomsel Prepaid Channel', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 2, name: 'Telkomsel Prepaid Bundling', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 3, name: 'Telkomsel Hybrid Main Product', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 4, name: 'Telkomsel Application', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 5, name: 'SC_2020_SMS_Package_Bulk', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 6, name: 'SC_4700_Mobile VPN', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 7, name: 'SC_2008_Internet_Prepaid', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 8, name: 'SC_1043_Prepaid_APN', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 9, name: 'SC_1050_Prepaid_T_Pack', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 10, name: 'Telkomsel Prepaid 3G/4ME', networkType: 'GSM/WCDMA/CAMEL' },
    { id: 11, name: 'SC_2021_SMS_Package_Monthly', networkType: 'GSM/WCDMA/CAMEL' }
  ];

  // Filter offers based on search term
  const filteredOffers = offers.filter(offer =>
    offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.networkType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (offerId: number) => {
    setSelectedOffers(prev => {
      if (prev.includes(offerId)) {
        return prev.filter(id => id !== offerId);
      } else {
        return [...prev, offerId];
      }
    });
  };

  const handleConfirm = () => {
    const selectedOfferData = offers.filter(offer => selectedOffers.includes(offer.id));
    onConfirm(selectedOfferData);
    onClose();
  };

  const handleCancel = () => {
    setSelectedOffers([]);
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Add Relationship</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <p className="text-sm text-gray-600 text-center">Step 2: Select Offer</p>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Offer Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Table header */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <div className="grid grid-cols-2 gap-4">
            <span className="text-sm font-medium text-gray-700">Offer Name</span>
            <span className="text-sm font-medium text-gray-700">Network Type</span>
          </div>
        </div>

        {/* Offer list */}
        <div className="flex-1 overflow-y-auto max-h-80">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`offer-${offer.id}`}
                    checked={selectedOffers.includes(offer.id)}
                    onChange={() => handleCheckboxChange(offer.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`offer-${offer.id}`}
                    className="text-sm text-gray-800 cursor-pointer"
                  >
                    {offer.name}
                  </label>
                </div>
                <span className="text-sm text-gray-600">{offer.networkType}</span>
              </div>
            </div>
          ))}
          
          {filteredOffers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No offers found matching your search.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedOffers.length === 0}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectOfferDialogRela;