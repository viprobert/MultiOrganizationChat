import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PIE_COLORS = [ '#7bc528c9','#6178e1', '#00C49F', '#FFBB28', '#FF8042', '#00C49F', '#FFBB28'];

const TagReport = ({ data }) => {
    const tagAnalysisPieData = React.useMemo(() => {
        const tagCounts = {};
        data.forEach(item => {
            if (!tagCounts[item.tagName]) {
                tagCounts[item.tagName] = 0;
            }
            tagCounts[item.tagName] += item.chatCount;
        });

        const pieData = Object.entries(tagCounts).map(([tagName, count]) => ({
            name: tagName,
            value: count
        })).sort((a, b) => b.value - a.value);

        const topN = 5;
        if (pieData.length > topN) {
            const topTags = pieData.slice(0, topN);
            const otherCount = pieData.slice(topN).reduce((sum, tag) => sum + tag.value, 0);
            topTags.push({ name: 'Other', value: otherCount });
            return topTags;
        }

        return pieData;
    }, [data]);

    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500">No tag analysis data available for this period.</p>;
    }

    return (
        <div className="report-card">
            <h3>Top Chat Tags</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={tagAnalysisPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                        {tagAnalysisPieData.map((entry, index) => (
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

export default TagReport;