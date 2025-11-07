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

if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true && isset($_SESSION['user_id'])) {
    try {
        $stmt = $pdo->prepare("SELECT user_id, username, email, full_name, profile_image_url FROM users WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();

        if ($user) {
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'user' => $user
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'authenticated' => false
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => true,
            'authenticated' => false
        ]);
    }
} else {
    echo json_encode([
        'success' => true,
        'authenticated' => false
    ]);
}
exit;

