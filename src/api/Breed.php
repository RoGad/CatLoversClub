<?php
global $pdo;
require_once __DIR__ . '/../global/config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$breed_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($breed_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid breed ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT breed_id, name, full_description, image_url FROM breeds WHERE breed_id = ?");
    $stmt->execute([$breed_id]);
    $breed = $stmt->fetch();

    if (!$breed) {
        echo json_encode(['success' => false, 'message' => 'Breed not found']);
        exit;
    }

    echo json_encode(['success' => true, 'data' => $breed]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;