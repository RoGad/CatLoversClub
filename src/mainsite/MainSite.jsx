import React, { useState } from 'react';
import './CatLoverClub.css';
import cat1 from './assets/cat1.png';
import cat2 from './assets/cat2.png';
import cat3 from './assets/cat3.png';
import cat4 from './assets/cat4.png';
import logo from './assets/cat_logo.svg';

const MainSite = () => {
    const [activeCard, setActiveCard] = useState(null);

    const competitions = [
        { id: 1, image: cat1, title: "Конкурс", description: "Очень классная порода, прям супер" },
        { id: 2, image: cat2, title: "Конкурс", description: "Очень классная порода, прям супер" },
        { id: 3, image: cat3, title: "Конкурс", description: "Очень классная порода, прям супер" },
        { id: 4, image: cat4, title: "Конкурс", description: "Очень классная порода, прям супер" }
    ];

    return (
        <div className="container">
            <header className="header">
                <div className="logo-img">
                    <a href="/">
                        <img src={logo} alt="Логотип" />
                    </a>
                </div>
                <div className="nav-links">
                    <a href="/breeds">Список пород</a>
                    <a href="/">Главная</a>
                </div>
                <div className="auth-buttons">
                    <a href="/login" className="login-btn">Log In</a>
                    <a href="/signup" className="signup-btn">Sign Up</a>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <h1>Клуб любителей кошек</h1>
                <p className="description">
                    Клуб любителей кошек был основан в 2023 г. и до сих пор набирает
                    популярность среди любителей кошек, так как наше сообщество
                    активно участвует в различных активностях на кошачью тематику.
                </p>
                <p className="join-text">Присоединяйся ! Мур-мяу</p>
            </section>
            <section className="competitions">
                <div className="competition-grid">
                    {competitions.map(comp => (
                        <div
                            key={comp.id}
                            className={`competition-card ${activeCard === comp.id ? 'active' : ''}`}
                            onMouseEnter={() => setActiveCard(comp.id)}
                            onMouseLeave={() => setActiveCard(null)}
                        >
                            <img src={comp.image} alt={comp.title} />
                            <div className="competition-info">
                                <h3>{comp.title}</h3>
                                <p>{comp.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <footer className="footer">
                <p>&copy; 2025 Клуб любителей кошек. Все права защищены.</p>
            </footer>
        </div>
    );
};

export default MainSite;
