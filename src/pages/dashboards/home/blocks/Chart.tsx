import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import { fCurrency } from '@/utils/FormatNumber';

interface Series {
  name: string;
  data: any[];
}

const Chart = ({
  title,
  toolbar,
  chartType,
  chartLegend,
  subtitle,
  number,
  count,
  chartData = []
}: any) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  let legendOpt = null;
  if (chartLegend == 'true') {
    legendOpt = true;
  } else {
    legendOpt = false;
  }
  const options: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%'
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: -10,
      offsetX: chartType === 'bar' ? 1.5 : 0,
      formatter: (value: any) => {
        if (count == 'sum') {
          return fCurrency(value);
        } else {
          return value;
        }
      }
    },
    markers: {
      size: 0,
      shape: 'circle'
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: 'var(--tw-gray-500)',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'var(--tw-gray-500)',
          fontSize: '12px'
        },
        formatter: (value: any) => {
          if (count == 'sum') {
            return fCurrency(value);
          } else {
            return value;
          }
        }
      }
    },
    grid: {
      borderColor: 'var(--tw-gray-200)',
      strokeDashArray: 5,
      padding: {
        top: 0,
        right: 0,
        bottom: 20,
        left: 0
      }
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: (value: any) => {
          if (count == 'sum') {
            return fCurrency(value);
          } else {
            return value;
          }
        }
      }
    },
    stroke: {
      show: true,
      curve: 'smooth',
      lineCap: 'butt',
      colors: undefined,
      width: 3,
      dashArray: 0
    },
    legend: {
      show: legendOpt,
      position: 'right',
      floating: false
    }
  };
  useEffect(() => {
    if (chartData && chartData.length !== 0) {
      const categories = chartData.map((item: any) => item.month);
      const statusNames = Object.keys(chartData[0]).filter((key) => key !== 'month');
      const series = statusNames.map((status) => {
        const cleanName = status
          .replace('_count', '')
          .replace(/_/g, ' ')
          .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
        return {
          name: cleanName,
          data: chartData.map((item: any) => item[status])
        };
      });
      setCategories(categories);
      setSeries(series);
    }
  }, [chartData]);

  return (
    <div className="card h-full">
      <div className="card-header border-0 ps-5 pb-0">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body flex flex-col gap-4 p-2 lg:p-b7.5 lg:pt-4">
        <div className="flex justify-between">
          <div className="flex flex-col w-full">
            <div className="ps-3">{toolbar && <div>{toolbar}</div>}</div>
            <span className="text-sm font-normal text-gray-700 mb-1">{subtitle}</span>
            <span className="text-3xl font-semibold text-gray-900 mb-0">{number}</span>
          </div>
        </div>
        <ApexChart
          id="earnings_chart" //
          options={options}
          series={series}
          type={chartType}
          legend={chartLegend}
          height={350}
        />
      </div>
    </div>
  );
};

export { Chart };
