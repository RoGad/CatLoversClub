import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainSiteStyles.css';
import cat1 from '../assets/cat1.png';
import cat2 from '../assets/cat2.png';
import cat3 from '../assets/cat3.png';
import cat4 from '../assets/cat4.png';

const MainSite = () => {
    const [activeCard, setActiveCard] = useState(null);
    const navigate = useNavigate();

    const competitions = [
        { id: 1, image: cat1, title: "Конкурс", description: "Очень классная порода, прям супер", link: "/competition/1" },
        { id: 2, image: cat2, title: "Конкурс", description: "Очень классная порода, прям супер", link: "/competition/2" },
        { id: 3, image: cat3, title: "Конкурс", description: "Очень классная порода, прям супер", link: "/competition/3" },
        { id: 4, image: cat4, title: "Конкурс", description: "Очень классная порода, прям супер", link: "/competition/4" }
    ];

    const handleCardClick = (link) => {
        navigate(link);
    };

    return (
        <div className="container">
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
                            onClick={() => handleCardClick(comp.link)}
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
        </div>
    );
};

export default MainSite;