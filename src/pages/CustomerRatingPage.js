import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSpinner } from '@fortawesome/free-solid-svg-icons';
//import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { customerRatingApi } from '../api/chats';


const CustomerRatingPage = () => {
    const [orgId, setOrgId] = useState('');
    const [chatId, setChatId] = useState('');
    const [agentId, setAgentId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [platform, setPlatform] = useState('');
    const [rate, setRate] = useState(0);
    const [remark, setRemark] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null); 

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        setOrgId(queryParams.get('OrgId') || '');
        setChatId(queryParams.get('ChatId') || '');
        setAgentId(queryParams.get('AgentId') || '');
        setCustomerName(queryParams.get('customerName') || '');
        setCustomerId(queryParams.get('customerId') || '');
        setPlatform(queryParams.get('platform') || '');

        if (!queryParams.get('OrgId') || !queryParams.get('ChatId') || !queryParams.get('AgentId')) {
            setSubmissionStatus('error_params');
        }
    }, []);

    const handleStarClick = (selectedRate) => {
        setRate(selectedRate);
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesomeIcon
                    key={i}
                    icon={i <= rate ? faStar : faStar} 
                    onClick={() => handleStarClick(i)}
                    style={{
                        cursor: 'pointer',
                        fontSize: '2rem',
                        color: i <= rate ? '#ffc107' : '#e4e5e9',
                        transition: 'color 0.2s',
                        marginRight: '0.25rem'
                    }}
                />
            );
        }
        return stars;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus('submitting');
        setIsLoading(true);

        if (submissionStatus === 'error_params' || !orgId || !chatId || !agentId || rate === 0) {
            setSubmissionStatus('error');
            alert('Please provide a rating (1-5 stars) and ensure all necessary chat details are present.');
            setIsLoading(false);
            return;
        }

        const payload = {
            orgId: orgId,
            chatId: chatId,
            agentId: agentId,
            rate: rate,
            remark: remark,
            customerName: customerName,
            customerId: customerId,
            platform: platform
        };

        console.log("Submitting Rating Payload:", payload);

        try {
            const response = await customerRatingApi(payload); 
                setSubmissionStatus('success');
                setRate(0);
                setRemark('');
                setTimeout(() => {
                    window.close();
                }, 2500);
        } catch (error) {
            setSubmissionStatus('error');
            console.error("Error during rating submission:", error);
            alert('An error occurred while submitting your rating. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (submissionStatus === 'error_params') {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fef3f2', color: '#ef4444', border: '1px solid #f87171', borderRadius: '0.5rem', margin: '2rem auto', maxWidth: '600px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Missing Chat Details!</h2>
                <p style={{ fontSize: '1.125rem' }}>It looks like some essential information (like Organization ID, Chat ID, or Agent ID) is missing from the URL.</p>
                <p style={{ fontSize: '1.125rem', marginTop: '0.5rem' }}>Please ensure you navigate to this page from a valid chat link.</p>
                <p style={{ fontSize: '0.875rem', marginTop: '1rem', color: '#b91c1c' }}>Check your URL: {window.location.href}</p>
            </div>
        );
    }

    return (
        <div style={{ 
            fontFamily: 'Inter, sans-serif', 
            minHeight: '100vh', 
            backgroundColor: '#f0f2f5', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '2rem' 
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', marginBottom: '1.5rem' }}>Rate Your Agent</h1>
                
                <p style={{ fontSize: '1rem', color: '#555', marginBottom: '1rem' }}>
                    Customer: <strong style={{ color: '#007bff' }}>{customerName || 'N/A'}</strong>
                </p>
                <p style={{ fontSize: '0.875rem', color: '#777', marginBottom: '1.5rem' }}>
                    Chat ID: {chatId.substring(0, 8)}... | Agent ID: {agentId.substring(0, 8)}...
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Your Rating:</label>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {renderStars()}
                        </div>
                        {rate === 0 && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>Please select a star rating.</p>}
                    </div>

                    <div>
                        <label htmlFor="remark" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Remarks (Optional):</label>
                        <textarea
                            id="remark"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Share your feedback..."
                            rows="4"
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.5rem', resize: 'vertical' }}
                            disabled={isLoading}
                        ></textarea>
                    </div>

                    {submissionStatus === 'submitting' && (
                        <div style={{ color: '#007bff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                            <FontAwesomeIcon icon={faSpinner} spin /> 
                            Submitting...
                        </div>
                    )}
                    {submissionStatus === 'success' && (
                        <div style={{ backgroundColor: '#d1e7dd', color: '#0f5132', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #badbcc', marginTop: '1rem' }}>
                            Thank you for your feedback!
                        </div>
                    )}
                    {submissionStatus === 'error' && (
                        <div style={{ backgroundColor: '#fef3f2', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #f87171', marginTop: '1rem' }}>
                            Failed to submit rating. Please try again.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || rate === 0} 
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginTop: '1rem',
                            opacity: (isLoading || rate === 0) ? 0.6 : 1,
                        }}
                        onMouseOver={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#0056b3'; }}
                        onMouseOut={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#007bff'; }}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomerRatingPage;
