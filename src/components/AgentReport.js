import React from 'react';

const AgentReport = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500">No agent performance data available for this period.</p>;
    }

    return (
        <div className="agent-performance-table-container" >
            <table className="agent-performance-table">
                <thead>
                    <tr>
                        <th scope="col">Agent</th>
                        <th scope="col">Chats Handled</th>
                        <th scope="col">Avg. Response (s)</th>
                        <th scope="col">Resolution Rate (%)</th>
                        <th scope="col">Avg. CSAT</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((agent) => (
                        <tr key={agent.agentId}>
                            <td>{agent.agentName}</td>
                            <td>{agent.numberOfChatsHandled}</td>
                            <td>{agent.averageResponseTime.toFixed(2)}</td>
                            <td>{(agent.resolutionRate * 100).toFixed(1)}%</td>
                            <td>{agent.averageCSATScore ? agent.averageCSATScore.toFixed(2) : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AgentReport;