<?php
global $pdo;
require_once __DIR__ . '/../global/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($input['action']) ? $input['action'] : '';

try {
    switch ($action) {
        case 'register':
            // Registration
            $username = isset($input['username']) ? trim($input['username']) : '';
            $email = isset($input['email']) ? trim($input['email']) : '';
            $password = isset($input['password']) ? trim($input['password']) : '';
            $full_name = isset($input['full_name']) ? trim($input['full_name']) : '';

            // Validation
            if (empty($username) || strlen($username) < 3 || strlen($username) > 100) {
                echo json_encode(['success' => false, 'message' => 'Username must be between 3 and 100 characters']);
                exit;
            }

            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'message' => 'Invalid email address']);
                exit;
            }

            if (empty($password) || strlen($password) < 6) {
                echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
                exit;
            }

            // Check if username or email already exists
            $stmt = $pdo->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            $existing = $stmt->fetch();

            if ($existing) {
                echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
                exit;
            }

            // Hash password
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

            // Insert user
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, full_name, registration_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)");
            $stmt->execute([$username, $email, $password_hash, $full_name]);
            $user_id = $pdo->lastInsertId();

            // Set session
            $_SESSION['user_id'] = $user_id;
            $_SESSION['username'] = $username;
            $_SESSION['authenticated'] = true;

            echo json_encode([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'user_id' => $user_id,
                    'username' => $username,
                    'email' => $email,
                    'full_name' => $full_name
                ]
            ]);
            break;

        case 'login':
            // Login
            $login = isset($input['login']) ? trim($input['login']) : '';
            $password = isset($input['password']) ? trim($input['password']) : '';

            if (empty($login) || empty($password)) {
                echo json_encode(['success' => false, 'message' => 'Login and password are required']);
                exit;
            }

            // Find user by username or email
            $stmt = $pdo->prepare("SELECT user_id, username, email, password_hash, full_name, profile_image_url FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$login, $login]);
            $user = $stmt->fetch();

            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
                exit;
            }

            // Verify password
            if (!password_verify($password, $user['password_hash'])) {
                echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
                exit;
            }

            // Set session
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['authenticated'] = true;

            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'user_id' => $user['user_id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'profile_image_url' => $user['profile_image_url']
                ]
            ]);
            break;

        case 'vk_login':
        case 'vk_register':
            // VK авторизация/регистрация
            $vk_user_id = isset($input['vk_user_id']) ? trim($input['vk_user_id']) : '';
            $access_token = isset($input['access_token']) ? trim($input['access_token']) : '';
            $email = isset($input['email']) ? trim($input['email']) : '';
            $first_name = isset($input['first_name']) ? trim($input['first_name']) : '';
            $last_name = isset($input['last_name']) ? trim($input['last_name']) : '';
            $photo = isset($input['photo']) ? trim($input['photo']) : '';

            if (empty($vk_user_id) || empty($access_token)) {
                echo json_encode(['success' => false, 'message' => 'VK user ID and access token are required']);
                exit;
            }

            // Проверяем, существует ли пользователь с таким VK ID
            $stmt = $pdo->prepare("SELECT user_id, username, email, password_hash, full_name, profile_image_url FROM users WHERE vk_user_id = ?");
            $stmt->execute([$vk_user_id]);
            $user = $stmt->fetch();

            if ($user) {
                // Пользователь существует - вход
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['authenticated'] = true;

                echo json_encode([
                    'success' => true,
                    'message' => 'VK login successful',
                    'user' => [
                        'user_id' => $user['user_id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'full_name' => $user['full_name'],
                        'profile_image_url' => $user['profile_image_url']
                    ]
                ]);
            } else {
                // Пользователь не существует - регистрация
                $username = !empty($email) ? explode('@', $email)[0] : 'vk_user_' . $vk_user_id;
                $full_name = trim($first_name . ' ' . $last_name);
                
                // Проверяем, не занят ли username
                $stmt = $pdo->prepare("SELECT user_id FROM users WHERE username = ?");
                $stmt->execute([$username]);
                $existing = $stmt->fetch();
                
                if ($existing) {
                    $username = 'vk_user_' . $vk_user_id . '_' . time();
                }

                // Проверяем, не занят ли email (если он есть)
                if (!empty($email)) {
                    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
                    $stmt->execute([$email]);
                    $existing = $stmt->fetch();
                    
                    if ($existing) {
                        echo json_encode(['success' => false, 'message' => 'Email already registered']);
                        exit;
                    }
                }

                // Создаем пользователя без пароля (VK авторизация)
                $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, full_name, vk_user_id, profile_image_url, registration_date) VALUES (?, ?, NULL, ?, ?, ?, CURRENT_TIMESTAMP)");
                $stmt->execute([$username, $email ?: null, $full_name ?: null, $vk_user_id, $photo ?: null]);
                $user_id = $pdo->lastInsertId();

                // Устанавливаем сессию
                $_SESSION['user_id'] = $user_id;
                $_SESSION['username'] = $username;
                $_SESSION['authenticated'] = true;

                echo json_encode([
                    'success' => true,
                    'message' => 'VK registration successful',
                    'user' => [
                        'user_id' => $user_id,
                        'username' => $username,
                        'email' => $email,
                        'full_name' => $full_name,
                        'profile_image_url' => $photo
                    ]
                ]);
            }
            break;

        case 'logout':
            // Logout
            session_destroy();
            echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;

