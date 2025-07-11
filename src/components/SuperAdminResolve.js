import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartCard from './SuperAdminChartCard';

const formatDateForChart = (isoDateString) => {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ResolvedCountChart = React.memo(({ data }) => {

    const chartData = data.map(d => ({
        date: formatDateForChart(d.date),
        'Resolved Chats': d.resolvedCount
    }));

    return (
        <ChartCard title="Resolved Chats">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" style={{ fontSize: '0.85em' }} />
                    <YAxis allowDecimals={false} style={{ fontSize: '0.85em' }} />
                    <Tooltip contentStyle={{ borderRadius: '5px', borderColor: '#ccc' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line
                        type="monotone"
                        dataKey="Resolved Chats"
                        stroke="#82ca9d"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

export default ResolvedCountChart;
