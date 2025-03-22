import './LogInStyles.css';
import React from "react";


const LogIn = () => {

    return (
        <div className="login-page-wrapper">
            <h1 className="login-text">Вход</h1>
            <div className="login-form-container">
                <form>
                    <input type="text" className="login-input" placeholder="Логин или почта"/>
                    <input type="password" className="login-input" placeholder="Пароль"/>
                    <button type="submit" className="login-button">Продолжить</button>
                    <div className="login-divider"></div>
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
