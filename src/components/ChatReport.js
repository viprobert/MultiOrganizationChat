import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area } from 'recharts';

const ChatReport = ({ data }) => {
    const chatVolumeByDate = React.useMemo(() => {
        const dailyData = {};
        data.forEach(item => {
            const date = new Date(item.date).toLocaleDateString(); 
            if (!dailyData[date]) {
                dailyData[date] = { date, totalChats: 0, totalDuration: 0 };
            }
            dailyData[date].totalChats += item.chatCount;
            dailyData[date].totalDuration += item.totalChatDurationMinutes;
        });
        return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [data]);

    const chatVolumeByChannel = React.useMemo(() => {
        const channelData = {};
        data.forEach(item => {
            if (!channelData[item.channelName]) {
                channelData[item.channelName] = { channelName: item.channelName, totalChats: 0 };
            }
            channelData[item.channelName].totalChats += item.chatCount;
        });
        return Object.values(channelData).sort((a, b) => b.totalChats - a.totalChats);
    }, [data]);

    const chatVolumeByDepartment = React.useMemo(() => {
        const departmentData = {};
        data.forEach(item => {
            if (!departmentData[item.departmentName]) {
                departmentData[item.departmentName] = { departmentName: item.departmentName, totalChats: 0 };
            }
            departmentData[item.departmentName].totalChats += item.chatCount;
        });
        return Object.values(departmentData).sort((a, b) => b.totalChats - a.totalChats);
    }, [data]);


    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500">No chat volume data available for this period.</p>;
    }

    return (
        <div className="report-grid">
            <div className="report-card">
                <h3>Daily Chat Volume Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chatVolumeByDate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="bumpX" dataKey="totalChats" stroke="#8884d8"  name="Total Chats" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="report-card">
                <h3>Chats by Channel</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart width={730} height={250} data={chatVolumeByChannel} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="channelName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalChats" fill="#82ca9d" name="Chats" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* <div className="report-card">
                <h3>Chats by Department/Team</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chatVolumeByDepartment}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="departmentName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalChats" fill="#ffc658" name="Chats" />
                    </BarChart>
                </ResponsiveContainer>
            </div> */}
            <div className="report-card">
                <h3>Chats by Department/Team</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart width={730} height={250} data={chatVolumeByDepartment}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="departmentName" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                        <Area type="monotone" dataKey="totalChats" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChatReport;