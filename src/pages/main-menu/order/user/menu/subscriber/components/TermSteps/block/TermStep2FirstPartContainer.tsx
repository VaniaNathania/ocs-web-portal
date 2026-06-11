import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import TermStep2Table from "./Step2Table";
import { CashDeskFee } from "../../modifysubscriber/model/interfaces";
import { formatAmount } from "../../general";

export interface Paymentprops {
  cashDeskFee: CashDeskFee[];
}

const TermStep2Container = ({ cashDeskFee }: Paymentprops) => {
  const [showTable, setShowTable] = useState(true);

  return (
    <div className={`flex flex-col border-2`}>
      {/* Header */}
      <div className="flex flex-row h-[40px] bg-primary-clarity text-sm items-center justify-between py-2 px-4">
        <div className="flex flex-row gap-4">
          <div className="flex flex-row gap-2">
            <div>Subscriber Total</div>
            <div className="text-orange-400">
              {formatAmount(cashDeskFee[0]?.receivableCharge)}
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div>Discount Total</div>
            <div className="text-orange-400">
              {formatAmount(cashDeskFee[0]?.discountCharge)}
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div>Total</div>
            <div className="text-orange-400">
              {formatAmount(cashDeskFee[0]?.receivableCharge)}
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div>Payment Discount</div>
            <div className="text-orange-400">
              {formatAmount(cashDeskFee[0]?.discountCharge)}
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div>Receivables Total</div>
            <div className="text-orange-400">
              {formatAmount(cashDeskFee[0]?.receivableCharge)}
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowTable(!showTable)}
          className="hover:bg-primary-clarity transition-transform duration-300"
        >
          <motion.div
            animate={{ rotate: showTable ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <KeenIcon icon="down" />
          </motion.div>
        </Button>
      </div>

      {/* Animated Table Section */}
      <AnimatePresence initial={false}>
        {showTable && (
          <motion.div
            key="table"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <TermStep2Table cashDeskFee={cashDeskFee} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TermStep2Container;
