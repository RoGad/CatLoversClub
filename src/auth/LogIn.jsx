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
        } catch (err) {
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

export default LogIn
