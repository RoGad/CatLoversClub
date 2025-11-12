import "./AuthStyles.css";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../global/AuthContext.jsx";

const LogIn = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login: loginUser, loginWithVK, getVKAuth } = useAuth();
    const navigate = useNavigate();
    const vkButtonRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await loginUser({
                login,
                password
            });

            if (result.success) {
                navigate("/ProfilePage");
            } else {
                setError(result.message || "Ошибка входа");
            }
        } catch {
            setError("Ошибка подключения к серверу");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let checkVKSDK;
        let timeoutId;

        const initVKButton = () => {
            if (!vkButtonRef.current) {
                console.warn('VK button container not found');
                return;
            }
            
            const vkAuth = getVKAuth();
            if (!vkAuth) {
                console.warn('VK Auth not initialized. Check VK_APP_ID in config.js');
                if (vkButtonRef.current) {
                    vkButtonRef.current.innerHTML = '<div style="color: white; text-align: center; padding: 10px; background: rgba(255,0,0,0.2); border-radius: 8px;">VK App ID не настроен</div>';
                }
                return;
            }

            try {
                vkAuth.renderOneTap(
                    vkButtonRef.current,
                    async (vkData) => {
                        if (!vkData) return;

                        setError("");
                        setLoading(true);

                        try {
                            const result = await loginWithVK(vkData);
                            if (result.success) {
                                navigate("/ProfilePage");
                            } else {
                                setError(result.message || "Ошибка входа через VK");
                            }
                        } catch {
                            setError("Ошибка подключения к серверу");
                        } finally {
                            setLoading(false);
                        }
                    },
                    (error) => {
                        setError("Ошибка авторизации через VK");
                        console.error('VK auth error:', error);
                    }
                );
                console.log('VK OneTap initialized successfully');
            } catch (error) {
                console.error('Error initializing VK OneTap:', error);
                if (vkButtonRef.current) {
                    vkButtonRef.current.innerHTML = '<div style="color: white; text-align: center; padding: 10px; background: rgba(255,0,0,0.2); border-radius: 8px;">Ошибка инициализации VK</div>';
                }
            }
        };

        const maxAttempts = 50;
        let attempts = 0;

        checkVKSDK = setInterval(() => {
            attempts++;
            
            if (window.VKIDSDK && vkButtonRef.current) {
                clearInterval(checkVKSDK);
                if (timeoutId) clearTimeout(timeoutId);
                console.log('VK SDK loaded, initializing button...');
                initVKButton();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkVKSDK);
                console.error('VK SDK failed to load after 5 seconds');
                if (vkButtonRef.current) {
                    vkButtonRef.current.innerHTML = '<div style="color: white; text-align: center; padding: 10px; background: rgba(255,0,0,0.2); border-radius: 8px;">VK SDK не загружен</div>';
                }
            }
        }, 100);

        timeoutId = setTimeout(() => {
            clearInterval(checkVKSDK);
            if (!window.VKIDSDK) {
                console.error('VK SDK timeout - script may not be loaded');
                if (vkButtonRef.current && !vkButtonRef.current.innerHTML) {
                    vkButtonRef.current.innerHTML = '<div style="color: white; text-align: center; padding: 10px; background: rgba(255,0,0,0.2); border-radius: 8px;">VK SDK не загружен. Проверьте подключение.</div>';
                }
            }
        }, 10000);

        return () => {
            if (checkVKSDK) clearInterval(checkVKSDK);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [getVKAuth, loginWithVK, navigate]);

    return (
        <div className="auth-page-wrapper">
            <h1 className="auth-text">Вход</h1>
            <div className="auth-form-container">
                <form onSubmit={handleSubmit}>
                    {error && <div className="admin-error" style={{marginBottom: '16px'}}>{error}</div>}
                    <input 
                        type="text" 
                        className="auth-input" 
                        placeholder="Логин или почта"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        className="auth-input" 
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? "Вход..." : "Продолжить"}
                    </button>
                    <div ref={vkButtonRef} id="vk-auth-button" style={{ marginTop: '16px' }}></div>
                </form>
            </div>
        </div>
    );
};

export default LogIn
