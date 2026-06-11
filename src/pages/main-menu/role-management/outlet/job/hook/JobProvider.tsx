import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export interface JobData {
  jobId: number;
  jobName: string;
  state: string;
  stateDate: string;
  spId: number;
  jobCode: string;
}

interface JobListContextType {
  jobs: JobData[];
  loading: boolean;
  error: string | null;
  availableJobs: JobData[];
  setAvailableJobs: Dispatch<SetStateAction<JobData[]>>;
  ownedJobs: JobData[];
  setOwnedJobs: Dispatch<SetStateAction<JobData[]>>;
  lastUpdated: any;
  selectedAvailable: JobData[];
  setSelectedAvailable: Dispatch<SetStateAction<JobData[]>>;
  selectedOwned: JobData[];
  setSelectedOwned: Dispatch<SetStateAction<JobData[]>>;
  showEditDialog: boolean;
  handleEditDialog: (open: boolean) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  fetchAll: () => void;
  countAva: number;
  setCountAva: Dispatch<SetStateAction<number>>;
  countOwned: number;
  setCountOwned: Dispatch<SetStateAction<number>>;
}

export const JobListContext = createContext<JobListContextType | undefined>(
  undefined
);

// ✅ Replace with your actual data source if needed
const MockJobData: JobData[] = [
  {
    jobId: 1,
    jobName: "IT Center Administrator",
    state: "A",
    stateDate: "2023-12-25 15:31:56",
    spId: 0,
    jobCode: "IT Center Administrator",
  },
];

export const JobListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableJobs, setAvailableJobs] = useState<JobData[]>([]);
  const [ownedJobs, setOwnedJobs] = useState<JobData[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<JobData[]>([]);
  const [selectedOwned, setSelectedOwned] = useState<JobData[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [countAva, setCountAva] = useState<number>(0);
  const [countOwned, setCountOwned] = useState<number>(0);

  const fetchAll = () => {
    setLoading(true);
    try {
      setLastUpdated(Date.now());
    } catch (e: any) {
      setError(e.message || "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDialog = (open: boolean) => {
    setShowEditDialog(open);
  };

  // useEffect(() => {
  //   fetchAll();
  // }, []);

  return (
    <JobListContext.Provider
      value={{
        jobs,
        loading,
        error,
        availableJobs,
        setAvailableJobs,
        ownedJobs,
        setOwnedJobs,
        lastUpdated,
        selectedAvailable,
        setSelectedAvailable,
        selectedOwned,
        setSelectedOwned,
        showEditDialog,
        handleEditDialog,
        isEditing,
        setIsEditing,
        fetchAll,
        countAva,
        setCountAva,
        countOwned,
        setCountOwned,
      }}
    >
      {children}
    </JobListContext.Provider>
  );
};
