import React from 'react';

const ChartCard = ({ title, children }) => (
    <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        marginBottom: '20px',
        flex: '1', 
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }}>
        <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#333', fontSize: '1.2em' }}>{title}</h3>
        <div style={{ width: '100%', height: '250px' }}>
            {children}
        </div>
    </div>
);

export default ChartCard;