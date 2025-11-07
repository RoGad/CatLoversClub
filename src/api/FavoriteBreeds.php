<?php
global $pdo;
require_once __DIR__ . '/../global/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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
    switch ($method) {
        case 'GET':
            // Get all favorite breeds for user
            $stmt = $pdo->prepare("
                SELECT b.breed_id, b.name, b.short_description, b.image_url, fb.favorite_id
                FROM favorite_breeds fb
                JOIN breeds b ON fb.breed_id = b.breed_id
                WHERE fb.user_id = ?
                ORDER BY b.name
            ");
            $stmt->execute([$user_id]);
            $favorite_breeds = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $favorite_breeds]);
            break;

        case 'POST':
            // Add favorite breed
            $input = json_decode(file_get_contents('php://input'), true);
            $breed_id = isset($input['breed_id']) ? intval($input['breed_id']) : 0;

            if ($breed_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid breed ID']);
                exit;
            }

            // Check if breed exists
            $stmt = $pdo->prepare("SELECT breed_id FROM breeds WHERE breed_id = ?");
            $stmt->execute([$breed_id]);
            $breed = $stmt->fetch();

            if (!$breed) {
                echo json_encode(['success' => false, 'message' => 'Breed not found']);
                exit;
            }

            // Check if already favorite
            $stmt = $pdo->prepare("SELECT favorite_id FROM favorite_breeds WHERE user_id = ? AND breed_id = ?");
            $stmt->execute([$user_id, $breed_id]);
            $existing = $stmt->fetch();

            if ($existing) {
                echo json_encode(['success' => false, 'message' => 'Breed already in favorites']);
                exit;
            }

            // Add to favorites
            $stmt = $pdo->prepare("INSERT INTO favorite_breeds (user_id, breed_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $breed_id]);
            $favorite_id = $pdo->lastInsertId();

            echo json_encode(['success' => true, 'message' => 'Breed added to favorites', 'data' => ['favorite_id' => $favorite_id]]);
            break;

        case 'DELETE':
            // Remove favorite breed
            $favorite_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

            if ($favorite_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid favorite ID']);
                exit;
            }

            // Verify ownership
            $stmt = $pdo->prepare("SELECT favorite_id FROM favorite_breeds WHERE favorite_id = ? AND user_id = ?");
            $stmt->execute([$favorite_id, $user_id]);
            $favorite = $stmt->fetch();

            if (!$favorite) {
                echo json_encode(['success' => false, 'message' => 'Favorite not found or access denied']);
                exit;
            }

            // Delete
            $stmt = $pdo->prepare("DELETE FROM favorite_breeds WHERE favorite_id = ? AND user_id = ?");
            $stmt->execute([$favorite_id, $user_id]);

            echo json_encode(['success' => true, 'message' => 'Breed removed from favorites']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;

