import React from "react";
import "./FooterStyles.css"
import {Link} from "react-router-dom";
const Footer = () => {
    return(
        <footer className="footer">
            <hr className="line"/>
                <div className="nav-links-footer">
                    <Link to="/">Вконтакте</Link>
                    <Link to="/">Телеграм</Link>
                    <Link to="/">Инстраграм</Link>
                </div>
                <h5 className="text">CatClub @ 2025. All rights reserved.</h5>
        </footer>
    );
};

export default Footer