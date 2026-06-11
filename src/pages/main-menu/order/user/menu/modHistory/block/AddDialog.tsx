interface AddDialogProps {
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const AddDialog: React.FC<AddDialogProps> = ({ errors, setErrors, isSubmitting, onSubmit, onCancel }) => {
  return (
    <div>
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          Please fill in all required fields
        </div>
      )}

      <form onSubmit={onSubmit}>

      </form>   
    </div>
  );
};

export default AddDialog;
