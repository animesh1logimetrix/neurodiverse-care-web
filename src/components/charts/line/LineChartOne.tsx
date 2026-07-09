import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function LineChartOne() {
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
      categories: [
        "Mar 4", "Mar 5", "Mar 6", "Mar 7", "Mar 8", "Mar 9", 
        "Mar 10", "Mar 11", "Mar 12", "Mar 13", "Mar 14", "Mar 15"
      ],
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

  const series = [
    {
      name: "OT",
      data: [12, 18, 15, 20, 25, 22, 18, 14, 28, 25, 20, 15],
    },
    {
      name: "Speech",
      data: [8, 12, 25, 18, 20, 15, 22, 18, 12, 15, 20, 22],
    },
    {
      name: "ABA",
      data: [5, 8, 10, 12, 15, 10, 8, 12, 15, 18, 12, 10],
    },
  ];
  return (
    <div className="w-full">
      <div id="chartEight" className="w-full">
        <Chart options={options} series={series} type="area" height={250} />
      </div>
    </div>
  );
}
