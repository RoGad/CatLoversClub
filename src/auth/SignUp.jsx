import "./AuthStyles.css"
import React, { useState } from "react";
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
    const { register } = useAuth();
    const navigate = useNavigate();

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
        } catch (err) {
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
                    <div className="x-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M17.1761 4H20.3037L13.9411 11.4294L21.5 20H15.2899L10.5463 14.8562L5.11946 20H2L8.78045 12.1059L1.5 4H7.85486L12.1734 8.77299L17.1761 4ZM16.1085 18.2472H17.8251L7.04746 5.67039H5.2013L16.1085 18.2472Z"
                                fill="white"/>
                        </svg>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp