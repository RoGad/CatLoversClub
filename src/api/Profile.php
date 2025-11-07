<?php
global $pdo;
require_once __DIR__ . '/../global/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$user_id = isset($_GET['id']) ? intval($_GET['id']) : 1;

try {
    $stmt = $pdo->prepare("SELECT user_id, username, full_name, profile_image_url FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT p.pet_id, p.name, p.age, p.gender, p.image_url, p.description,
               b.breed_id, b.name as breed_name, b.short_description as breed_description
        FROM pets p
        JOIN breeds b ON p.breed_id = b.breed_id
        WHERE p.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $pets = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => ['user' => $user, 'pets' => $pets]]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;