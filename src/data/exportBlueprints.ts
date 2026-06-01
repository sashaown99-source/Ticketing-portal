export const BLUEPRINT_SQL = `-- IT Support Ticket Management System Database Schema
-- DBMS: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS \`it_support_portal\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`it_support_portal\`;

-- 1. Users Table (Support Password Hashing via PHP password_hash())
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('employee', 'admin') NOT NULL DEFAULT 'employee',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (\`email\`)
) ENGINE=InnoDB;

-- 2. Ticket Categories Table
CREATE TABLE IF NOT EXISTS \`categories\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Insert Default Categories
INSERT IGNORE INTO \`categories\` (\`name\`) VALUES 
('Hardware'), 
('Software'), 
('Network'), 
('Others');

-- 3. Tickets Table
CREATE TABLE IF NOT EXISTS \`tickets\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`userId\` INT NOT NULL,
  \`subject\` VARCHAR(150) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`category_id\` INT NOT NULL,
  \`priority\` ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
  \`status\` ENUM('Open', 'In Progress', 'On Hold', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
  \`screenshot_url\` VARCHAR(255) NULL,
  \`assigned_to\` INT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`),
  FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL,
  INDEX idx_status_priority (\`status\`, \`priority\`),
  INDEX idx_user (\`userId\`)
) ENGINE=InnoDB;

-- 4. Comments Table
CREATE TABLE IF NOT EXISTS \`comments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`ticket_id\` INT NOT NULL,
  \`user_id\` INT NOT NULL,
  \`comment_text\` TEXT NOT NULL,
  \`is_internal\` TINYINT(1) NOT NULL DEFAULT 0, -- 1 = IT internal hidden notes, 0 = Public
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`ticket_id\`) REFERENCES \`tickets\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  INDEX idx_ticket (\`ticket_id\`)
) ENGINE=InnoDB;

-- 5. Ticket Assignments & Audit Logs Table
CREATE TABLE IF NOT EXISTS \`ticket_assignments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`ticket_id\` INT NOT NULL,
  \`assigned_by\` INT NOT NULL,
  \`assigned_to\` INT NOT NULL,
  \`assigned_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`ticket_id\`) REFERENCES \`tickets\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`assigned_by\`) REFERENCES \`users\`(\`id\`),
  FOREIGN KEY (\`assigned_to\`) REFERENCES \`users\`(\`id\`)
) ENGINE=InnoDB;

-- Seed Sample Data (Pre-hashed passwords using password_hash('password123', PASSWORD_BCRYPT))
-- Admin: admin@company.com / password123
-- Employee: employee@company.com / password123
INSERT IGNORE INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`role\`) VALUES
(1, 'Sarah Jenkins (IT Admin)', 'admin@company.com', '$2y$10$wEPlU9t40y.5wUo7S6p9aOlR4G/hUfXv4K6G1B.vVdlyZ6Q4/kUe2', 'admin'),
(2, 'Marcus Vance (IT Staff)', 'marcus@company.com', '$2y$10$wEPlU9t40y.5wUo7S6p9aOlR4G/hUfXv4K6G1B.vVdlyZ6Q4/kUe2', 'admin'),
(3, 'Sasha Chen', 'employee@company.com', '$2y$10$wEPlU9t40y.5wUo7S6p9aOlR4G/hUfXv4K6G1B.vVdlyZ6Q4/kUe2', 'employee');
`;

export const BLUEPRINT_PHP_CONN = `<?php
// db_conn.php - Secure PDO Connection Module

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'your_password_here');
define('DB_NAME', 'it_support_portal');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // In production, log error instead of exposing database details
    error_log($e->getMessage());
    die("Database Connection Failed. Please try again later.");
}
?>
`;

export const BLUEPRINT_PHP_AUTH = `<?php
// auth.php - Role-Based Authentication & Session Manager
session_start();
require_once 'db_conn.php';

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Ensure user has specific role
function enforceRole($role) {
    if (!isLoggedIn()) {
        header("Location: login.php");
        exit;
    }
    if ($_SESSION['user_role'] !== $role) {
        http_response_code(403);
        die("403 Forbidden: You do not have permissions to access this screen.");
    }
}

// User Registration with Password Hashing
function registerUser($name, $email, $password) {
    global $pdo;
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        return "Email address is already registered.";
    }
    
    // Secure Password Hash
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'employee')");
    if ($stmt->execute([$name, $email, $hash])) {
        return true;
    }
    return "Registration failed. Please attempt again.";
}

// Secure Login (Protects against SQL Injection & Timing Attacks)
function loginUser($email, $password) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        // Regenerate Session ID to protect against session fixation
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        return true;
    }
    return false;
}
?>
`;

export const BLUEPRINT_PHP_TICKET = `<?php
// create_ticket.php - Secure Ticket Creation & File Validation
require_once 'auth.php';
// Restrict to log-in users
if (!isLoggedIn()) {
    header("Location: login.php");
    exit;
}

$error = null;
$success = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $subject = trim($_POST['subject'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $categoryId = intval($_POST['category_id'] ?? 0);
    $priority = $_POST['priority'] ?? 'Medium';
    
    // Sanitization & Validation
    if (empty($subject) || empty($description) || $categoryId === 0) {
        $error = "Subject, description, and category are required fields.";
    } elseif (!in_array($priority, ['Low', 'Medium', 'High', 'Urgent'])) {
        $error = "Invalid priority magnitude selected.";
    } else {
        $screenshotPath = null;
        
        // Secure File Upload Handlers
        if (isset($_FILES['screenshot']) && $_FILES['screenshot']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['screenshot']['tmp_name'];
            $fileName = $_FILES['screenshot']['name'];
            $fileSize = $_FILES['screenshot']['size'];
            $fileType = $_FILES['screenshot']['type'];
            
            // Validate file size limit (5MB)
            if ($fileSize > 5 * 1024 * 1024) {
                $error = "File size must be under 5MB.";
            } else {
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                $pathParts = pathinfo($fileName);
                $fileExtension = strtolower($pathParts['extension'] ?? '');
                
                // Inspect extension & mime type to prevent RCE (Remote Code Execution)
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $fileTmpPath);
                finfo_close($finfo);
                
                $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
                
                if (in_array($fileExtension, $allowedExtensions) && in_array($mimeType, $allowedMimeTypes)) {
                    // Prevent path traversal & collisions by hashing the filename
                    $uploadDir = './uploads/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    $newFileName = bin2hex(random_bytes(16)) . '.' . $fileExtension;
                    $destPath = $uploadDir . $newFileName;
                    
                    if (move_uploaded_file($fileTmpPath, $destPath)) {
                        $screenshotPath = $destPath;
                    } else {
                        $error = "Error shifting uploaded file to the destination directory.";
                    }
                } else {
                    $error = "Invalid image system format. Authorized files are: JPG, JPEG, PNG, GIF.";
                }
            }
        }
        
        // If file uploads did not return errors, insert ticket
        if (!$error) {
            global $pdo;
            $userId = $_SESSION['user_id'];
            
            $stmt = $pdo->prepare("INSERT INTO tickets (userId, subject, description, category_id, priority, status, screenshot_url) VALUES (?, ?, ?, ?, ?, 'Open', ?)");
            try {
                $stmt->execute([$userId, $subject, $description, $categoryId, $priority, $screenshotPath]);
                $success = "Ticket safely created! ID reference dispatched.";
            } catch (PDOException $e) {
                error_log($e->getMessage());
                $error = "SQL insertion err. Failed to register the ticket.";
            }
        }
    }
}
?>
`;

export const BLUEPRINT_PHP_ADMIN = `<?php
// admin_dashboard.php - Admin Ticket Control & Search Panel
require_once 'auth.php';
// Secure admin authorization guard
enforceRole('admin');

global $pdo;

// Fetch Dashboard KPI Stats
$stats = [
    'total' => $pdo->query("SELECT COUNT(*) FROM tickets")->fetchColumn(),
    'open' => $pdo->query("SELECT COUNT(*) FROM tickets WHERE status = 'Open'")->fetchColumn(),
    'in_progress' => $pdo->query("SELECT COUNT(*) FROM tickets WHERE status = 'In Progress'")->fetchColumn(),
    'closed' => $pdo->query("SELECT COUNT(*) FROM tickets WHERE status = 'Closed'")->fetchColumn()
];

// Read Request Filters
$statusFilter = $_GET['status'] ?? '';
$priorityFilter = $_GET['priority'] ?? '';
$searchQuery = $_GET['search'] ?? '';

// Build Safe Parameterized Filter Queries
$query = "SELECT t.*, u.name as employee_name, c.name as category_name 
          FROM tickets t 
          JOIN users u ON t.userId = u.id
          JOIN categories c ON t.category_id = c.id
          WHERE 1=1";
$params = [];

if (!empty($statusFilter)) {
    $query .= " AND t.status = ?";
    $params[] = $statusFilter;
}

if (!empty($priorityFilter)) {
    $query .= " AND t.priority = ?";
    $params[] = $priorityFilter;
}

if (!empty($searchQuery)) {
    $query .= " AND (t.subject LIKE ? OR t.description LIKE ?)";
    $params[] = "%$searchQuery%";
    $params[] = "%$searchQuery%";
}

$query .= " ORDER BY t.created_at DESC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$tickets = $stmt->fetchAll();
?>
`;

export const BLUEPRINT_INSTRUCTIONS = `# Setup and Installation Instructions

Follow these instructions to run the IT Support Ticket Management Portal on your local PHP/MySQL server.

## Prerequisites
1. **Local Server Environment**: PHP 8.0+ and MySQL 5.7+ (e.g., XAMPP, WAMP, MAMP, or Docker).
2. **Web Browser**: Chrome, Safari, Firefox, or Edge.

## Step 1: Initialize Database
1. Open **phpMyAdmin** or your preferred SQL Client (e.g. DBeaver, TablePlus).
2. Create a new database named \`it_support_portal\`.
3. Select the newly created database and click the **SQL** tab.
4. Copy the entire content of your \`schema.sql\` file, paste it inside the SQL query panel, and click **Go** / **Execute**.
5. This registers the tables and pre-seeds standard accounts:
   - **Admin Login**: \`admin@company.com\` (Password: \`password123\`)
   - **IT Staff Login**: \`marcus@company.com\` (Password: \`password123\`)
   - **Employee Login**: \`employee@company.com\` (Password: \`password123\`)

## Step 2: Configure Environment Connection
1. Locate the file \`db_conn.php\`.
2. Modify the configuration constants to match your database user credentials:
   \`\`\`php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root'); // Default XAMPP username
   define('DB_PASS', '');     // Default XAMPP blank password
   define('DB_NAME', 'it_support_portal');
   \`\`\`

## Step 3: Set Up Folder Permissions for Uploads
1. Create a subdirectory named \`uploads\` inside your project folder.
2. Grant read/write permissions to your Web Server (Apache/Nginx):
   - **Linux/macOS**: \`chmod 755 uploads\` or \`chmod 777 uploads\` for open local environments.
   - **Windows**: Automatic write access is typically granted by default within XAMPP's \`htdocs\` folder.

## Step 4: Run Application
1. Place the entire source codebase in the server's public document root directory (e.g. \`C:/xampp/htdocs/it-portal/\` or \`/var/www/html/it-portal/\`).
2. Start Apache and MySQL services through your control panel interface.
3. Open your browser and navigate to:
   \`http://localhost/it-portal/login.php\`

## Security Design Implementation
- **SQL Injection Guard**: All database communication binds parameters using explicit **PDO prepared statements**, preventing injections.
- **Dynamic CSS Integration**: Implements the bootstrap framework globally via public CDN references inside headers, maintaining responsive support.
- **Passwords Hashing**: Uses PHP's native \`password_hash()\` using highly resistant **BCrypt** hashing with a custom performance factor (12 cycles).
- **Upload Isolation**: Mitigates Remote Code Execution (RCE) by verifying extension buffers, checking mime-type properties directly at source binary blocks instead of trusting filenames, and hashing filenames on move.
`;
