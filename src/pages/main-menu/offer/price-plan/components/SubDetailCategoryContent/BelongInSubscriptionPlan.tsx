import React, { useState, useMemo, useCallback } from "react";
import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import AddDataBelongInOfferGroup from "../../blocks/AddDataBelongInOfferGroup"; // Assuming this is your dialog component
import Swal from "sweetalert2"; // For alert messages

// Define an interface for your data structure to ensure type safety
interface OfferGroupData {
  id: number;
  offergroupname: string;
  agreementperiod: string;
  defaultchoice: boolean;
}

interface BelongInOfferGroupProps {
  offername: string;
}

const BelongInSubscriptionPlan: React.FC<BelongInOfferGroupProps> = ({ offername }) => {
  // State for controlling the "Add Data" dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // State to track which row is currently in edit mode (by its ID)
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  // State to hold the temporary edited data for the current row
  // Partial<OfferGroupData> means all properties are optional, as not all may be edited at once
  const [editedData, setEditedData] = useState<Partial<OfferGroupData>>({});

  // Dummy data for the table, managed by state to allow modifications
  const [dummyData, setDummyData] = useState<OfferGroupData[]>([
    // {
    //   offergroupname: "Offer Group A",
    //   agreementperiod: "2023-01-01 - 2023-12-31",
    //   defaultchoice: true,
    //   id: 1
    // },
    // {
    //   offergroupname: "Offer Group B",
    //   agreementperiod: "2024-01-01 - 2024-12-31",
    //   defaultchoice: false,
    //   id: 2
    // },
    // {
    //   offergroupname: "Offer Group C",
    //   agreementperiod: "2025-01-01 - 2025-12-31",
    //   defaultchoice: true,
    //   id: 3
    // },
  ]);

  // --- Dialog Control Handlers ---
  const handleAddData = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // --- Inline Editing Handlers ---

  /**
   * Handles changes for text input fields (e.g., Agreement Period).
   * @param e The React change event from the input element.
   * @param field The key of the field being updated (e.g., "agreementperiod").
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof OfferGroupData) => {
      setEditedData((prev: Partial<OfferGroupData>) => ({ // Explicitly type 'prev' to avoid 'any'
        ...prev,
        [field]: e.target.value,
      }));
    },
    [] // No dependencies as setEditedData receives a functional update
  );

  /**
   * Handles changes for the checkbox input (e.g., Default Choice).
   * @param e The React change event from the input element.
   */
  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedData((prev: Partial<OfferGroupData>) => ({ // Explicitly type 'prev' to avoid 'any'
        ...prev,
        defaultchoice: e.target.checked,
      }));
    },
    [] // No dependencies as setEditedData receives a functional update
  );

  /**
   * Saves the edited data to the main dummyData array.
   * @param id The ID of the row being saved.
   */
  const handleSave = useCallback(
    (id: number) => {
      setDummyData(prevData =>
        prevData.map(row =>
          // If the row ID matches, update it with the editedData
          row.id === id ? { ...row, ...(editedData as OfferGroupData) } : row
        )
      );
      setEditingRowId(null); // Exit edit mode
      setEditedData({}); // Clear temporary edited data
      Swal.fire("Saved!", "Your changes have been saved.", "success");
    },
    [editedData] // editedData is a dependency because we use its current value
  );

  /**
   * Cancels the current editing session, discarding changes.
   */
  const handleCancel = useCallback(() => {
    setEditingRowId(null); // Exit edit mode
    setEditedData({}); // Clear temporary edited data
  }, []); // No dependencies

  /**
   * Deletes a row from the dummyData array after confirmation.
   * @param rowId The ID of the row to delete.
   * @param offerGroupName The name of the offer group for the confirmation message.
   */
  const handleDelete = useCallback(
    (rowId: number, offerGroupName: string) => {
      Swal.fire({
        title: "Are you sure?",
        text: `Do you really want to delete ${offerGroupName}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          setDummyData(prevData => prevData.filter(item => item.id !== rowId));
          Swal.fire("Deleted!", `${offerGroupName} has been deleted.`, "success");
        }
      });
    },
    [] // No dependencies as setDummyData receives a functional update
  );

  /**
   * Initiates the edit mode for a specific row.
   * @param row The OfferGroupData object of the row to be edited.
   */
  const handleEdit = useCallback(
    (row: OfferGroupData) => {
      setEditingRowId(row.id); // Set the ID of the row being edited
      setEditedData({ ...row }); // Populate editedData with the current row's data
    },
    [] // No dependencies
  );

  // --- Column Definitions for DataGrid ---
  const columns = useMemo<ColumnDef<OfferGroupData>[]>(
    () => [
      {
        id: "subscriptionplanname",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Subscription Plan Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-2/12", cellClassName: "w-2/12" },
        cell: ({ row }) => <p>{row.original.offergroupname || "-"}</p>,
      },
      {
        id: "version",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Version"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-2/12", cellClassName: "w-2/12" },
        cell: ({ row }) => <p>{row.original.offergroupname || "-"}</p>,
      },
    ],
    // Dependencies for useMemo. Recreate columns only if these values change.
    [editingRowId, editedData, handleInputChange, handleCheckboxChange, handleSave, handleCancel, handleDelete, handleEdit]
  );

  // --- Data Fetching/Pagination Logic ---
  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // This function simulates fetching data. In a real app, this would be an API call.
      // For now, it just slices the local dummyData.
      const startIndex = page * limit;
      const endIndex = startIndex + limit;

      const paginatedData = dummyData.slice(startIndex, endIndex) || [];
      const totalCount = dummyData.length || 0;

      return {
        data: paginatedData,
        totalCount,
      };
    },
    [dummyData] // dummyData is a dependency because its content determines the output
  );

  // --- Toolbar Component ---
  const Toolbar = () => (
    <div className="flex flex-wrap items-center justify-between p-4 w-full">
      {/* Input field on the left, takes available space */}
      <div className="flex-grow mr-4"> {/* flex-grow makes it expand, mr-4 adds space to the right */}
        <input
          type="text"
          className="w-full border rounded px-2 py-1 text-sm mt-1"
          placeholder="Subscription Plan Name"
        />
      </div>

      {/* Buttons on the right, grouped together */}
      <div className="flex gap-3">
        <DefaultTooltip title="New Data" placement="top">
          <Button variant="default" className="h-7.5" >
            Export
          </Button>
        </DefaultTooltip>

        <DefaultTooltip title="Refresh" placement="top">
          <Button
            variant="outline"
            className="h-7.5"
          // onClick={() => reload()} // Add a reload function if you fetch data from an API
          >
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );

  // --- Main Component Render ---
  return (
    <div className="items-center w-full container-fixed mt-5">
      <div className="flex items-center justify-between w-full pr-5 mt-5">
        <div className="flex items-center gap-2">
          {/* Dialog for adding new data */}
          <AddDataBelongInOfferGroup isOpen={isDialogOpen} onClose={handleCloseDialog} />
          {/* Button to manage offer status (assuming it opens another dialog or navigates) */}
        </div>
      </div>
      <div className="space-y-6 mt-5">
        <DataGridProvider
          columns={columns}
          pagination={{ size: 10 }} // Sets pagination to 10 items per page
          toolbar={<Toolbar />} // Renders the custom toolbar
          layout={{ card: true }} // Assumes a card layout for the grid
          sorting={[{ id: "created_date", desc: false }]} // Default sorting
          serverSide={true} // Indicates that data fetching is server-side (simulated here)
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
            // Callback to fetch data based on current grid state
            doGetListData(pageIndex, pageSize, sorting, columnFilters)
          }
        >
          {/* Children can be rendered here if the DataGridProvider expects them */}
        </DataGridProvider>
      </div>
    </div>
  );
};

export default BelongInSubscriptionPlan;