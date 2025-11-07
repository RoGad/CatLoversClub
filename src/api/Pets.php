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
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all pets for user
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
            echo json_encode(['success' => true, 'data' => $pets]);
            break;

        case 'POST':
            // Add pet
            $input = json_decode(file_get_contents('php://input'), true);
            $name = isset($input['name']) ? trim($input['name']) : '';
            $breed_id = isset($input['breed_id']) ? intval($input['breed_id']) : 0;
            $age = isset($input['age']) ? intval($input['age']) : null;
            $gender = isset($input['gender']) ? trim($input['gender']) : '';
            $image_url = isset($input['image_url']) ? trim($input['image_url']) : '';
            $description = isset($input['description']) ? trim($input['description']) : '';

            if (empty($name) || $breed_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Name and breed are required']);
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

            // Insert pet - convert empty gender to NULL
            $gender_value = (!empty($gender)) ? $gender : null;
            $stmt = $pdo->prepare("INSERT INTO pets (user_id, breed_id, name, age, gender, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$user_id, $breed_id, $name, $age, $gender_value, $image_url, $description]);
            $pet_id = $pdo->lastInsertId();

            echo json_encode(['success' => true, 'message' => 'Pet added', 'data' => ['pet_id' => $pet_id]]);
            break;

        case 'PUT':
            // Update pet
            $input = json_decode(file_get_contents('php://input'), true);
            $pet_id = isset($input['pet_id']) ? intval($input['pet_id']) : 0;
            $name = isset($input['name']) ? trim($input['name']) : '';
            $breed_id = isset($input['breed_id']) ? intval($input['breed_id']) : 0;
            $age = isset($input['age']) ? intval($input['age']) : null;
            $gender = isset($input['gender']) ? trim($input['gender']) : '';
            $image_url = isset($input['image_url']) ? trim($input['image_url']) : '';
            $description = isset($input['description']) ? trim($input['description']) : '';

            if ($pet_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid pet ID']);
                exit;
            }

            // Verify ownership
            $stmt = $pdo->prepare("SELECT pet_id FROM pets WHERE pet_id = ? AND user_id = ?");
            $stmt->execute([$pet_id, $user_id]);
            $pet = $stmt->fetch();

            if (!$pet) {
                echo json_encode(['success' => false, 'message' => 'Pet not found or access denied']);
                exit;
            }

            $updates = [];
            $params = [];

            if (!empty($name)) {
                $updates[] = "name = ?";
                $params[] = $name;
            }
            if ($breed_id > 0) {
                $updates[] = "breed_id = ?";
                $params[] = $breed_id;
            }
            if ($age !== null) {
                $updates[] = "age = ?";
                $params[] = $age;
            }
            if ($gender !== '') {
                $updates[] = "gender = ?";
                $params[] = $gender;
            } else if (isset($input['gender']) && $input['gender'] === '') {
                // Allow setting gender to NULL
                $updates[] = "gender = ?";
                $params[] = null;
            }
            if ($image_url !== '') {
                $updates[] = "image_url = ?";
                $params[] = $image_url;
            }
            if ($description !== '') {
                $updates[] = "description = ?";
                $params[] = $description;
            }

            if (empty($updates)) {
                echo json_encode(['success' => false, 'message' => 'No fields to update']);
                exit;
            }

            $params[] = $pet_id;
            $sql = "UPDATE pets SET " . implode(', ', $updates) . " WHERE pet_id = ? AND user_id = ?";
            $params[] = $user_id;
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['success' => true, 'message' => 'Pet updated']);
            break;

        case 'DELETE':
            // Delete pet
            $pet_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

            if ($pet_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid pet ID']);
                exit;
            }

            // Verify ownership
            $stmt = $pdo->prepare("SELECT pet_id FROM pets WHERE pet_id = ? AND user_id = ?");
            $stmt->execute([$pet_id, $user_id]);
            $pet = $stmt->fetch();

            if (!$pet) {
                echo json_encode(['success' => false, 'message' => 'Pet not found or access denied']);
                exit;
            }

            // Delete
            $stmt = $pdo->prepare("DELETE FROM pets WHERE pet_id = ? AND user_id = ?");
            $stmt->execute([$pet_id, $user_id]);

            echo json_encode(['success' => true, 'message' => 'Pet deleted']);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;

