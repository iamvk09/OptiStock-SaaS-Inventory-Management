import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface SalesTrendsProps {
    data: { label: string; value: number }[];
}

const SalesTrends: React.FC<SalesTrendsProps> = ({ data }) => {
    const options: ApexOptions = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
            categories: data.map(d => d.label),
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                formatter: (value) => `$${value.toLocaleString()}`
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100]
            }
        },
        colors: ['#8b5cf6'], // Purple
        grid: {
            borderColor: '#f1f1f1',
        },
        tooltip: {
            y: {
                formatter: (value) => `$${value.toLocaleString()}`
            }
        }
    };

    const series = [{
        name: 'Sales',
        data: data.map(d => d.value)
    }];

    return (
        <div className="w-full h-full min-h-[300px]">
            <ReactApexChart options={options} series={series} type="area" height={320} />
        </div>
    );
};

export default SalesTrends;
