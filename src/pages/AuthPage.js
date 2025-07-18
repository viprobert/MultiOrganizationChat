import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom'; 
import TwoFactorSetup from '../components/TwoFactorSetup';

const AuthPage = () => {
    const navigate = useNavigate();
     const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [tempMessage, setTempMessage] = useState(null);

    const [showForgotPasswordFlow, setShowForgotPasswordFlow] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState(''); 
    const [newPassword, setNewPassword] = useState('');
    const [otpForReset, setOtpForReset] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const [showRecoverTwoFactorFlow, setShowRecoverTwoFactorFlow] = useState(false);
    const [recoveryCodeInput, setRecoveryCodeInput] = useState('');

    const {
        user,
        login,
        loading,
        error,
        requiresTwoFactor,
        twoFactorEnabledForUser,
        twoFactorSetupData,
        completeForcedTwoFactorSetup,
        generateTwoFactorSetup,
        userIdFor2FA, 
        isAuthenticated,
        checkUserByEmail,
        resetPassword,
        forgotPasswordLoading,
        initiateTwoFactorRecovery
    } = useAuth();

    useEffect(() => {
        if (isAuthenticated && !loading  && !requiresTwoFactor) {
            if (location.pathname === '/' || location.pathname === '/login') {
                if (user?.permissions?.includes('dashboard_view')) {
                    navigate('/dashboard', { replace: true });
                } else if (user?.permissions?.includes('chat_view')) {
                    navigate('/chat', { replace: true });
                } else if (user?.permissions?.includes('organization_view')) {
                    navigate('/organization', { replace: true });
                } else if (user?.permissions?.includes('channel_view')) {
                    navigate('/channel', { replace: true });
                } else if (user?.permissions?.includes('users_view')) {
                    navigate('/users', { replace: true });
                } else if (user?.permissions?.includes('userrole_view')) {
                    navigate('/user-roles', { replace: true });
                } else if (user?.permissions?.includes('permissions_view')) {
                    navigate('/permission', { replace: true });
                } else if (user?.permissions?.includes('tags_view')) {
                    navigate('/tags', { replace: true });
                } else if (user?.permissions?.includes('teams_view')) {
                    navigate('/teams', { replace: true });
                } else if (user?.permissions?.includes('assign_chat')) {
                    navigate('/assign-chat', { replace: true });
                } else {
                    console.warn("User is authenticated but has no default view permissions.");
                }
            }
        }
    }, [loading, isAuthenticated, user, requiresTwoFactor, navigate, location.pathname]); 

    const handleInitialLoginSubmit = async (e) => {
        e.preventDefault();
        setTempMessage(null);
        const result = await login(username, password);
        if (result.status === '2FA_SETUP_REQUIRED' || result.status === '2FA_VERIFICATION_REQUIRED') {
            setTempMessage(result.message);
        } else if (result.status === 'LOGIN_FAILED') {
            setTempMessage(result.message || "Login attempt failed.");
        }
    };

    const handleTwoFactorVerificationSubmit = async (e) => {
        e.preventDefault();
        setTempMessage(null);

        if (!userIdFor2FA) {
            setTempMessage("User ID not available for 2FA verification. Please try logging in again.");
            return;
        }

        const result = await completeForcedTwoFactorSetup(twoFactorCode);

        if (result.success) {
            setTwoFactorCode('');
            setRecoveryCode('');
            setTempMessage(result.message);
        } else {
            setTempMessage(result.message || "2FA verification failed.");
        }
    };

    const handleForgotPasswordEmailSubmit = async (e) => {
        e.preventDefault();
        setTempMessage(null);

        const result = await checkUserByEmail(forgotPasswordEmail);

        if (result.success) {
            setTempMessage(result.message);
            setOtpSent(true);
        } else {
            setTempMessage(result.message || "Failed to send OTP.");
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setTempMessage(null);

        if (newPassword.length < 6) { 
            setTempMessage("Password must be at least 6 characters long.");
            return;
        }

        const result = await resetPassword(forgotPasswordEmail, otpForReset, newPassword);

        if (result.success) {
            setTempMessage(result.message + " Redirecting to login...");
            setShowForgotPasswordFlow(false);
            setForgotPasswordEmail('');
            setNewPassword('');
            setOtpForReset('');
            setOtpSent(false);
            setTimeout(() => {
                setTempMessage(null);
                navigate('/login');
            }, 1500); 
        } else {
            setTempMessage(result.message || "Password reset failed. Please check your OTP or try again.");
        }
    };

    const handleRecoverTwoFactorSubmit = async (e) => {
        e.preventDefault();
        setTempMessage(null);

        if (!userIdFor2FA) {
            setTempMessage("User ID not available for 2FA recovery. Please try logging in again.");
            return;
        }

        const result = await initiateTwoFactorRecovery(userIdFor2FA, recoveryCodeInput);

        if (result.success) {
            setTempMessage(result.message);
            setRecoveryCodeInput(''); 
            setShowRecoverTwoFactorFlow(false); 
        } else {
            setTempMessage(result.message || "2FA recovery failed. Please check your recovery code.");
        }
    };

    const styles = {
        label: {
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#555',
            marginBottom: '0.25rem'
        },
        input: {
            display: 'block',
            width: 'calc(100% - 2rem)',
            padding: '0.75rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
        },
        errorMessage: {
            backgroundColor: '#ffe0e0',
            border: '1px solid #ffb3b3',
            color: '#cc0000',
            padding: '0.75rem 1rem',
            marginTop: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
        }
    };

    let currentAuthStageUI;

    if (showForgotPasswordFlow) {
        if (!otpSent) {
            currentAuthStageUI = (
                <form onSubmit={handleForgotPasswordEmailSubmit} style={styles.form}>
                    <h2 className='auth-title'>Forgot Password</h2>
                    <p className='auth-infomessage'>Enter your email to receive a One-Time Password.</p>
                    <div>
                        <label htmlFor="forgotEmail" style={styles.label}>Email</label>
                        <input
                            type="email"
                            id="forgotEmail"
                            name="forgotEmail"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            style={styles.input}
                            placeholder="your@example.com"
                            required
                            disabled={forgotPasswordLoading}
                        />
                    </div>
                    {(tempMessage) && (
                        <div style={styles.errorMessage} role="alert">
                            <span>{tempMessage}</span>
                        </div>
                    )}
                    <button
                        type="submit"
                        className='auth-button'
                        style={{ backgroundColor: forgotPasswordLoading ? '#a0c0e0' : '#007bff' }}
                        disabled={forgotPasswordLoading}
                    >
                        {forgotPasswordLoading ? <FontAwesomeIcon icon={faSpinner} style={{ fontSize: '2rem', marginRight: '0.75rem' }} spin/>: 'Send OTP'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setShowForgotPasswordFlow(false); setTempMessage(null); setForgotPasswordEmail(''); }}
                        className='auth-linkbutton'
                        style={{  marginTop: '1.5rem' }}
                    >
                        Back to Login
                    </button>
                </form>
            );
        } else {
            currentAuthStageUI = (
                <form onSubmit={handleResetPasswordSubmit} style={styles.form}>
                    <h2 className='auth-title'>Reset Password</h2>
                    <p className='auth-infomessage'>An OTP has been sent to {forgotPasswordEmail}. Enter it below with your new password.</p>
                    <div>
                        <label htmlFor="otpForReset" style={styles.label} >One-Time Password</label>
                        <input
                            type="text"
                            id="otpForReset"
                            value={otpForReset}
                            onChange={(e) => setOtpForReset(e.target.value)}
                            style={styles.input}
                            placeholder="Enter OTP"
                            required
                            disabled={forgotPasswordLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword" style={styles.label}>New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Enter new password"
                            required
                            disabled={forgotPasswordLoading}
                        />
                    </div>
                    {( tempMessage) && (
                        <div style={styles.errorMessage} role="alert">
                            <span>{tempMessage}</span>
                        </div>
                    )}
                    <button
                        type="submit"
                        className='auth-button'
                        style={{ backgroundColor: forgotPasswordLoading ? '#a0c0e0' : '#007bff' }}
                        disabled={forgotPasswordLoading}
                    >
                        {forgotPasswordLoading ? <FontAwesomeIcon icon={faSpinner} style={{ fontSize: '2rem', marginRight: '0.75rem' }} spin/> : 'Reset Password'}
                    </button>
                    {/* <button
                        type="button"
                        onClick={() => {
                            setOtpSent(false);
                            setTempMessage(null);
                            setOtpForReset('');
                            setNewPassword('');
                        }}
                        style={{...styles.linkButton, marginRight: '7rem'}}
                    >
                        Back to Email Input
                    </button> */}
                    <button
                        type="button"
                        onClick={() => {
                            setShowForgotPasswordFlow(false);
                            setTempMessage(null);
                            setForgotPasswordEmail('');
                            setOtpSent(false);
                            setOtpForReset('');
                            setNewPassword('');
                        }}
                        className='auth-linkbutton'
                        style={{ marginTop: '0.5rem' }}
                    >
                        Back to Login
                    </button>
                </form>
            );
        }
    }
    else if (showRecoverTwoFactorFlow) {
        currentAuthStageUI = (
            <form onSubmit={handleRecoverTwoFactorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 className='auth-title'>Recover Two-Factor Authentication</h2>
                <p className='auth-infomessage'>Enter your recovery code to set up a new authenticator.</p>
                <div>
                    <label htmlFor="recoveryCodeInput" style={styles.label}>Recovery Code:</label>
                    <input
                        type="text"
                        id="recoveryCodeInput"
                        value={recoveryCodeInput}
                        onChange={(e) => setRecoveryCodeInput(e.target.value)}
                        placeholder="Enter your recovery code"
                        style={styles.input}
                        required
                        disabled={loading}
                    />
                </div>
                {(error || tempMessage) && <div style={styles.errorMessage} role="alert"><span>{error || tempMessage}</span></div>}
                <button type="submit" className='auth-button' style={{ backgroundColor: loading ? '#a0c0e0' : '#007bff' }} disabled={loading}>
                    {loading ? <FontAwesomeIcon icon={faSpinner} style={{ fontSize: '2rem', marginRight: '0.75rem' }} spin/> : 'Recover 2FA'}
                </button>
                <button
                    type="button"
                    onClick={() => { setShowRecoverTwoFactorFlow(false); setTempMessage(null); setRecoveryCodeInput(''); }}
                    className='auth-linkbutton'
                    style={{ marginTop: '0.5rem' }}
                >
                    Back to 2FA Verification
                </button>
            </form>
        );
    }  
    else if (requiresTwoFactor) {
        if (twoFactorEnabledForUser) {
            currentAuthStageUI = (
                <form onSubmit={handleTwoFactorVerificationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h2 className='auth-title'>Two-Factor Authentication Required</h2>
                    <p className='auth-infomessage'>Please enter the 6-digit code from your authenticator app.</p>
                    <div>
                        <label htmlFor="twoFactorCode" style={styles.label}>2FA Code:</label>
                        <input
                            type="text"
                            id="twoFactorCode"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            placeholder="e.g., 123456"
                            style={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>
                    {/* <div>
                        <label htmlFor="recoveryCode" className='auth-label'>Recovery Code (Contact Admin if needed):</label>
                        <input
                            type="text"
                            id="recoveryCode"
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            placeholder="Not for user self-recovery in this system"
                            style={styles.input}
                            disabled={loading}
                        />
                    </div> */}
                    {(error || tempMessage) && <div style={styles.errorMessage} role="alert"><span>{error || tempMessage}</span></div>}
                    <button type="submit" className='auth-button' style={{ backgroundColor: loading ? '#a0c0e0' : '#007bff' }} disabled={loading}>
                        {loading ? <FontAwesomeIcon icon={faSpinner} style={{ fontSize: '2rem', marginRight: '0.75rem' }} spin/> : 'Verify and Login'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setShowRecoverTwoFactorFlow(true); setTempMessage(null); setTwoFactorCode(''); }}
                        className='auth-linkbutton'
                        style={{ marginTop: '1.5rem' }}
                    >
                        Recover 2FA
                    </button>
                </form>
            );
        } else {
            currentAuthStageUI = (
                <TwoFactorSetup
                    otpAuthUri={twoFactorSetupData?.otpAuthUri}
                    manualKey={twoFactorSetupData?.secretKey}
                    recoveryCode={twoFactorSetupData?.recoveryCode}
                    onComplete={completeForcedTwoFactorSetup}
                />
            );
        }
    } else {
        currentAuthStageUI = (
            <form onSubmit={handleInitialLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 className='auth-title'>
                    <FontAwesomeIcon icon={faUser} style={{ fontSize: '2rem', marginRight: '0.75rem' }} bounce/>
                    Login
                </h2>
                <div>
                    <label htmlFor="username" style={styles.label}>Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.input}
                        placeholder="Enter your username"
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="password" style={styles.label}>Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                    />
                </div>

                {(error || tempMessage) && (
                    <div style={styles.errorMessage} role="alert">
                        <span>{error || tempMessage}</span>
                    </div>
                )}

                <button
                    type="submit"
                    className='tfa-button'
                    style={{
                        backgroundColor: loading ? '#a0c0e0' : '#007bff',
                        transform: loading ? 'scale(1.0)' : 'scale(1.0)'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = loading ? '#a0c0e0' : '#0056b3'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = loading ? '#a0c0e0' : '#007bff'}
                    disabled={loading}
                >
                    {loading ? (
                        <FontAwesomeIcon icon={faSpinner} style={{ fontSize: '2rem', marginRight: '0.75rem' }} spin/>
                    ) : 'Proceed to 2FA'}
                </button>

                <button
                    type="button"
                    onClick={() => { setShowForgotPasswordFlow(true); setTempMessage(null); }}
                    className='auth-linkbutton'
                >
                    Forgot Password?
                </button>
            </form>
        );
    }

    return (
        <div className='auth-container'>
            <div className='auth-card'>
                {currentAuthStageUI}
            </div>
        </div>
    );
};

export default AuthPage;
