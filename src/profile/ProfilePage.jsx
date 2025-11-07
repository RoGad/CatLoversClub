import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../global/AuthContext.jsx';
import { API_BASE_URL, IMAGE_BASE_URL } from '../global/config.js';
import axios from 'axios';
import './ProfilePageStyles.css';
import face from "../assets/face.svg";

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingName, setEditingName] = useState("");
    const [editingImageUrl, setEditingImageUrl] = useState("");
    const [showAddBreedModal, setShowAddBreedModal] = useState(false);
    const [showAddPetModal, setShowAddPetModal] = useState(false);
    const [availableBreeds, setAvailableBreeds] = useState([]);
    const [newPetData, setNewPetData] = useState({
        name: "",
        breed_id: "",
        age: "",
        gender: "",
        image_url: "",
        description: ""
    });

    useEffect(() => {
        fetchProfileData();
        fetchAvailableBreeds();
    }, []);

    const fetchProfileData = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`${API_BASE_URL}/UserProfile.php`, {
                withCredentials: true
            });
            console.log('Profile response:', response.data); // Debug log
            if (response.data && response.data.success) {
                setProfileData(response.data.data);
                setEditingName(response.data.data.user.full_name || "");
                setEditingImageUrl(response.data.data.user.profile_image_url || "");
            } else {
                const errorMsg = response.data?.message || "Ошибка загрузки профиля";
                setError(errorMsg);
                console.error('Profile error:', response.data);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Ошибка загрузки профиля";
            setError(errorMsg);
            console.error('Profile fetch error:', err);
            console.error('Error response:', err.response);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableBreeds = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/Breeds.php`);
            if (response.data.success) {
                setAvailableBreeds(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch breeds:", err);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/UserProfile.php`,
                {
                    full_name: editingName,
                    profile_image_url: editingImageUrl
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.success) {
                setEditingProfile(false);
                fetchProfileData();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка сохранения профиля");
        }
    };

    const handleAddFavoriteBreed = async (breedId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/FavoriteBreeds.php`,
                { breed_id: breedId },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.success) {
                setShowAddBreedModal(false);
                fetchProfileData();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка добавления породы");
        }
    };

    const handleRemoveFavoriteBreed = async (favoriteId) => {
        if (!window.confirm("Удалить породу из избранного?")) return;

        try {
            const response = await axios.delete(
                `${API_BASE_URL}/FavoriteBreeds.php?id=${favoriteId}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                fetchProfileData();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка удаления породы");
        }
    };

    const handleAddPet = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${API_BASE_URL}/Pets.php`,
                {
                    name: newPetData.name,
                    breed_id: parseInt(newPetData.breed_id),
                    age: newPetData.age ? parseInt(newPetData.age) : null,
                    gender: newPetData.gender || '', // Empty string will be converted to NULL in PHP
                    image_url: newPetData.image_url || '',
                    description: newPetData.description || ''
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.success) {
                setShowAddPetModal(false);
                setNewPetData({
                    name: "",
                    breed_id: "",
                    age: "",
                    gender: "",
                    image_url: "",
                    description: ""
                });
                fetchProfileData();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка добавления питомца");
        }
    };

    const handleDeletePet = async (petId) => {
        if (!window.confirm("Удалить питомца?")) return;

        try {
            const response = await axios.delete(
                `${API_BASE_URL}/Pets.php?id=${petId}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                fetchProfileData();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка удаления питомца");
        }
    };

    const getImageUrl = (url) => {
        if (!url) return face;
        if (url.startsWith("http")) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    if (loading) {
        return <div className="profile-page"><div className="main-content">Загрузка...</div></div>;
    }

    if (!profileData) {
        return <div className="profile-page"><div className="main-content">Ошибка загрузки профиля</div></div>;
    }

    const { user: profileUser, favorite_breeds, pets } = profileData;

    return (
        <div className="profile-page">
            <main className="main-content">
                <div className="profile-container">
                    {/* Left side - User info */}
                    <div className="user-info">
                        <div className="user-image">
                            <img src={getImageUrl(profileUser.profile_image_url)} alt={profileUser.full_name || profileUser.username} />
                        </div>
                        {editingProfile ? (
                            <div>
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    placeholder="Полное имя"
                                    style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                                <input
                                    type="text"
                                    value={editingImageUrl}
                                    onChange={(e) => setEditingImageUrl(e.target.value)}
                                    placeholder="URL фотографии"
                                    style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                                <button
                                    onClick={handleSaveProfile}
                                    style={{ padding: '8px 16px', marginRight: '8px', borderRadius: '4px', border: 'none', background: '#48bb78', color: 'white', cursor: 'pointer' }}
                                >
                                    Сохранить
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingProfile(false);
                                        setEditingName(profileUser.full_name || "");
                                        setEditingImageUrl(profileUser.profile_image_url || "");
                                    }}
                                    style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#ccc', cursor: 'pointer' }}
                                >
                                    Отмена
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h2 className="user-name">{profileUser.full_name || profileUser.username}</h2>
                                <button
                                    onClick={() => setEditingProfile(true)}
                                    style={{ width: '100%', padding: '8px', marginTop: '10px', borderRadius: '4px', border: 'none', background: '#48bb78', color: 'white', cursor: 'pointer' }}
                                >
                                    Редактировать профиль
                                </button>
                                <button
                                    onClick={logout}
                                    style={{ width: '100%', padding: '8px', marginTop: '10px', borderRadius: '4px', border: 'none', background: '#e53e3e', color: 'white', cursor: 'pointer' }}
                                >
                                    Выйти
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right side - Cat content */}
                    <div className="cat-content">
                        {error && <div style={{ background: '#fee', color: '#c33', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                        {/* Favorite Breeds Section */}
                        <section className="cat-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h1 className="section-title">Любимые породы</h1>
                                <button
                                    onClick={() => setShowAddBreedModal(true)}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#48bb78', color: 'white', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    + Добавить породу
                                </button>
                            </div>

                            <div className="card-container">
                                {favorite_breeds && favorite_breeds.length > 0 ? (
                                    favorite_breeds.map((breed) => (
                                        <div key={breed.favorite_id} className="cat-card" style={{ position: 'relative' }}>
                                            <div
                                                onClick={() => navigate(`/breed/${breed.breed_id}`)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="card-image">
                                                    <img src={getImageUrl(breed.image_url)} alt={breed.name} />
                                                </div>
                                                <div className="card-info">
                                                    <h3 className="breed-name">{breed.name}</h3>
                                                    <p className="breed-description">{breed.short_description || ""}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFavoriteBreed(breed.favorite_id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    background: '#e53e3e',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>Нет любимых пород</p>
                                )}
                            </div>
                        </section>

                        {/* My Pets Section */}
                        <section className="cat-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h1 className="section-title">Мои питомцы</h1>
                                <button
                                    onClick={() => setShowAddPetModal(true)}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#48bb78', color: 'white', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    + Добавить питомца
                                </button>
                            </div>

                            <div className="card-container">
                                {pets && pets.length > 0 ? (
                                    pets.map((pet) => (
                                        <div key={pet.pet_id} className="cat-card" style={{ position: 'relative' }}>
                                            <div className="card-image">
                                                <img src={getImageUrl(pet.image_url)} alt={pet.name} />
                                            </div>
                                            <div className="card-info">
                                                <h3 className="breed-name">{pet.name}</h3>
                                                <p className="breed-description">
                                                    {pet.breed_name} {pet.age ? `• ${pet.age} лет` : ""} {pet.gender ? `• ${pet.gender}` : ""}
                                                </p>
                                                {pet.description && <p style={{ marginTop: '8px', fontSize: '12px' }}>{pet.description}</p>}
                                            </div>
                                            <button
                                                onClick={() => handleDeletePet(pet.pet_id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    background: '#e53e3e',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>Нет питомцев</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Add Breed Modal */}
            {showAddBreedModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setShowAddBreedModal(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: '20px' }}>Выберите породу</h2>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {availableBreeds.map((breed) => {
                                const isFavorite = favorite_breeds?.some(fb => fb.breed_id === breed.breed_id);
                                return (
                                    <div
                                        key={breed.breed_id}
                                        style={{
                                            padding: '15px',
                                            marginBottom: '10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <strong>{breed.name}</strong>
                                            {breed.short_description && <p style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>{breed.short_description}</p>}
                                        </div>
                                        <button
                                            onClick={() => !isFavorite && handleAddFavoriteBreed(breed.breed_id)}
                                            disabled={isFavorite}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: isFavorite ? '#ccc' : '#48bb78',
                                                color: 'white',
                                                cursor: isFavorite ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {isFavorite ? 'Добавлено' : 'Добавить'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setShowAddBreedModal(false)}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                borderRadius: '4px',
                                border: 'none',
                                background: '#ccc',
                                cursor: 'pointer'
                            }}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            {/* Add Pet Modal */}
            {showAddPetModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setShowAddPetModal(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            width: '90%'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: '20px' }}>Добавить питомца</h2>
                        <form onSubmit={handleAddPet}>
                            <input
                                type="text"
                                placeholder="Имя питомца"
                                value={newPetData.name}
                                onChange={(e) => setNewPetData({ ...newPetData, name: e.target.value })}
                                required
                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <select
                                value={newPetData.breed_id}
                                onChange={(e) => setNewPetData({ ...newPetData, breed_id: e.target.value })}
                                required
                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">Выберите породу</option>
                                {availableBreeds.map((breed) => (
                                    <option key={breed.breed_id} value={breed.breed_id}>{breed.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Возраст (необязательно)"
                                value={newPetData.age}
                                onChange={(e) => setNewPetData({ ...newPetData, age: e.target.value })}
                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="text"
                                placeholder="Пол (необязательно)"
                                value={newPetData.gender}
                                onChange={(e) => setNewPetData({ ...newPetData, gender: e.target.value })}
                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="text"
                                placeholder="URL изображения (необязательно)"
                                value={newPetData.image_url}
                                onChange={(e) => setNewPetData({ ...newPetData, image_url: e.target.value })}
                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <textarea
                                placeholder="Описание (необязательно)"
                                value={newPetData.description}
                                onChange={(e) => setNewPetData({ ...newPetData, description: e.target.value })}
                                rows="3"
                                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none', background: '#48bb78', color: 'white', cursor: 'pointer' }}
                                >
                                    Добавить
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddPetModal(false)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none', background: '#ccc', cursor: 'pointer' }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
