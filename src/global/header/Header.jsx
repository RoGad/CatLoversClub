import "./HeaderStyles.css"
import logo from "../../assets/cat_logo.svg";
import React from "react";
import {Link} from "react-router-dom";

const Header = () => {
    return(
        <header className="header">
            <div className="logo-img">
                <Link to="/">
                    <img src={logo} alt="Логотип" />
                </Link>
            </div>
            <div className="nav-links">
                <Link to="/breeds">Список пород</Link>
                <Link to="/">Главная</Link>
                <Link to="/">Наши кошки</Link>
            </div>
            <div className="auth-buttons">
                <Link to="/Login" className="login-btn">Log In</Link>
                <Link to="/Signup" className="signup-btn">Sign Up</Link>
            </div>
        </header>
    );
}

export default Header;