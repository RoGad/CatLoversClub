<?php
global $pdo;
require_once __DIR__ . '/../global/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// Check authentication
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get user profile with favorite breeds and pets
        $stmt = $pdo->prepare("SELECT user_id, username, email, full_name, profile_image_url, registration_date FROM users WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }

        // Get favorite breeds (handle case when table doesn't exist)
        $favorite_breeds = [];
        try {
            $stmt = $pdo->prepare("
                SELECT b.breed_id, b.name, b.short_description, b.image_url, fb.favorite_id
                FROM favorite_breeds fb
                JOIN breeds b ON fb.breed_id = b.breed_id
                WHERE fb.user_id = ?
                ORDER BY b.name
            ");
            $stmt->execute([$user_id]);
            $favorite_breeds = $stmt->fetchAll();
        } catch (PDOException $e) {
            // Table might not exist yet, return empty array
            $favorite_breeds = [];
        }

        // Get pets (handle case when table doesn't exist)
        $pets = [];
        try {
            $stmt = $pdo->prepare("
                SELECT p.pet_id, p.name, p.age, p.gender, p.image_url, p.description,
                       b.breed_id, b.name as breed_name, b.short_description as breed_description
                FROM pets p
                JOIN breeds b ON p.breed_id = b.breed_id
                WHERE p.user_id = ?
                ORDER BY p.name
            ");
            $stmt->execute([$user_id]);
            $pets = $stmt->fetchAll();
        } catch (PDOException $e) {
            // Table might not exist yet, return empty array
            $pets = [];
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'user' => $user,
                'favorite_breeds' => $favorite_breeds,
                'pets' => $pets
            ]
        ]);
    } elseif ($method === 'PUT') {
        // Update user profile
        $input = json_decode(file_get_contents('php://input'), true);
        $full_name = isset($input['full_name']) ? trim($input['full_name']) : '';
        $profile_image_url = isset($input['profile_image_url']) ? trim($input['profile_image_url']) : '';

        $updates = [];
        $params = [];

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

        echo json_encode(['success' => true, 'message' => 'Profile updated']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;

