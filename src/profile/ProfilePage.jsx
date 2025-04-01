import React from 'react';
import face from "../assets/face.svg"
import './ProfilePageStyles.css';
import cat11 from "../assets/cat_11.svg"
import cat22 from "../assets/cat_22.svg"
import cat33 from "../assets/cat_33.svg"
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    return (
        <div className="profile-page">
            <main className="main-content">
                <div className="profile-container">
                    {/* Left side - User info */}
                    <div className="user-info">
                        <div className="user-image">
                            <img src={face} alt="Roman Gadelija" />
                        </div>
                        <h2 className="user-name">Роман Гаделия</h2>
                    </div>

                    {/* Right side - Cat content */}
                    <div className="cat-content">
                        {/* Favorite Breeds Section */}
                        <section className="cat-section">
                            <h1 className="section-title">Любимые породы</h1>

                            <div className="card-container">
                                {/* Card 1 */}
                                <div className="cat-card">
                                    <div className="card-image">
                                        <img src={cat11} alt="Orange cat" />
                                    </div>
                                    <div className="card-info">
                                        <h3 className="breed-name">Порода</h3>
                                        <p className="breed-description">Очень классная порода, прям супер</p>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="cat-card">
                                    <div className="card-image">
                                        <img src={cat22} alt="Gray cat" />
                                    </div>
                                    <div className="card-info">
                                        <h3 className="breed-name">Порода</h3>
                                        <p className="breed-description">Очень классная порода, прям супер</p>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div className="cat-card">
                                    <div className="card-image">
                                        <img src={cat33} alt="Black cat" />
                                    </div>
                                    <div className="card-info">
                                        <h3 className="breed-name">Порода</h3>
                                        <p className="breed-description">Очень классная порода, прям супер</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* My Pets Section */}
                        <section className="cat-section">
                            <h1 className="section-title">Мои питомцы</h1>

                            <div className="card-container">
                                {/* Card 1 */}
                                <div className="cat-card">
                                    <div className="card-image">
                                        <img src={cat11} alt="Orange cat" />
                                    </div>
                                    <div className="card-info">
                                        <h3 className="breed-name">Порода</h3>
                                        <p className="breed-description">Очень классная порода, прям супер</p>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="cat-card">
                                    <div className="card-image">
                                        <img src={cat22} alt="Gray cat" />
                                    </div>
                                    <div className="card-info">
                                        <h3 className="breed-name">Порода</h3>
                                        <p className="breed-description">Очень классная порода, прям супер</p>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div className="cat-card">
                                    <div className="card-image">
                                        <img src={cat33} alt="Black cat" />
                                    </div>
                                    <div className="card-info">
                                        <h3 className="breed-name">Порода</h3>
                                        <p className="breed-description">Очень классная порода, прям супер</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;