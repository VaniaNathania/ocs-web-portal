import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Box,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useUsagePriceCreateContext } from "../hooks";

interface CreateEventDialogProps {
  onClose: () => void;
  onCreateSuccess?: () => void;
}

interface EventByReTypeProps {
  parentId: number | null;
  reId: number;
  reType: string;
  reName: string;
  comments: string | null;
  spId: number | null;
  reCode: string | null;
  reAttr: any | null;
  children?: EventByReTypeProps[];
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  onClose,
  onCreateSuccess,
}) => {
  const [eventByRe, setEventByRe] = useState<EventByReTypeProps[]>([]);
  const [selectedReIds, setSelectedReIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const portalData = usePortalData();
  const { dataPricePlan, dataPricePlanDetail, selectedOfferVerId } = portalData;
  console.log("PORTAL DATA IN DIALOG:", portalData);
  const { eventList, getEventList } = useUsagePriceCreateContext();

  const { GetData, PostData } = useCallApi();

  useEffect(() => {
    if (!eventList || eventList.length === 0) {
      getEventList();
    }
  }, []);

  useEffect(() => {
    getEventByReType();
  }, []);

  const getEventByReType = async () => {
    setLoading(true);
    setError(null);
    try {
      const reType = 1;
      const response = await GetData(
        `${API_URL_PRICE_PLAN}/event/${reType}`,
        {},
      );

      if (response && response.data) {
        // Pastikan response.data adalah array
        if (Array.isArray(response.data)) {
          setEventByRe(response.data);
          //  console.log("Event data set:", response.data); // Debug log
        } else {
          console.warn("Response data is not an array:", response.data);
          setEventByRe([]);
          setError("Invalid data format received from server");
        }
      } else {
        console.warn("No data in response:", response);
        setEventByRe([]);
        setError("No data received from server");
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      setError("Failed to load event data. Please try again.");
      setEventByRe([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleReId = (reId: number, checked: boolean) => {
    setSelectedReIds((prev) =>
      checked ? [...prev, reId] : prev.filter((id) => id !== reId),
    );
  };

  const toggleExpanded = (reId: number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reId)) {
        newSet.delete(reId);
      } else {
        newSet.add(reId);
      }
      return newSet;
    });
  };

  const renderTree = (nodes: EventByReTypeProps[], level: number = 0) => {
    return (
      <Box>
        {nodes.map((node) => {
          const checked = selectedReIds.includes(node.reId);
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expandedNodes.has(node.reId);
          const isAlreadyCreated = eventList?.some(
            (ev) => ev.reId === node.reId,
          );

          return (
            <Box key={node.reId}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  pl: level * 3,
                  py: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.05)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    display: "flex",
                    justifyContent: "center",
                    mr: 1,
                  }}
                >
                  {hasChildren && (
                    <Button
                      size="small"
                      onClick={() => toggleExpanded(node.reId)}
                      sx={{
                        minWidth: 24,
                        width: 24,
                        height: 24,
                        p: 0,
                        color: "error.main",
                      }}
                    >
                      {isExpanded ? "−" : "+"}
                    </Button>
                  )}
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      disabled={isAlreadyCreated}
                      onChange={(e) => toggleReId(node.reId, e.target.checked)}
                      size="small"
                      sx={{
                        color: "error.main",
                        "&.Mui-checked": {
                          color: "error.main",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "14px",
                        fontWeight: level === 0 ? 500 : 400,
                        color: isAlreadyCreated ? "gray" : "inherit",
                      }}
                    >
                      {node.reName}
                      {isAlreadyCreated && " (Already created)"}
                    </Typography>
                  }
                  sx={{ margin: 0, flex: 1 }}
                />
              </Box>

              {hasChildren && isExpanded && (
                <Box>{renderTree(node.children!, level + 1)}</Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  const doCreateEvent = useCallback(async () => {
    setLoading(true);
    try {
      const initialState = {
        offerVerId: selectedOfferVerId,
        reId: selectedReIds,
      };
      console.log("initialState", initialState)
      const response = await PostData(
        `${API_URL_PRICE_PLAN}/event/create`,
        initialState,
      );
      if (response?.status) {
        toast.success("Event successfully created!");
        if (onCreateSuccess) {
          onCreateSuccess();
        }
        onClose();
      } else {
        toast.error("Failed to create event");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while creating event",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedReIds, PostData, onClose, onCreateSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedReIds.length === 0) {
      toast.error("Please select at least one event type!");
      return;
    }

    doCreateEvent();
  };

  const handleExpandAll = () => {
    const collectAllIds = (items: EventByReTypeProps[]): number[] => {
      return items.reduce<number[]>((acc, item) => {
        if (item.children && item.children.length > 0) {
          acc.push(item.reId);
          acc.push(...collectAllIds(item.children));
        }
        return acc;
      }, []);
    };
    setExpandedNodes(new Set(collectAllIds(eventByRe)));
  };

  const handleSelectAll = () => {
    const collectAllIds = (items: EventByReTypeProps[]): number[] => {
      return items.reduce<number[]>((acc, item) => {
        // Only add if not already created
        const isAlreadyCreated = eventList?.some((ev) => ev.reId === item.reId);
        if (!isAlreadyCreated) {
          acc.push(item.reId);
        }
        if (item.children && item.children.length > 0) {
          acc.push(...collectAllIds(item.children));
        }
        return acc;
      }, []);
    };

    const allIds = collectAllIds(eventByRe);
    setSelectedReIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedReIds([]);
  };

  const handleRetry = () => {
    getEventByReType();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          backgroundColor: "white",
          borderRadius: 2,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            backgroundColor: "white",
            color: "black",
          }}
        >
          <Typography variant="h6" className="font-bold">
            Create New Event
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3, backgroundColor: "white" }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress sx={{ color: "error.main", mb: 2 }} />
              <Typography>Loading event data...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Button
                variant="outlined"
                onClick={handleRetry}
                sx={{
                  color: "error.main",
                  borderColor: "error.main",
                  "&:hover": {
                    borderColor: "error.dark",
                    backgroundColor: "error.light",
                  },
                }}
              >
                Retry
              </Button>
            </Box>
          ) : eventByRe.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                No event data available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                There might be no events configured for this type, or there
                could be a connection issue.
              </Typography>
              <Button
                variant="outlined"
                onClick={handleRetry}
                sx={{
                  color: "error.main",
                  borderColor: "error.main",
                  "&:hover": {
                    borderColor: "error.dark",
                    backgroundColor: "error.light",
                  },
                }}
              >
                Refresh Data
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
                <Button
                  size="small"
                  onClick={handleExpandAll}
                  variant="outlined"
                  sx={{
                    color: "text.secondary",
                    borderColor: "grey.400",
                    "&:hover": {
                      borderColor: "error.main",
                      color: "error.main",
                    },
                  }}
                >
                  Expand All
                </Button>
                <Button
                  size="small"
                  onClick={handleSelectAll}
                  variant="outlined"
                  sx={{
                    color: "text.secondary",
                    borderColor: "grey.400",
                    "&:hover": {
                      borderColor: "error.main",
                      color: "error.main",
                    },
                  }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={handleDeselectAll}
                  variant="outlined"
                  sx={{
                    color: "text.secondary",
                    borderColor: "grey.400",
                    "&:hover": {
                      borderColor: "error.main",
                      color: "error.main",
                    },
                  }}
                >
                  Deselect All
                </Button>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  maxHeight: "400px",
                  overflowY: "auto",
                  backgroundColor: "white",
                }}
              >
                {renderTree(eventByRe)}
              </Paper>
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 2,
            backgroundColor: "white",
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              color: "text.secondary",
              borderColor: "grey.400",
              "&:hover": {
                borderColor: "error.main",
                color: "error.main",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "error.main",
              "&:hover": {
                backgroundColor: "error.dark",
              },
              "&:disabled": {
                backgroundColor: "grey.400",
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
                Creating...
              </>
            ) : (
              `Create Event (${selectedReIds.length})`
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateEventDialog;
