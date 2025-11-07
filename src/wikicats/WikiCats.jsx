import React, { useState, useEffect } from "react";
import "./WikiCats.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, IMAGE_BASE_URL } from 'C:/Users/kroko/PhpstormProjects/untitled1/src/global/config.js';
import axios from 'axios';

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
    const [breeds, setBreeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch breeds from PHP API
        const fetchBreeds = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/breeds.php`);
                if (response.data.success) {
                    setBreeds(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError('Failed to fetch cat breeds');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBreeds();
    }, []);

    const handleCardClick = (breedId) => {
        navigate(`/breed/${breedId}`);
    };

    if (loading) return <div className="loading">Loading cat breeds...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    // Create a grid with all breeds
    const createGrid = () => {
        const grid = [];
        const itemsPerRow = 4;

        // Calculate how many rows we need
        const totalRows = Math.ceil(breeds.length / itemsPerRow);

        for (let i = 0; i < totalRows; i++) {
            const row = [];
            for (let j = 0; j < itemsPerRow; j++) {
                const index = i * itemsPerRow + j;
                // If we've shown all breeds, repeat from the beginning
                const realIndex = index % breeds.length;
                const breed = breeds[realIndex];
                const getImageUrl = (url) => {
                    if(url.startsWith("http")) {
                        return url
                    }
                    return `${IMAGE_BASE_URL}${url}`;
                }

                row.push(
                    <CatCard
                        key={`${i}-${j}`}
                        image={getImageUrl(breed.image_url)}
                        breed={breed.name}
                        description={breed.short_description}
                        onClick={() => handleCardClick(breed.breed_id)}
                    />
                );
            }
            grid.push(<div key={i} className="wiki-cats-row">{row}</div>);
        }

        return grid;
    };

    return <div className="wiki-cats-grid">{createGrid()}</div>;
};

export default WikiCats;