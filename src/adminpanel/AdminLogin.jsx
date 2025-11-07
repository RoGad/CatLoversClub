import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminStyles.css";
import { API_BASE_URL } from "../global/config.js";
import axios from "axios";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if already authenticated
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/AdminCheck.php`, {
                    withCredentials: true
                });
                if (response.data.success && response.data.authenticated) {
                    navigate("/admin/panel");
                }
            } catch (err) {
                console.error("Auth check failed:", err);
            }
        };
        checkAuth();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/AdminAuth.php`,
                { username, password },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                navigate("/admin/panel");
            } else {
                setError(response.data.message || "Ошибка входа");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка подключения к серверу");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-login-container">
                <h1 className="admin-login-title">Вход в админ-панель</h1>
                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && <div className="admin-error">{error}</div>}
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="admin-input"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="admin-button"
                        disabled={loading}
                    >
                        {loading ? "Вход..." : "Войти"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;

