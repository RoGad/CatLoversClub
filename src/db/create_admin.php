<?php
// Script to create an admin user
// Usage: php create_admin.php <username> <password>

global $pdo;
require_once __DIR__ . '/../global/config.php';

if ($argc < 3) {
    echo "Usage: php create_admin.php <username> <password>\n";
    exit(1);
}

$username = $argv[1];
$password = $argv[2];

// Hash the password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    // Check if admin already exists
    $stmt = $pdo->prepare("SELECT admin_id FROM admins WHERE username = ?");
    $stmt->execute([$username]);
    $existing = $stmt->fetch();

    if ($existing) {
        echo "Admin with username '$username' already exists!\n";
        echo "Updating password...\n";
        
        $stmt = $pdo->prepare("UPDATE admins SET password_hash = ? WHERE username = ?");
        $stmt->execute([$password_hash, $username]);
        echo "Password updated successfully!\n";
    } else {
        $stmt = $pdo->prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)");
        $stmt->execute([$username, $password_hash]);
        echo "Admin user '$username' created successfully!\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

