import React, { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import moment from "moment";
import Swal from "sweetalert2";


export interface Feature {
  id: string;
  name: string;
  code: string;
  operation: string;
  selected: boolean;
}

interface EditDialogVersion {
  isOpen: boolean;
  onClose: () => void;
  offerid: number;
  onSuccess?: () => void;
  versioneffdate: string;
  versionexpdate: string;
  id: number;
  sequence: string;
  refofferverid: number;
  state: string
  // onAdd: (selectedFeatures: Feature[]) => void;
}

interface CreateEditVersionParams {
  offerVerId: number | null,
  effDate: string | null,
  expDate: string | null,
  seq: number | null,
  spId: number | null,
  state: string | null,
  refOfferVerId: number | null,
  offerId: number | null,
}

const API_URL_OFFER = apiConfigOffer.offer;

const EditDialogVersion: React.FC<EditDialogVersion> = ({ isOpen, onClose, offerid, onSuccess, versioneffdate, versionexpdate, id, sequence, refofferverid, state }) => {
  const { PutData } = useCallApi();
  const [formField, setFormField] = useState<CreateEditVersionParams>({
    offerVerId: null,
    offerId: null,
    effDate: null,
    expDate: null,
    seq: null,
    spId: null,
    state: null,
    refOfferVerId: null,
  });

  useEffect(() => {
    if (isOpen) {
      setFormField({
        offerVerId: id,
        offerId: offerid,
        effDate: versioneffdate || null,
        expDate: versionexpdate || null,
        seq: sequence ? Number(sequence) : null,
        spId: null,
        state: state || null,
        refOfferVerId: refofferverid,
      });
    }
  }, [isOpen, id, offerid, versioneffdate, versionexpdate, sequence, state, refofferverid]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleAddData = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      Swal.fire({
        title: "Please wait...",
        text: "Submitting your data",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let expdate:any;
      if(formField.expDate=="-"){
        expdate = null
      }else{
        expdate = formField.expDate
      }

      try {
        let payload: any = {
          offerVerId: id,
          offerId: offerid,
          effDate: formField.effDate,
          expDate: expdate,
          seq: sequence,
          spId: 0,
          state: state,
          refOfferVerId: refofferverid
        };

        const response = await PutData(
          `${API_URL_OFFER}/offer/price-plan/mod-price-plan-ver`,
          payload
        );

        if (response?.status) {
          Swal.close();
          toast.success("Version Updated successfully!");

          // ✅ Panggil callback untuk trigger refresh di parent
          if (onSuccess) {
            onSuccess();
          }

          onClose(); // tutup dialog
        } else {
          Swal.close();
          toast.error(response?.message || "Something went wrong");
        }
      } catch (err: any) {
        Swal.close();
        toast.error(err?.message || "Something went wrong");
      }
    },
    [formField, offerid, onClose, onSuccess] // ✅ Tambahkan onSuccess ke dependencies
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl h-auto max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Edit Version</h2>
          <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* ✅ Form start di sini */}
        <form onSubmit={handleAddData} className="flex-1 overflow-auto p-6 flex flex-col">

          {/* Version Date */}
          <div className="flex items-center gap-4 mb-4">
            <label htmlFor="startDate" className="w-32 flex-shrink-0 text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> Version Date
            </label>

            <div className="flex flex-1 gap-2">
              <input
                id="startDate"
                type="date"
                value={formField.effDate ?? ""}
                onChange={(e) => {
                  const newStart = e.target.value === "" ? null : moment(e.target.value).format("YYYY-MM-DD");
                  if (formField.expDate && newStart && moment(newStart).isAfter(formField.expDate)) {
                    toast.error("Start date cannot be after end date");
                    return;
                  }
                  setFormField((prev: any) => ({ ...prev, effDate: newStart }));
                }}
                className="input input-bordered input-sm w-1/2"
              />
              <span className="flex items-center text-gray-500">-</span>
              <input
                id="endDate"
                type="date"
                value={formField.expDate ?? ""}
                onChange={(e) => {
                  const newEnd = e.target.value === "" ? null : moment(e.target.value).format("YYYY-MM-DD");
                  if (formField.effDate && newEnd && moment(formField.effDate).isAfter(newEnd)) {
                    toast.error("Start date cannot be after end date");
                    return;
                  }
                  setFormField((prev: any) => ({ ...prev, expDate: newEnd }));
                }}
                className="input input-bordered input-sm w-1/2"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t flex justify-end items-center mt-6">
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit
              </Button>
            </div>
          </div>
        </form>
        {/* ✅ Form ditutup di sini */}
      </div>
    </div>
  );
}

export default EditDialogVersion;