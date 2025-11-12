import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL, IMAGE_BASE_URL } from "../global/config.js";
import "./InfoCats.css";
import axios from 'axios';

const InfoCats = () => {
    const { id } = useParams();
    const [breed, setBreed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const getImageUrl = (url) => {
        if (url.startsWith("http")) {
            return url;
        }
        return `${IMAGE_BASE_URL}${url}`;
    };


    useEffect(() => {
        const fetchBreedDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/breed.php?id=${id}`);
                if (response.data.success) {
                    setBreed(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError('Failed to fetch breed details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBreedDetails();
    }, [id]);

    if (loading) return <div className="loading">Loading breed information...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!breed) return <div className="not-found">Breed not found</div>;

    const paragraphs = breed.full_description.split(/\n+/).filter(p => p.trim() !== '');

    return (
        <div className="maine-coon-container">
            <div className="maine-coon-content">
                <div className="maine-coon-image">
                    <img src={getImageUrl(breed.image_url)} alt={breed.name} />
                </div>
                <div className="maine-coon-text">
                    <h1>{breed.name}</h1>
                    <div className="description">
                        {paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoCats;