<?php
global $pdo;
require_once __DIR__ . '/../global/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

if (isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true) {
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'admin' => [
            'id' => $_SESSION['admin_id'],
            'username' => $_SESSION['admin_username']
        ]
    ]);
} else {
    echo json_encode([
        'success' => true,
        'authenticated' => false
    ]);
}
exit;

