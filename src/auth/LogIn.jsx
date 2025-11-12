import "./AuthStyles.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../global/AuthContext.jsx";

const LogIn = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login: loginUser } = useAuth();
    const navigate = useNavigate();

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
                    <div className="auth-divider"></div>
                </form>
            </div>
        </div>
    );
};

export default LogIn
