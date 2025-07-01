import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#00C49F','#FFBB28','#8884d8', '#82ca9d','#00C49F',  '#FF8042', '#FFBB28',];

const StatusReport = ({ data }) => {
    const statusAnalysisPieData = React.useMemo(() => {
        const statusCounts = {};
        data.forEach(item => {
            if (!statusCounts[item.statusName]) {
                statusCounts[item.statusName] = 0;
            }
            statusCounts[item.statusName] += item.chatCount;
        });

        const pieData = Object.entries(statusCounts).map(([statusName, count]) => ({
            name: statusName,
            value: count
        })).sort((a, b) => b.value - a.value);

        const topN = 5;
        if (pieData.length > topN) {
            const topStatus = pieData.slice(0, topN);
            const otherCount = pieData.slice(topN).reduce((sum, tag) => sum + tag.value, 0);
            topStatus.push({ name: 'Other', value: otherCount });
            return topStatus;
        }

        return pieData;
    }, [data]);

    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500">No Status analysis data available for this period.</p>;
    }

    return (
        <div className="report-card">
            <h3>Top Chat Status</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={statusAnalysisPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                        {statusAnalysisPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StatusReport;