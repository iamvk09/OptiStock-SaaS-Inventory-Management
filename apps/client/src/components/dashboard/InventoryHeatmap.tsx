import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface InventoryHeatmapProps {
    data: { name: string; value: number }[];
}

const InventoryHeatmap: React.FC<InventoryHeatmapProps> = ({ data }) => {
    // Transforming simple category data into a treemap for "heatmap" visualization
    // as requested by "category-based" view.
    const options: ApexOptions = {
        chart: {
            height: 350,
            type: 'treemap',
            toolbar: { show: false }
        },
        title: {
            text: 'Stock Distribution by Category',
            align: 'center'
        },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        plotOptions: {
            treemap: {
                distributed: true,
                enableShades: false
            }
        }
    };

    const series = [
        {
            data: data.map(d => ({
                x: d.name,
                y: d.value
            }))
        }
    ];

    return (
        <div className="w-full h-full min-h-[300px]">
            <ReactApexChart options={options} series={series} type="treemap" height={320} />
        </div>
    );
};

export default InventoryHeatmap;
