import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BarChartOne() {
  const options: ApexOptions = {
    colors: ["#60a5fa"],
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
      categories: [
        "Communication",
        "Social Skills",
        "Emotional Reg",
        "Fine Motor",
        "Academics",
        "Self-Care",
      ],
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
      title: {
        text: undefined,
      },
      labels: {
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
      data: [75, 85, 60, 45, 90, 80],
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
