import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, completeTwoFactorSetupApi, recoverTwoFactorApi,  forgetPasswordApi, setAccessToken, clearAuthTokens, setRefreshToken  } from '../api/auth';
import { checkUserApi } from '../api/user';
const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = sessionStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;

            if (parsedUser && parsedUser.token){
                setAccessToken(parsedUser.token);
            }
            else{
                clearAuthTokens();
            }
            return parsedUser;
        } catch (error) {
            console.error("Failed to parse user from session storage:", error);
            clearAuthTokens();
            sessionStorage.removeItem('user');
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [twoFactorEnabledForUser, setTwoFactorEnabledForUser] = useState(false);
    const [twoFactorSetupData, setTwoFactorSetupData] = useState(null);
    const [userIdFor2FA, setUserIdFor2FA] = useState(null);
    const [refToken, setRefToken]= useState(null);

    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [forgotPasswordError, setForgotPasswordError] = useState(null);

    useEffect(() => {
        if (user && user.token) {
            setAccessToken(user.token);
        } else {
            clearAuthTokens();
        }
    }, [user]);

    useEffect(() => {
        setRefreshToken(refToken);
    }, [refToken]);

    const login = useCallback(async (username, password, twoFactorCode = null, recoveryCode = null) => {
        setLoading(true);
        setError(null);
        setTwoFactorSetupData(null);

        try {
            const response = await loginApi(username, password, twoFactorCode, recoveryCode);

            if (response.requiresTwoFactor) {
                setRequiresTwoFactor(true);
                setTwoFactorEnabledForUser(response.twoFactorEnabledForUser);
                setUserIdFor2FA(response.userId);

                if (!response.twoFactorEnabledForUser) {
                    setTwoFactorSetupData(response.twoFactorSetupData);
                    setLoading(false);
                    return { success: true, status: '2FA_SETUP_REQUIRED', message: response.message || 'Two-factor authentication setup required.' };
                } else {
                    setLoading(false);
                    return { success: true, status: '2FA_VERIFICATION_REQUIRED', message: response.message || 'Two-factor authentication code required.' };
                }
            } else {
                setLoading(false);
                setError("Login requires 2FA, but an unexpected response was received.");
                return { success: false, status: 'LOGIN_FAILED', message: 'Unexpected login state. Please try again.' };
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred during login.';
            setError(errorMessage);
            setLoading(false);
            return { success: false, status: 'LOGIN_FAILED', message: errorMessage };
        }
    }, []);

    const completeForcedTwoFactorSetup = useCallback(async (code) => {
        setLoading(true);
        setError(null);
        try {
            if (!userIdFor2FA) {
                throw new Error("User ID not available for 2FA setup/verification completion. Cannot proceed.");
            }
            const data = await completeTwoFactorSetupApi(userIdFor2FA, code);
            const userData = {
                userId: data.userId,
                userName: data.userName,
                orgId: data.orgId,
                orgName: data.orgName,
                roleName: data.roleName,
                isOnline: data.isOnline,
                teamId: data.teamId,
                token: data.token,
                permissions: data.permissions,
                isSuperAdmin: data.isSuperAdmin
            };
            setUser(userData);
            sessionStorage.setItem('user', JSON.stringify(userData));
            setAccessToken(userData.token);
            setRefToken(data.refreshToken);

            setRequiresTwoFactor(false);
            setTwoFactorEnabledForUser(false);
            setTwoFactorSetupData(null);
            setUserIdFor2FA(null);

            setLoading(false);
            return { success: true, message: '2FA verification complete. You are now logged in!' };
        } catch (err) {
            console.error("2FA setup/verification API error:", err);
            const errorMessage = err.message || "Failed to complete 2FA setup/verification.";
            setError(errorMessage);
            setLoading(false);
            return { success: false, message: errorMessage };
        }
    }, [userIdFor2FA]);

    const logout = useCallback(() => {
        setUser(null);
        sessionStorage.removeItem('user');
        clearAuthTokens();
        setRequiresTwoFactor(false);
        setTwoFactorEnabledForUser(false);
        setTwoFactorSetupData(null);
        setUserIdFor2FA(null);
    }, []);

    const checkUserByEmail = useCallback(async (email) => {
        setForgotPasswordLoading(true);
        setForgotPasswordError(null);
        try {
            const response = await checkUserApi(email);
            setForgotPasswordLoading(false);
            return { success: true };
        } catch (err) {
            console.error("Forgot password email check error:", err);
            const errorMessage = err.message || "Failed to process request. Please try again.";
            setForgotPasswordError(errorMessage);
            setForgotPasswordLoading(false);
            return { success: false, message: errorMessage };
        }
    }, []);

    const resetPassword = useCallback(async (email, otp, newPassword) => {
        setForgotPasswordLoading(true);
        setForgotPasswordError(null);
        try {
            const response = await forgetPasswordApi(email, otp, newPassword);
            setForgotPasswordLoading(false);
            return { success: true, message: response.message || "Password has been reset successfully." };
        } catch (err) {
            console.error("Password reset error:", err);
            const errorMessage = err.message || "Failed to reset password. Please check your OTP or try again.";
            setForgotPasswordError(errorMessage);
            setForgotPasswordLoading(false);
            return { success: false, message: errorMessage };
        }
    }, []);

    const initiateTwoFactorRecovery = useCallback(async (userId, recoveryCode) => {
        setLoading(true);
        setError(null);
        setTwoFactorSetupData(null);

        try {
            const response = await recoverTwoFactorApi(userId, recoveryCode); 

            const userData = {
                userId: response.userId,
                userName: response.userName,
                orgId: response.orgId,
                orgName: response.orgName,
                roleName: response.roleName,
                isOnline: response.isOnline,
                teamId: response.teamId,
                token: response.token,
                permissions: response.permissions,
                isSuperAdmin: response.isSuperAdmin
            };

            setRequiresTwoFactor(true);
            setTwoFactorEnabledForUser(response.twoFactorEnabledForUser); 
            setUserIdFor2FA(response.userId);
            setTwoFactorSetupData(response.twoFactorSetupData);

            setUser(userData);
            sessionStorage.setItem('user', JSON.stringify(userData));
            setAccessToken(userData.token);
            setRefToken(response.refreshToken);
            setLoading(false);
            return { success: true, message: '2FA recovery successful. Please set up your new authenticator.' };
        } catch (err) {
            console.error("2FA recovery initiation error:", err);
            const errorMessage = err.message || "Failed to initiate 2FA recovery. Please check your recovery code.";
            setError(errorMessage);
            setLoading(false);
            return { success: false, message: errorMessage };
        }
    }, []);

    const contextValue = {
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        logout,
        requiresTwoFactor,
        twoFactorEnabledForUser,
        twoFactorSetupData,
        userIdFor2FA,
        completeForcedTwoFactorSetup,
        checkUserByEmail,         
        resetPassword,            
        forgotPasswordLoading,
        initiateTwoFactorRecovery,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
