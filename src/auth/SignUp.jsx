import "./AuthStyles.css"
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../global/AuthContext.jsx";
import { initVKAuth } from "./vkAuth.js";
import { VK_APP_ID, VK_REDIRECT_URL } from "../global/config.js";

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const vkContainerRef = useRef(null);

    useEffect(() => {
        // Ждем загрузки VK SDK
        const initVK = () => {
            if (vkContainerRef.current && window.VKIDSDK) {
                const vkAuth = initVKAuth(VK_APP_ID, VK_REDIRECT_URL);
                
                if (vkAuth && vkContainerRef.current) {
                    vkAuth.renderOneTap(
                        vkContainerRef.current,
                        async (vkData) => {
                        // Обработка успешной авторизации через VK
                        console.log('VK авторизация успешна:', vkData);
                        setError("");
                        setLoading(true);

                        try {
                            // Отправляем данные VK на сервер для авторизации/регистрации
                            const response = await fetch('/api/Auth.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                    action: 'vk_register',
                                    vk_user_id: vkData.userId,
                                    access_token: vkData.accessToken,
                                    email: vkData.email,
                                    first_name: vkData.firstName,
                                    last_name: vkData.lastName,
                                    photo: vkData.photo
                                })
                            });

                            const result = await response.json();

                            if (result.success) {
                                // Обновляем контекст авторизации через checkAuth
                                window.location.reload(); // Перезагружаем страницу для обновления сессии
                            } else {
                                setError(result.message || "Ошибка регистрации через VK");
                            }
                        } catch (err) {
                            console.error('VK авторизация ошибка:', err);
                            setError("Ошибка подключения к серверу");
                        } finally {
                            setLoading(false);
                        }
                    },
                    (error) => {
                        console.error('VK авторизация ошибка:', error);
                        // Не показываем ошибку пользователю, так как это может быть просто отмена
                    }
                );
                }
            }
        };

        // Проверяем, загружен ли SDK
        if (window.VKIDSDK) {
            initVK();
        } else {
            // Ждем загрузки SDK
            const checkSDK = setInterval(() => {
                if (window.VKIDSDK) {
                    clearInterval(checkSDK);
                    initVK();
                }
            }, 100);

            // Очищаем интервал через 10 секунд, если SDK не загрузился
            setTimeout(() => clearInterval(checkSDK), 10000);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validation
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
                    <div className="auth-divider"></div>
                    <div ref={vkContainerRef} id="vk-auth-container"></div>
                </form>
            </div>
        </div>
    );
};

export default SignUp