interface IWarningDialog {
  open: boolean;
  onOpenChange: () => void;
}

const WarningDialog = ({ open, onOpenChange }: IWarningDialog) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
      <div className="flex flex-col items-center p-8 space-y-5 bg-white shadow-2xl rounded-2xl w-[380px] animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 border border-yellow-300 rounded-full shadow-inner">
          <i className="text-4xl text-yellow-500 ki-duotone ki-information">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
          </i>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            System Reserved Payment Method
          </h2>
          <p className="text-sm text-gray-500">
            This payment method cannot be modified or deleted.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-100"></div>

        <button
          onClick={onOpenChange}
          className="w-full py-2.5 font-medium text-sm text-white bg-gradient-to-r from-yellow-400 to-yellow-500 
                 rounded-lg shadow hover:from-yellow-500 hover:to-yellow-600 
                 hover:shadow-md transition-all duration-200 ease-in-out"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

export default WarningDialog;
