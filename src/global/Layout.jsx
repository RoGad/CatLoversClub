import React from "react";
import Header from "./header/Header.jsx";
import { Outlet } from "react-router-dom";
import Footer from "./footer/Footer.jsx";
import "./LayoutStyles.css"

const Layout = () => {
    return (
        <div className="site-container">
            <Header />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;