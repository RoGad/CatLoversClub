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
            // Get all breeds
            $stmt = $pdo->prepare("SELECT breed_id, name, short_description, full_description, image_url FROM breeds ORDER BY name");
            $stmt->execute();
            $breeds = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $breeds]);
            break;

        case 'POST':
            // Create new breed
            $input = json_decode(file_get_contents('php://input'), true);
            $name = isset($input['name']) ? trim($input['name']) : '';
            $short_description = isset($input['short_description']) ? trim($input['short_description']) : '';
            $full_description = isset($input['full_description']) ? trim($input['full_description']) : '';
            $image_url = isset($input['image_url']) ? trim($input['image_url']) : '';

            if (empty($name)) {
                echo json_encode(['success' => false, 'message' => 'Name is required']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO breeds (name, short_description, full_description, image_url) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $short_description, $full_description, $image_url]);
            $breed_id = $pdo->lastInsertId();

            echo json_encode(['success' => true, 'message' => 'Breed created', 'data' => ['breed_id' => $breed_id]]);
            break;

        case 'PUT':
            // Update breed
            $input = json_decode(file_get_contents('php://input'), true);
            $breed_id = isset($input['breed_id']) ? intval($input['breed_id']) : 0;
            $name = isset($input['name']) ? trim($input['name']) : '';
            $short_description = isset($input['short_description']) ? trim($input['short_description']) : '';
            $full_description = isset($input['full_description']) ? trim($input['full_description']) : '';
            $image_url = isset($input['image_url']) ? trim($input['image_url']) : '';

            if ($breed_id <= 0 || empty($name)) {
                echo json_encode(['success' => false, 'message' => 'Invalid breed ID or name']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE breeds SET name = ?, short_description = ?, full_description = ?, image_url = ? WHERE breed_id = ?");
            $stmt->execute([$name, $short_description, $full_description, $image_url, $breed_id]);

            echo json_encode(['success' => true, 'message' => 'Breed updated']);
            break;

        case 'DELETE':
            // Delete breed
            $breed_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

            if ($breed_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid breed ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM breeds WHERE breed_id = ?");
            $stmt->execute([$breed_id]);

            echo json_encode(['success' => true, 'message' => 'Breed deleted']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;

