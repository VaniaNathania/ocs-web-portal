import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeenIcon } from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";

const API_URL_REF = apiConfigRef.ref;


interface SelectUserDialogProps {
  isOpen: boolean;
  handleDialog: (open: boolean) => void;
  onUserSelect?: (user: User) => void;
}

interface User {
  code: string;
  name: string;
}

const SelectUserDialog: React.FC<SelectUserDialogProps> = ({
  isOpen,
  handleDialog,
  onUserSelect,
}) => {

  const { GetData } = useCallApi();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchBy, setSearchBy] = useState<"name" | "code">("name");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GetData(
        `${API_URL_REF}/api/advice-monitor/qry-advice-sender-user`,
        {
          page: 1, size: 100,
        }
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch user data");
      }

      const responseData = response?.data?.body?.data || response?.data;
      let userList = [];

      if (responseData) {
        userList = responseData.list ||
          responseData.data ||
          responseData.content ||
          responseData ||
          [];
      }

      const mappedUsers = userList.map((user: any) => ({
        code: user.userCode || user.code || "",
        name: user.userName || user.name || "",
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [GetData]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);


const filteredUsers = useMemo(() => {
  if (!searchTerm.trim()) return users;
  const term = searchTerm.toLowerCase();

  return users.filter((u) =>
    searchBy === "name"
      ? u.name.toLowerCase().includes(term)
      : u.code.toLowerCase().includes(term)
  );
}, [searchTerm, searchBy, users]);

const handleOK = () => {
  if (!selectedUser) {
    alert("Please select a user first");
    return;
  }

  if (onUserSelect) {
    onUserSelect(selectedUser);
  }

  handleDialog(false);
};

const handleCancel = () => {
  setSelectedUser(null);
  setSearchTerm("");
  handleDialog(false);
};

return (
  <Dialog open={isOpen} onOpenChange={handleDialog}>
    <DialogContent
      className="container-fixed max-w-xl w-full flex flex-col p-0 overflow-hidden [&>button]:hidden" >

      <DialogHeader className="px-6 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-base font-semibold">User</DialogTitle>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDialog(false)}
            className="h-8 w-8 p-0 absolute right-5 top-3"
          >
            <KeenIcon icon="cross" className="text-sm" />
          </Button>
        </div>
      </DialogHeader>

      <DialogBody className="px-6 py-4 space-y-4">

        <div className="flex items-center gap-2">
          <Select
            value={searchBy}
            onValueChange={(v: "name" | "code") => setSearchBy(v)} >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="User Name" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="name">User Name</SelectItem>
              <SelectItem value="code">User Code</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Input
              placeholder=""
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pr-8"
            />
            <KeenIcon
              icon="search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-sm overflow-hidden">

          <div className="grid grid-cols-[40px_1fr_1fr] bg-gray-100 text-xs font-semibold text-gray-700 px-4 py-2">
            <div></div>
            <div>User Name</div>
            <div>User Code</div>
          </div>

          <div className="max-h-64 overflow-y-auto text-sm">
            {filteredUsers.length === 0 && (
              <div className="px-4 py-3 text-gray-500">No users found</div>
            )}

            {filteredUsers.map((user) => (
              <div
                key={user.code}
                className={`grid grid-cols-[40px_1fr_1fr] px-4 py-2 border-t border-gray-100 cursor-pointer
      ${selectedUser?.code === user.code ? "bg-blue-50" : "bg-white hover:bg-gray-50"}
    `}
                onClick={() => setSelectedUser(user)}
              >
                <input
                  type="checkbox"
                  checked={selectedUser?.code === user.code}
                  readOnly
                className="mx-auto"
                aria-label="Select user"
                />

                <div>{user.name}</div>
                <div>{user.code}</div>
              </div>
            ))}


          </div>
        </div>
      </DialogBody>

      <DialogFooter className="px-6 py-3 border-t border-gray-200">
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={handleOK}
          >
            OK
          </Button>
        </div>
      </DialogFooter>

    </DialogContent>
  </Dialog>
);
};

export default SelectUserDialog;
