import React from "react";
import "./WikiCats.css";
import cat11 from "../assets/cat_11.svg"
import cat22 from "../assets/cat_22.svg"
import cat33 from "../assets/cat_33.svg"
import cat44 from "../assets/cat_44.svg"
import {useNavigate} from "react-router-dom";

const CatCard = ({ image, breed, description, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="wiki-cat-card"
        >
            <img src={image} alt={breed} />
            <div className="card-info">
                <div className="breed">{breed}</div>
                <div className="description">{description}</div>
            </div>
        </div>
    );
};

const WikiCats = () => {
    const navigate = useNavigate();

    const cats = [
        { image: cat11, breed: 'Очень классная порода', description: 'Прям супер' },
        { image: cat22, breed: 'Очень классная порода', description: 'Прям супер' },
        { image: cat33, breed: 'Очень классная порода', description: 'Прям супер' },
        { image: cat44, breed: 'Очень классная порода', description: 'Прям супер' }
    ];

    const handleCardClick = (link) => {
        navigate(link);
    };

    const grid = [];
    for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
            const catIndex = i * 4 + j;
            const cat = cats[catIndex % cats.length];
            row.push(
                <CatCard
                    key={`${i}-${j}`}
                    image={cat.image}
                    breed={cat.breed}
                    description={cat.description}
                    onClick={() => handleCardClick("/InfoCats")}
                />
            );
        }
        grid.push(<div key={i} className="wiki-cats-row">{row}</div>);
    }

    return <div className="wiki-cats-grid">{grid}</div>;
};

export default WikiCats
