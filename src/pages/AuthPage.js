import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom'; 
import TwoFactorSetup from '../components/TwoFactorSetup';

const UserCircleIcon = () => (
    <svg style={{ marginRight: '0.5rem', color: '#007bff' }} viewBox="0 0 448 512" fill="currentColor" width="1em" height="1em"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7c0-98.5-79.8-178.3-178.3-178.3H224z" /></svg>
);

const SpinnerIcon = () => (
    <svg style={{ marginRight: '0.75rem' }} viewBox="0 0 512 512" fill="currentColor" width="1em" height="1em"><path d="M304 48a48 48 0 1 0 -96 0V136c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V48zm0 416a48 48 0 1 0 -96 0V376c0-13.3 10.7-24 24-24h48c13.3 0 24 10.7 24 24v88zM448 304a48 48 0 1 0 0-96H360c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h88zM64 208a48 48 0 1 0 0 96H152c13.3 0 24-10.7 24-24v-48c0-13.3-10.7-24-24-24H64zm384-64a48 48 0 1 0 -69.5 73.5L341.6 270.4c-11.4 11.4-11.4 29.9 0 41.3s29.9 11.4 41.3 0L422.4 250.4c17.4-17.4 45.4-17.4 62.7 0c17.4 17.4 17.4 45.4 0 62.7l-41.5 41.5c-11.4 11.4-11.4 29.9 0 41.3s29.9 11.4 41.3 0l41.5-41.5c45.2-45.2 45.2-118.3 0-163.5s-118.3-45.2-163.5 0L242.7 122.7c-11.4-11.4-29.9-11.4-41.3 0s-11.4 29.9 0 41.3L270.4 206.4c11.4 11.4 29.9 11.4 41.3 0s11.4-29.9 0-41.3L242.7 122.7zm-256 0c-11.4-11.4-29.9-11.4-41.3 0S16.4 194.8 16.4 206.1l41.5 41.5c11.4 11.4 11.4 29.9 0 41.3s-29.9 11.4-41.3 0L16.4 297.9c-45.2-45.2-45.2-118.3 0-163.5s118.3-45.2 163.5 0L270.4 242.7c11.4 11.4 29.9 11.4 41.3 0s11.4-29.9 0-41.3L206.4 16.4c-11.4-11.4-29.9-11.4-41.3 0s-11.4 29.9 0 41.3l41.5 41.5c11.4 11.4 11.4 29.9 0 41.3s-29.9 11.4-41.3 0L122.7 242.7c-45.2 45.2-45.2 118.3 0 163.5s118.3 45.2 163.5 0L297.9 45.2c11.4 11.4 29.9 11.4 41.3 0s11.4-29.9 0-41.3L206.4 16.4z" /></svg>
);


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

    const {
        user,
        login,
        loading,
        error,
        requiresTwoFactor,
        twoFactorEnabledForUser,
        twoFactorSetupData,
        completeForcedTwoFactorSetup,
        userIdFor2FA, 
        isAuthenticated,
        checkUserByEmail,
        resetPassword,
        forgotPasswordLoading
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

        const result = await completeForcedTwoFactorSetup(twoFactorCode, recoveryCode);

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

    const styles = {
        // container: {
        //     display: 'flex',
        //     alignItems: 'center',
        //     justifyContent: 'center',
        //     minHeight: '100vh',
        //     background: 'linear-gradient(to bottom right, #e0f2ff, #c3dafe)',
        //     padding: '1rem',
        //     fontFamily: 'Inter, sans-serif'
        // },
        // card: {
        //     backgroundColor: '#ffffff',
        //     borderRadius: '1rem',
        //     boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        //     padding: '2rem',
        //     maxWidth: '400px',
        //     width: '100%',
        //     boxSizing: 'border-box',
        // },
        // title: {
        //     fontSize: '1.875rem',
        //     fontWeight: 'bold',
        //     textAlign: 'center',
        //     color: '#333',
        //     marginBottom: '2rem',
        //     display: 'flex',
        //     alignItems: 'center',
        //     justifyContent: 'center'
        // },
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
        // button: {
        //     width: '100%',
        //     display: 'flex',
        //     justifyContent: 'center',
        //     alignItems: 'center',
        //     padding: '0.75rem 1rem',
        //     border: 'none',
        //     borderRadius: '0.5rem',
        //     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        //     color: 'white',
        //     backgroundColor: '#007bff',
        //     fontSize: '1.125rem',
        //     fontWeight: '500',
        //     cursor: 'pointer',
        //     transition: 'background-color 0.2s ease, transform 0.2s ease',
        // },
        // button1: {
        //     width: '100%',
        //     display: 'flex',
        //     justifyContent: 'center',
        //     alignItems: 'center',
        //     padding: '0.75rem 1rem',
        //     border: 'none',
        //     borderRadius: '0.5rem',
        //     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        //     color: 'white',
        //     backgroundColor: '#007bff',
        //     fontSize: '1.125rem',
        //     fontWeight: '500',
        //     cursor: 'pointer',
        //     transition: 'background-color 0.2s ease, transform 0.2s ease',
        //     marginTop: '2rem',
        // },
        // linkButton: {
        //     background: 'none',
        //     border: 'none',
        //     padding: 0,
        //     marginTop: '1rem',
        //     color: '#007bff',
        //     textDecoration: 'underline',
        //     cursor: 'pointer',
        //     fontSize: '0.9rem'
        // },
        errorMessage: {
            backgroundColor: '#ffe0e0',
            border: '1px solid #ffb3b3',
            color: '#cc0000',
            padding: '0.75rem 1rem',
            marginTop: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
        },
        // infoMessage: {
        //     fontSize: '0.9rem',
        //     color: '#666',
        //     textAlign: 'center',
        //     marginBottom: '1.5rem',
        // },
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
    } else if (requiresTwoFactor) {
        if (twoFactorEnabledForUser) {
            currentAuthStageUI = (
                <form onSubmit={handleTwoFactorVerificationSubmit} style={styles.form}>
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
                </form>
            );
        } else {
            currentAuthStageUI = (
                <TwoFactorSetup
                    otpAuthUri={twoFactorSetupData?.otpAuthUri}
                    manualKey={twoFactorSetupData?.secretKey}
                    onComplete={completeForcedTwoFactorSetup}
                />
            );
        }
    } else {
        currentAuthStageUI = (
            <form onSubmit={handleInitialLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 className='auth-title'>
                    <FontAwesomeIcon icon={faUser} style={{ fontSize: '2rem', marginRight: '0.75rem' }} bounce/>
                    Agent Login
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
