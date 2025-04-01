import "./HeaderStyles.css"
import logo from "../../assets/cat_logo.svg";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo-img">
                    <Link to="/">
                        <img src={logo} alt="Логотип" />
                    </Link>
                </div>

                <button
                    className={`burger-menu ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            <div className={`nav-container ${isMenuOpen ? 'active' : ''}`}>
                <nav className="nav-links">
                    <Link to="/WikiCats">Список пород</Link>
                    <Link to="/">Главная</Link>
                    <Link to="/">Наши кошки</Link>
                    <Link to="/ProfilePage">Профиль (тест)</Link>
                </nav>
                <div className="auth-buttons">
                    <Link to="/Login" className="login-btn">Log In</Link>
                    <Link to="/Signup" className="signup-btn">Sign Up</Link>
                </div>
            </div>
        </header>
    );
}

export default Header;