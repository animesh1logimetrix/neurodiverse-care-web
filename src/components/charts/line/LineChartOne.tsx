import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface LineChartOneProps {
  data?: {
    categories: string[];
    series: { name: string; data: number[] }[];
  };
}

export default function LineChartOne({ data }: LineChartOneProps) {
  if (!data || !data.series || data.series.length === 0) {
    return (
      <div className="w-full h-[250px] flex flex-col items-center justify-center text-gray-500 text-sm">
        <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>No session frequency data available</p>
      </div>
    );
  }

  const dynamicCategories = data.categories;
  const dynamicSeries = data.series;

  const options: ApexOptions = {
    legend: {
      show: false, // Hide legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3b82f6", "#a855f7", "#f97316"], // OT, Speech, ABA colors
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 250,
      type: "area", // Set the chart type to 'area'
      toolbar: {
        show: false, // Hide chart toolbar
      },
      parentHeightOffset: 0,
    },
    stroke: {
      curve: "smooth", // Define the line style (straight, smooth, or step)
      width: [2, 2, 2], // Line width for each dataset
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.15,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: "#fff", // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true, // Enable tooltip
      shared: true,
      intersect: false,
    },
    xaxis: {
      type: "category", // Category-based x-axis
      categories: dynamicCategories,
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
      tooltip: {
        enabled: false, // Disable tooltip for x-axis points
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px", // Adjust font size for y-axis labels
          colors: ["#6B7280"], // Color of the labels
        },
      },
      title: {
        text: "", // Remove y-axis title
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  return (
    <div className="w-full">
      <div id="chartEight" className="w-full">
        <Chart options={options} series={dynamicSeries} type="area" height={250} />
      </div>
    </div>
  );
}
