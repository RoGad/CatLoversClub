<?php
global $pdo;
require_once __DIR__ . '/../global/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $stmt = $pdo->prepare("SELECT competition_id, title, description, image_url, start_date, end_date, is_active FROM competitions WHERE is_active = TRUE ORDER BY start_date DESC");
    $stmt->execute();
    $competitions = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $competitions]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
exit;