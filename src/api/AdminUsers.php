<?php
global $pdo;
require_once __DIR__ . '/../global/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Check authentication
if (!isset($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all users or single user
            if (isset($_GET['id'])) {
                $user_id = intval($_GET['id']);
                $stmt = $pdo->prepare("SELECT user_id, username, email, full_name, profile_image_url, registration_date FROM users WHERE user_id = ?");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch();
                if (!$user) {
                    echo json_encode(['success' => false, 'message' => 'User not found']);
                    exit;
                }
                echo json_encode(['success' => true, 'data' => $user]);
            } else {
                // Get all users with count
                $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM users");
                $stmt->execute();
                $count = $stmt->fetch();

                $stmt = $pdo->prepare("SELECT user_id, username, email, full_name, profile_image_url, registration_date FROM users ORDER BY registration_date DESC");
                $stmt->execute();
                $users = $stmt->fetchAll();

                echo json_encode(['success' => true, 'data' => $users, 'count' => $count['total']]);
            }
            break;

        case 'PUT':
            // Update user
            $input = json_decode(file_get_contents('php://input'), true);
            $user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
            $username = isset($input['username']) ? trim($input['username']) : '';
            $email = isset($input['email']) ? trim($input['email']) : '';
            $full_name = isset($input['full_name']) ? trim($input['full_name']) : '';
            $profile_image_url = isset($input['profile_image_url']) ? trim($input['profile_image_url']) : '';

            if ($user_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
                exit;
            }

            $updates = [];
            $params = [];

            if (!empty($username)) {
                $updates[] = "username = ?";
                $params[] = $username;
            }
            if (!empty($email)) {
                $updates[] = "email = ?";
                $params[] = $email;
            }
            if ($full_name !== '') {
                $updates[] = "full_name = ?";
                $params[] = $full_name;
            }
            if ($profile_image_url !== '') {
                $updates[] = "profile_image_url = ?";
                $params[] = $profile_image_url;
            }

            if (empty($updates)) {
                echo json_encode(['success' => false, 'message' => 'No fields to update']);
                exit;
            }

            $params[] = $user_id;
            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE user_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['success' => true, 'message' => 'User updated']);
            break;

        case 'DELETE':
            // Delete user
            $user_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

            if ($user_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
            $stmt->execute([$user_id]);

            echo json_encode(['success' => true, 'message' => 'User deleted']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;

