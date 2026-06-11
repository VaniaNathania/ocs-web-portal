import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";

interface ModifySubscriberSuccessProps {
    onBack: () => void;
}

const ModifySubscriberSuccess: React.FC<ModifySubscriberSuccessProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-800">
                        SC_1000_Prepaid_Reguler
                    </h1>
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Service Info */}
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">📱</span>
                        <span>Service Number: 73007362</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">📋</span>
                        <span>Offer Name: Telkomcel Prepaid Channel</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">📊</span>
                        <span>Subscription Plan Name: SC_1000_Prepaid_Reguler</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="bg-gray-100 flex justify-center py-10">
                <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Green top border */}
                    <div className="h-1.5 bg-green-500"></div>

                    {/* Content */}
                    <div className="p-10 md:p-12">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                            {/* Left side - Success icon and message */}
                            <div className="flex flex-col items-center text-center">
                                <CheckCircle2
                                    className="w-20 h-20 text-green-500 mb-4"
                                    strokeWidth={1.5}
                                />
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Order Successfully!
                                </h2>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px bg-gray-200 self-stretch"></div>

                            {/* Right side - Order details */}
                            <div className="flex-1 w-full space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">
                                            Customer Order Number
                                        </div>
                                        <div className="text-base font-medium text-gray-800">
                                            121219520
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 mb-1">
                                            SC_1000_Prepaid_Reguler
                                        </div>
                                        <div className="text-base font-medium text-gray-800">
                                            20251022211**7477
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* OK Button */}
                        <div className="flex justify-end mt-10">
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 px-8 text-white font-medium"
                                onClick={onBack}
                            >
                                OK
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ModifySubscriberSuccess;
