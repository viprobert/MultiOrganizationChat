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

const ChatVolumeChart = React.memo(({ data }) => {
    const chartData = data.map(d => ({
        date: formatDateForChart(d.date),
        'Total Chat Volume': d.totalChatVolume
    }));

    return (
        <ChartCard title="Total Chat Volume">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" style={{ fontSize: '0.85em' }} /> 
                    <YAxis allowDecimals={false} style={{ fontSize: '0.85em' }} />
                    <Tooltip contentStyle={{ borderRadius: '5px', borderColor: '#ccc' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line
                        type="monotone"
                        dataKey="Total Chat Volume" 
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        strokeWidth={2} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    );
});

export default ChatVolumeChart;
