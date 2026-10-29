import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface WarehouseUtilizationProps {
    data: { name: string; utilization: number; capacity: number; stock_count: number }[];
}

const WarehouseUtilization: React.FC<WarehouseUtilizationProps> = ({ data }) => {
    const options: ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                dataLabels: {
                    position: 'top',
                },
            }
        },
        dataLabels: {
            enabled: true,
            offsetX: -6,
            style: {
                fontSize: '12px',
                colors: ['#fff']
            },
            formatter: function (val) {
                return val + '%';
            }
        },
        xaxis: {
            categories: data.map(d => d.name),
            max: 100
        },
        colors: ['#10b981'], // Emerald
        tooltip: {
            y: {
                formatter: function (val, { dataPointIndex }) {
                    const d = data[dataPointIndex];
                    return `${val}% (${d.stock_count.toLocaleString()} / ${d.capacity.toLocaleString()} units)`;
                }
            }
        }
    };

    const series = [{
        name: 'Utilization',
        data: data.map(d => d.utilization)
    }];

    return (
        <div className="w-full h-full min-h-[300px]">
            <ReactApexChart options={options} series={series} type="bar" height={320} />
        </div>
    );
};

export default WarehouseUtilization;
