import "./AuthStyles.css"
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../global/AuthContext.jsx";

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register, registerWithVK, getVKAuth } = useAuth();
    const navigate = useNavigate();
    const vkButtonRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (username.length < 3 || username.length > 100) {
            setError("Имя пользователя должно быть от 3 до 100 символов");
            setLoading(false);
            return;
        }

        if (!email || !email.includes("@")) {
            setError("Введите корректный email");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Пароль должен быть не менее 6 символов");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            setLoading(false);
            return;
        }

        try {
            const result = await register({
                username,
                email,
                password,
                full_name: fullName
            });

            if (result.success) {
                navigate("/ProfilePage");
            } else {
                setError(result.message || "Ошибка регистрации");
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
                            const result = await registerWithVK(vkData);
                            if (result.success) {
                                navigate("/ProfilePage");
                            } else {
                                setError(result.message || "Ошибка регистрации через VK");
                            }
                        } catch {
                            setError("Ошибка подключения к серверу");
                        } finally {
                            setLoading(false);
                        }
                    },
                    (error) => {
                        setError("Ошибка регистрации через VK");
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
    }, [getVKAuth, registerWithVK, navigate]);

    return(
        <div className="auth-page-wrapper">
            <h1 className="auth-text">Регистрация</h1>
            <div className="auth-form-container">
                <form onSubmit={handleSubmit}>
                    {error && <div className="admin-error" style={{marginBottom: '16px'}}>{error}</div>}
                    <input 
                        type="text" 
                        className="auth-input" 
                        placeholder="Логин"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input 
                        type="email" 
                        className="auth-input" 
                        placeholder="Почта"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="text" 
                        className="auth-input" 
                        placeholder="Полное имя (необязательно)"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <input 
                        type="password" 
                        className="auth-input" 
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        className="auth-input" 
                        placeholder="Повторите пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? "Регистрация..." : "Продолжить"}
                    </button>
                    <div ref={vkButtonRef} id="vk-auth-button" style={{ marginTop: '16px' }}></div>
                </form>
            </div>
        </div>
    );
};

export default SignUp