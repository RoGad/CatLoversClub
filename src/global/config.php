<?php
// global/config.php
$host = 'localhost';
$port = '5432';           // при необходимости помен€й
$dbname = 'cat_club';
$user = 'postgres';
$password = 'GfgfVfvf04R';

$dsn = "pgsql:host={$host};dbname={$dbname}";

try {
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    // ƒл€ разработки возвращаем JSON Ч в проде лучше логировать и не выводить пароль/подробности
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
