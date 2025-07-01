import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem', color: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
            <h1>404 - Page Not Found</h1>
            <p>Oops! The page you are looking for does not exist.</p>
            <Link to="/dashboard" style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold' }}>
                Go to Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;
