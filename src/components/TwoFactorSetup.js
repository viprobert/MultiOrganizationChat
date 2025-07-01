import React, { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 

function TwoFactorSetup({ otpAuthUri, manualKey, onComplete }) {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerifySetup = async () => {
        setMessage('');
        setIsLoading(true);

        try {
            const result = await onComplete(code);
            setIsLoading(false);

            if (result.success) {
                setMessage('2FA successfully enabled and logged in! Redirecting...');
            } else {
                setMessage(result.message || 'Verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during 2FA setup verification:', error);
            setMessage('An unexpected error occurred during 2FA setup verification. Please try again.');
            setIsLoading(false);
        }
    };

    const styles = {
        // container: {
        //     textAlign: 'center',
        //     padding: '2rem',
        //     border: '1px solid #e0e0e0',
        //     borderRadius: '8px',
        //     maxWidth: '450px',
        //     width: '100%',
        //     margin: '2rem auto',
        //     boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        //     backgroundColor: '#fff',
        //     fontFamily: 'Inter, sans-serif'
        // },
        // paragraph: {
        //     fontSize: '0.95rem',
        //     color: '#666',
        //     marginBottom: '1rem',
        // },
        // qrCodeWrapper: {
        //     margin: '1.5rem 0',
        //     display: 'flex',
        //     justifyContent: 'center',
        // },
        // manualEntryText: {
        //     fontSize: '0.9rem',
        //     color: '#555',
        //     marginTop: '1rem',
        // },
        // manualEntryKey: {
        //     fontWeight: 'bold',
        //     wordBreak: 'break-all',
        //     backgroundColor: '#f8f8f8',
        //     padding: '0.5rem',
        //     borderRadius: '4px',
        //     margin: '0.5rem auto',
        //     display: 'inline-block',
        // },
        // input: {
        //     width: 'calc(100% - 20px)',
        //     padding: '0.8rem 10px',
        //     margin: '1rem 0',
        //     borderRadius: '4px',
        //     border: '1px solid #ddd',
        //     fontSize: '1rem',
        // },
        // button: {
        //     padding: '0.75rem 1.5rem',
        //     backgroundColor: '#007bff',
        //     color: 'white',
        //     border: 'none',
        //     borderRadius: '4px',
        //     cursor: 'pointer',
        //     fontSize: '1rem',
        //     transition: 'background-color 0.3s ease',
        //     width: '100%',
        // },
        // message: {
        //     marginTop: '1rem',
        //     padding: '0.7rem',
        //     borderRadius: '4px',
        //     backgroundColor: '#f0f0f0',
        // },
    };

    return (
        <div className='tfa-container' >
            <h3>Set Up Two-Factor Authentication</h3>
            <p className='tfa-paragraph'>Scan this QR code with your authenticator app (e.g., Google Authenticator, Microsoft Authenticator).</p>

            {otpAuthUri && (
                <div className='tfa-qrcodewrapper'>
                    <QRCodeSVG value={otpAuthUri} size={200} level="H" renderAs="svg" />
                </div>
            )}

            <p className='tfa-manualentry'>Or manually enter the key:</p>
            <p className='tfa-manualentrykey'><strong>{manualKey}</strong></p>

            <input
                type="text"
                placeholder="Enter 6-digit code from app"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className='tfa-input'
                disabled={isLoading}
            />
            <button onClick={handleVerifySetup} disabled={isLoading} className='tfa-button'>
                {isLoading ? 'Verifying...' : 'Verify and Complete Setup'}
            </button>

            {message && <p className='tfa-message' style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
}

export default TwoFactorSetup;
