<?php
global $pdo, $breed_id;
require_once __DIR__ . '/../global/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $stmt = $pdo->prepare("SELECT breed_id, name, short_description, image_url FROM breeds ORDER BY name");
    $stmt->execute();
    $breeds = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $breeds]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;