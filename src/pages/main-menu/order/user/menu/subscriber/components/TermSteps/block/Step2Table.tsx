import clsx from "clsx";
import { useState } from "react";
import { formatAmount } from "../../general";
import { Paymentprops } from "./TermStep2FirstPartContainer";
import { KeenIcon } from "@/components";

const collapseCls = (open: boolean) =>
  clsx(
    "grid transition-all duration-300 ease-in-out overflow-hidden",
    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
  );

const TermStep2Table = ({ cashDeskFee }: Paymentprops) => {
  const [openFirst, setOpenFirst] = useState<Record<number, boolean>>({});
  const [openSecond, setOpenSecond] = useState<Record<string, boolean>>({});
  const [openMain, setOpenMain] = useState<Record<string, boolean>>({});

  const toggleFirst = (idx: number) =>
    setOpenFirst((p) => ({ ...p, [idx]: !p[idx] }));

  const toggleMain = (idx: number) =>
    setOpenMain((p) => ({ ...p, [idx]: !p[idx] }));

  const toggleSecond = (key: string) =>
    setOpenSecond((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="grid grid-cols-8 text-sm font-semibold">
        <div>Offer Name</div>
        <div>Order Number</div>
        <div>Service Number</div>
        <div>Charge Name</div>
        <div>Subscriber Total</div>
        <div>Discount</div>
        <div>Total</div>
        <div>Account Number</div>
      </div>
      {cashDeskFee.map((main, m) => {
        const mainOpen = !openMain[m];

        return (
          <div key={m} className="flex flex-col gap-2">
            {/* FIRST LEVEL ROW */}
            <div
              onClick={() => toggleMain(m)}
              className="grid grid-cols-8 text-sm cursor-pointer"
            >
              <div className="flex flex-row gap-2">
                <KeenIcon
                  icon="right"
                  className={`transition-all duration-300 ${mainOpen ? "rotate-90" : "rotate-0"}`}
                />
                <div className="truncate " title="Customer Order">
                  Customer Order
                </div>
              </div>
              <div className="truncate"></div>
              <div className="truncate"></div>
              <div className="truncate"></div>
              <div className="truncate text-orange-400">
                {formatAmount(main.receivableCharge ?? 0)}
              </div>
              <div className="truncate text-primary">
                {formatAmount(main.discountCharge ?? 0)}
              </div>
              <div className="truncate text-orange-400">
                {formatAmount(
                  (main.receivableCharge ?? 0) - (main.discountCharge ?? 0),
                )}
              </div>
              <div className="truncate"></div>
            </div>

            {main.children.map((frst, i) => {
              const firstOpen = !openFirst[i];

              return (
                <div key={i} className="flex flex-col gap-2">
                  {/* FIRST LEVEL ROW */}
                  <div
                    onClick={() => toggleFirst(i)}
                    className="grid grid-cols-8 text-sm cursor-pointer"
                  >
                    <div className="flex flex-row gap-2 pl-4">
                      <KeenIcon
                        icon="right"
                        className={`transition-all duration-300 ${firstOpen ? "rotate-90" : "rotate-0"}`}
                      />
                      <div className="truncate " title={frst.subsPlanName}>
                        {frst.subsPlanName}
                      </div>
                    </div>
                    <div className="truncate">{frst.orderNbr}</div>
                    <div className="truncate">{frst.accNbr}</div>
                    <div className="truncate">{frst.subsEventName}</div>
                    <div className="truncate text-orange-400">
                      {formatAmount(frst.receivableCharge ?? 0)}
                    </div>
                    <div className="truncate text-primary">
                      {formatAmount(
                        (frst.receivableCharge ?? 0) -
                          (frst.receivedCharge ?? 0),
                      )}
                    </div>
                    <div className="truncate text-orange-400">
                      {formatAmount(frst.receivedCharge ?? 0)}
                    </div>
                    <div className="truncate">{frst.acctNbr}</div>
                  </div>

                  {/* FIRST LEVEL CHILDREN */}
                  <div className={collapseCls(firstOpen)}>
                    <div className="overflow-hidden flex flex-col gap-2">
                      {frst.children?.map((scnd) => {
                        const key = `${i}-${scnd.subOrderId}`;
                        const secondOpen = !openSecond[key];

                        return (
                          <div key={key} className="flex flex-col gap-2">
                            {/* SECOND LEVEL ROW */}
                            <div
                              onClick={() => toggleSecond(key)}
                              className="grid grid-cols-8 text-sm cursor-pointer  "
                            >
                              <div className="truncate pl-8 flex flex-row gap-2">
                                <KeenIcon
                                  icon="right"
                                  className={`transition-all duration-300 ${secondOpen ? "rotate-90" : "rotate-0"}`}
                                />
                                <div
                                  className="truncate"
                                  title={scnd.subsPlanName}
                                >
                                  {scnd.subsPlanName}
                                </div>
                              </div>
                              <div className="truncate">{scnd.subOrderId}</div>
                              <div />
                              <div className="truncate" title={scnd.priceName}>
                                {scnd.priceName}
                              </div>
                              <div className="truncate text-orange-400">
                                {formatAmount(scnd.receivableCharge)}
                              </div>
                              <div className="truncate text-primary">
                                {formatAmount(scnd.discountCharge)}
                              </div>
                              <div className="truncate text-orange-400">
                                {formatAmount(frst.receivedCharge)}
                              </div>
                              <div />
                            </div>

                            {/* THIRD LEVEL */}
                            <div className={collapseCls(secondOpen)}>
                              <div className="overflow-hidden  flex flex-col gap-2">
                                {scnd.children?.map((thrd, idx) => (
                                  <div
                                    key={idx}
                                    className="grid grid-cols-8 text-sm"
                                  >
                                    <div className="pl-4" />
                                    <div />
                                    <div />
                                    <div
                                      className="truncate"
                                      title={thrd.acctResName}
                                    >
                                      {thrd.acctResName}
                                    </div>
                                    <div className="truncate text-orange-400">
                                      {thrd.isOnceFee === "Y"
                                        ? formatAmount(thrd.receivableCharge)
                                        : thrd.receivableCharge}
                                    </div>
                                    <div className="truncate text-primary">
                                      {formatAmount(thrd.discountCharge)}
                                    </div>
                                    <div className="truncate text-orange-400">
                                      {thrd.isOnceFee === "Y"
                                        ? formatAmount(thrd.receivedCharge)
                                        : thrd.receivedCharge}
                                    </div>
                                    <div />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default TermStep2Table;
