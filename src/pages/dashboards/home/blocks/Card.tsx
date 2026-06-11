import { useLanguage } from '@/i18n';
import { fCurrency } from '@/utils/FormatNumber';
import { toAbsoluteUrl } from '@/utils/Assets';

interface CardDataProduct {
  title: string;
  total: string;
  quantity: string;
  type: Array<{ label: string; value: string; total: string }>;
  count: 'sum' | 'count';
}

const Card = ({ title, total, type, count, quantity }: CardDataProduct) => {
  const { isRTL } = useLanguage();

  return (
    <div className="card h-full bg-[length:85%] bg-[length:85%] [background-position:9rem_-4rem] rtl:[background-position:-4rem_-4rem] bg-no-repeat channel-stats-bg">
      <div className="card-body flex flex-col gap-4 p-5 lg:p-b-7.5 lg:pt-4">
        <div className="flex justify-between">
          <div className="flex flex-col w-8/12" style={{ background: '' }}>
            <span className="text-sm font-normal text-gray-600">{title}</span>
            {/* <span className="text-sm font-normal text-gray-600 mb-5">{quantity} Product</span> */}
            <span className="text-3xl font-semibold text-gray-900 mb-0">
              {count === 'sum' ? fCurrency(total) : total}
            </span>
          </div>
          <div className="flex flex-col w-4/12 justify-between" style={{ background: '' }}>
            <img
              src={toAbsoluteUrl('/media/file-types/chart.svg')}
              className="dark:hidden h-8"
              alt="Chart Icon"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Card };
