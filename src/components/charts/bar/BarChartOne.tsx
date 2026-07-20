import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface BarChartOneProps {
  data?: any[];
}

export default function BarChartOne({ data }: BarChartOneProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[250px] flex flex-col items-center justify-center text-gray-500 text-sm">
        <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>No IEP goal progress data available</p>
      </div>
    );
  }

  const dynamicCategories = data.map((d) => d.domainName);
  const dynamicData = data.map((d) => d.progressPercentage);

  const options: ApexOptions = {
    colors: ["#2DA0FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 250,
      toolbar: {
        show: false,
      },
      parentHeightOffset: 0,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "15%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: dynamicCategories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        }
      }
    },
    legend: {
      show: false,
    },
    yaxis: {
      min: 0,
      max: 100,
      title: {
        text: undefined,
      },
      labels: {
        formatter: (val: number) => `${val}%`,
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        }
      }
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      strokeDashArray: 4,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
      },
    },
  };
  const series = [
    {
      name: "On Track",
      data: dynamicData,
    },
  ];
  return (
    <div className="w-full">
      <div id="chartOne" className="w-full">
        <Chart options={options} series={series} type="bar" height={250} />
      </div>
    </div>
  );
}
