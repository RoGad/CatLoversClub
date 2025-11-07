import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminStyles.css";
import { API_BASE_URL, IMAGE_BASE_URL } from "../global/config.js";
import axios from "axios";

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState("breeds"); // "breeds" or "users"
    const [breeds, setBreeds] = useState([]);
    const [users, setUsers] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingBreed, setEditingBreed] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [showBreedForm, setShowBreedForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (activeTab === "breeds") {
            fetchBreeds();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    const checkAuth = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/AdminCheck.php`, {
                withCredentials: true
            });
            if (!response.data.success || !response.data.authenticated) {
                navigate("/admin");
            }
        } catch (err) {
            navigate("/admin");
        }
    };

    const fetchBreeds = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`${API_BASE_URL}/AdminBreeds.php`, {
                withCredentials: true
            });
            if (response.data.success) {
                setBreeds(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка загрузки пород");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`${API_BASE_URL}/AdminUsers.php`, {
                withCredentials: true
            });
            if (response.data.success) {
                setUsers(response.data.data);
                setUserCount(response.data.count);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка загрузки пользователей");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/AdminLogaut.php`, {}, {
                withCredentials: true
            });
            navigate("/admin");
        } catch (err) {
            console.error("Logout error:", err);
            navigate("/admin");
        }
    };

    const handleDeleteBreed = async (breedId) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту породу?")) {
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/AdminBreeds.php?id=${breedId}`, {
                withCredentials: true
            });
            if (response.data.success) {
                fetchBreeds();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка удаления породы");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/AdminUsers.php?id=${userId}`, {
                withCredentials: true
            });
            if (response.data.success) {
                fetchUsers();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка удаления пользователя");
        }
    };

    const handleEditBreed = (breed) => {
        setEditingBreed({ ...breed });
        setShowBreedForm(true);
    };

    const handleEditUser = (user) => {
        setEditingUser({ ...user });
        setShowUserForm(true);
    };

    const handleSaveBreed = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const breedData = {
            breed_id: editingBreed?.breed_id || null,
            name: formData.get("name"),
            short_description: formData.get("short_description") || "",
            full_description: formData.get("full_description") || "",
            image_url: formData.get("image_url") || "",
        };

        try {
            const url = `${API_BASE_URL}/AdminBreeds.php`;
            let response;
            if (editingBreed) {
                response = await axios.put(url, breedData, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" }
                });
            } else {
                response = await axios.post(url, breedData, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" }
                });
            }

            if (response.data.success) {
                setShowBreedForm(false);
                setEditingBreed(null);
                fetchBreeds();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка сохранения породы");
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            user_id: editingUser?.user_id,
            username: formData.get("username"),
            email: formData.get("email"),
            full_name: formData.get("full_name") || "",
            profile_image_url: formData.get("profile_image_url") || "",
        };

        try {
            const response = await axios.put(`${API_BASE_URL}/AdminUsers.php`, userData, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" }
            });

            if (response.data.success) {
                setShowUserForm(false);
                setEditingUser(null);
                fetchUsers();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка сохранения пользователя");
        }
    };

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `${IMAGE_BASE_URL}${url}`;
    };

    return (
        <div className="admin-panel-wrapper">
            <div className="admin-panel-header">
                <h1>Админ-панель</h1>
                <button onClick={handleLogout} className="admin-logout-btn">
                    Выйти
                </button>
            </div>

            {error && <div className="admin-error-message">{error}</div>}

            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === "breeds" ? "active" : ""}`}
                    onClick={() => setActiveTab("breeds")}
                >
                    Породы кошек
                </button>
                <button
                    className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
                    onClick={() => setActiveTab("users")}
                >
                    Пользователи {userCount > 0 && `(${userCount})`}
                </button>
            </div>

            {activeTab === "breeds" && (
                <div className="admin-content">
                    <div className="admin-actions">
                        <button
                            className="admin-add-btn"
                            onClick={() => {
                                setEditingBreed(null);
                                setShowBreedForm(true);
                            }}
                        >
                            + Добавить породу
                        </button>
                    </div>

                    {loading ? (
                        <div className="admin-loading">Загрузка...</div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Изображение</th>
                                        <th>Название</th>
                                        <th>Краткое описание</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breeds.map((breed) => (
                                        <tr key={breed.breed_id}>
                                            <td>{breed.breed_id}</td>
                                            <td>
                                                {breed.image_url && (
                                                    <img
                                                        src={getImageUrl(breed.image_url)}
                                                        alt={breed.name}
                                                        className="admin-thumbnail"
                                                    />
                                                )}
                                            </td>
                                            <td>{breed.name}</td>
                                            <td>{breed.short_description || "-"}</td>
                                            <td>
                                                <button
                                                    className="admin-edit-btn"
                                                    onClick={() => handleEditBreed(breed)}
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    className="admin-delete-btn"
                                                    onClick={() => handleDeleteBreed(breed.breed_id)}
                                                >
                                                    Удалить
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "users" && (
                <div className="admin-content">
                    {loading ? (
                        <div className="admin-loading">Загрузка...</div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Фото</th>
                                        <th>Имя пользователя</th>
                                        <th>Email</th>
                                        <th>Полное имя</th>
                                        <th>Дата регистрации</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.user_id}>
                                            <td>{user.user_id}</td>
                                            <td>
                                                {user.profile_image_url && (
                                                    <img
                                                        src={getImageUrl(user.profile_image_url)}
                                                        alt={user.username}
                                                        className="admin-thumbnail"
                                                    />
                                                )}
                                            </td>
                                            <td>{user.username}</td>
                                            <td>{user.email || "-"}</td>
                                            <td>{user.full_name || "-"}</td>
                                            <td>
                                                {user.registration_date
                                                    ? new Date(user.registration_date).toLocaleDateString("ru-RU")
                                                    : "-"}
                                            </td>
                                            <td>
                                                <button
                                                    className="admin-edit-btn"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    className="admin-delete-btn"
                                                    onClick={() => handleDeleteUser(user.user_id)}
                                                >
                                                    Удалить
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showBreedForm && (
                <div className="admin-modal-overlay" onClick={() => {
                    setShowBreedForm(false);
                    setEditingBreed(null);
                }}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingBreed ? "Редактировать породу" : "Добавить породу"}</h2>
                        <form onSubmit={handleSaveBreed}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Название породы"
                                defaultValue={editingBreed?.name || ""}
                                required
                            />
                            <textarea
                                name="short_description"
                                placeholder="Краткое описание"
                                defaultValue={editingBreed?.short_description || ""}
                                rows="3"
                            />
                            <textarea
                                name="full_description"
                                placeholder="Полное описание"
                                defaultValue={editingBreed?.full_description || ""}
                                rows="5"
                            />
                            <input
                                type="text"
                                name="image_url"
                                placeholder="URL изображения"
                                defaultValue={editingBreed?.image_url || ""}
                            />
                            <div className="admin-modal-actions">
                                <button type="submit" className="admin-save-btn">
                                    Сохранить
                                </button>
                                <button
                                    type="button"
                                    className="admin-cancel-btn"
                                    onClick={() => {
                                        setShowBreedForm(false);
                                        setEditingBreed(null);
                                    }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showUserForm && editingUser && (
                <div className="admin-modal-overlay" onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                }}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Редактировать пользователя</h2>
                        <form onSubmit={handleSaveUser}>
                            <input
                                type="text"
                                name="username"
                                placeholder="Имя пользователя"
                                defaultValue={editingUser.username || ""}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                defaultValue={editingUser.email || ""}
                            />
                            <input
                                type="text"
                                name="full_name"
                                placeholder="Полное имя"
                                defaultValue={editingUser.full_name || ""}
                            />
                            <input
                                type="text"
                                name="profile_image_url"
                                placeholder="URL фотографии профиля"
                                defaultValue={editingUser.profile_image_url || ""}
                            />
                            <div className="admin-modal-actions">
                                <button type="submit" className="admin-save-btn">
                                    Сохранить
                                </button>
                                <button
                                    type="button"
                                    className="admin-cancel-btn"
                                    onClick={() => {
                                        setShowUserForm(false);
                                        setEditingUser(null);
                                    }}
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

export default AdminPanel;

