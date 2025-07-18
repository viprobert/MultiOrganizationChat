import React, { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 

function TwoFactorSetup({ otpAuthUri, manualKey, recoveryCode, onComplete }) {
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
            
            {recoveryCode && (
                <>
                    <p className='tfa-manualentry' style={{ marginTop: '1.5rem' }}>Your **Recovery Code**. Keep it safe and secure!</p>
                    <p className='tfa-manualentrykey'><strong>{recoveryCode}</strong></p>
                </>
            )}
            
            {message && <p className='tfa-message' style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
}

export default TwoFactorSetup;
