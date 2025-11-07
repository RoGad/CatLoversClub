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

