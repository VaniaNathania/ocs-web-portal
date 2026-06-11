import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { KeenIcon } from "@/components";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";

const API_URL_REF = apiConfigRef.ref;

interface MessageMonitoringDetailDialogProps {
    isOpen: boolean;
    handleDialog: (open: boolean) => void;
    rowData?: any;
    useDateFormatDDMMYYYY?: boolean;
}

const MessageMonitoringDetailDialog = ({ isOpen, handleDialog, rowData, useDateFormatDDMMYYYY }: MessageMonitoringDetailDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [stateTime, setStateTime] = useState("");

    const getStateLabel = (stateCode: string): string => {
        const stateMap: Record<string, string> = {
            I: "Parameter Initial",
            A: "Ready",
            B: "Process",
            E: "Error",
            C: "Success",
            X: "Cancel",
            U: "User Receive Fail",
            W: "Waiting Feedback",
        };
        return stateMap[stateCode] || stateCode;
    };

    const formatDateTimeDisplay = (value?: string | null): string => {
        if (!value) return "";

        const asString = String(value).trim();
        const withoutMillis = asString.replace("T", " ").split(".")[0];
        return withoutMillis.replace(/Z$/, "");
    };

    const formatDateTimeDDMMYYYY = (value?: string | null): string => {
        if (!value) return "";
        const date = new Date(String(value).trim());
        if (Number.isNaN(date.getTime())) return formatDateTimeDisplay(value);
        const dd = String(date.getDate()).padStart(2, "0");
        const MM = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        const HH = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");
        return `${dd}-${MM}-${yyyy} ${HH}:${mm}:${ss}`;
    };

    const formatDateForDisplay = useDateFormatDDMMYYYY ? formatDateTimeDDMMYYYY : formatDateTimeDisplay;

    const { PutData } = useCallApi();

    const handleCancel = () => {
        handleDialog(false);
    };

    const handleRedirect = async () => {
        if (isSubmitting) return;

        const rawId = rowData?.adviceId ?? rowData?.smsIdentity;
        const adviceId = Number(rawId);

        if (!rawId || !Number.isFinite(adviceId)) {
            toast.error("Invalid advice ID for redirect");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                adviceMonitorIds: [adviceId],
                masterRoute: true,
            };

            const resp = await PutData(
                `${API_URL_REF}/api/advice-monitor/reset-advice-monitor-state-batch`,
                payload,
            );

            if (!resp || resp.status === false) {
                toast.error(resp?.message || "Redirect failed");
                return;
            }

            toast.success("Redirect request submitted");
            handleDialog(false);
        } catch (e: any) {
            toast.error(e?.message || "Redirect failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialog}>
            <DialogContent className="container-fixed max-w-7xl flex flex-col p-0 overflow-hidden [&>button]:hidden">
                <DialogHeader className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <DialogTitle className="text-2xl font-semibold text-gray-900">
                                Message Monitoring Detail
                            </DialogTitle>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0 absolute right-6 top-6"
                        >
                            <KeenIcon icon="cross" className="text-sm" />
                        </Button>
                    </div>
                </DialogHeader>

                <DialogBody className="scrollable-y p-6">
                    <div className="space-y-6">
                        {/* Top: 2-column layout */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                                    <Label className="text-sm text-gray-800">Service ID</Label>
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            value={rowData?.serviceId || ""}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                                    <Label className="text-sm text-gray-800">Message Template Name</Label>
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            value={rowData?.template || ""}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                                    <Label className="text-sm text-gray-800">State</Label>
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            value={getStateLabel(rowData?.state || "")}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                                    <Label className="text-sm text-gray-800">State Time</Label>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                        <Input
                                            value={formatDateForDisplay(rowData?.stateDate ?? rowData?.stateTime ?? "")}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                            <KeenIcon icon="calendar" className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                                    <Label className="text-sm text-gray-800">Advice Channel</Label>
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            value={rowData?.channel || ""}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                                    <Label className="text-sm text-gray-800">Message Template Code</Label>
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            value={rowData?.stdCode || ""}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                                    <Label className="text-sm text-gray-800">Start Time</Label>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={formatDateForDisplay(rowData?.createdDate ?? rowData?.createdTime ?? "")}
                                                disabled
                                                className="bg-gray-50"
                                            />
                                            <KeenIcon icon="calendar" className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                                    <Label className="text-sm text-gray-800">Send Date</Label>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Format: yyyy-mm-dd hh:ii:ss"
                                                disabled
                                                className="bg-gray-50"
                                            />
                                            <KeenIcon icon="calendar" className="text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message: full width (under both columns) */}
                        <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                            <Label className="text-sm text-gray-800">Message</Label>
                            <Textarea
                                name="message"
                                value={rowData?.message || ""}
                                disabled
                                placeholder=""
                                className="w-full min-h-[120px] bg-gray-50"
                            />
                        </div>

                        {/* Remarks: full width under Message */}
                        <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                            <Label className="text-sm text-gray-800">Remarks</Label>
                            <Textarea
                                name="remarks"
                                placeholder="Enter remarks..."
                                disabled 
                                className="w-full min-h-[120px] bg-gray-50"
                            />
                        </div>
                    </div>
                </DialogBody>



                <DialogFooter className="p-6 border-t border-gray-200">
                    <div className="flex justify-end gap-3 w-full">
                    <Button
                            type="button"
                            variant="outline"
                            className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
                            onClick={handleRedirect}
                            disabled={isSubmitting}
                        >
                            Redirect
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};


export default MessageMonitoringDetailDialog;
