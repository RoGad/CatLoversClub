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
                </form>
            </div>
        </div>
    );
};

export default SignUp