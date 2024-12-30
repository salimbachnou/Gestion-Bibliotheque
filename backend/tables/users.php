<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

include '../ConnectDB.php';
$objectDb = new DbConnect;
$conn = $objectDb->connect();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "OPTIONS") {
    http_response_code(200);
    exit();
}

try {
    switch($method) {
        case 'GET':
            // Si un ID est fourni, récupérer un utilisateur spécifique
            if (isset($_GET['id'])) {
                $sql = "SELECT id, name, prenom, email, phone, address, ville, role, date_of_birth, created_at, updated_at 
                        FROM users WHERE id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->execute([':id' => $_GET['id']]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user) {
                    echo json_encode([
                        'status' => 1,
                        'user' => $user
                    ]);
                } else {
                    throw new Exception('Utilisateur non trouvé');
                }
            } else {
                // Sinon, récupérer tous les utilisateurs
                $sql = "SELECT id, name, prenom, email, phone, address, ville, role, created_at, updated_at 
                        FROM users ORDER BY created_at DESC";
                $stmt = $conn->prepare($sql);
                $stmt->execute();
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'status' => 1,
                    'users' => $users
                ]);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Données invalides');
            }
            
            // Vérifier si l'email existe déjà
            $checkSql = "SELECT COUNT(*) FROM users WHERE email = :email";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->execute([':email' => $data['email']]);
            if ($checkStmt->fetchColumn() > 0) {
                throw new Exception('Cet email est déjà utilisé');
            }

            $sql = "INSERT INTO users (
                name, prenom, email, password, role, phone, address, ville, created_at
            ) VALUES (
                :name, :prenom, :email, :password, :role, :phone, :address, :ville, NOW()
            )";
            
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute([
                ':name' => $data['name'],
                ':prenom' => $data['prenom'],
                ':email' => $data['email'],
                ':password' => password_hash($data['password'], PASSWORD_DEFAULT),
                ':role' => $data['role'] ?? 'client',
                ':phone' => $data['phone'] ?? null,
                ':address' => $data['address'] ?? null,
                ':ville' => $data['ville'] ?? null
            ]);

            if (!$result) {
                throw new Exception('Erreur lors de la création de l\'utilisateur');
            }

            echo json_encode([
                'status' => 1,
                'message' => 'Utilisateur créé avec succès'
            ]);
            break;

        case 'PUT':
            if (!isset($_GET['id'])) {
                throw new Exception('ID manquant');
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Données invalides');
            }

            $sql = "UPDATE users SET 
                name = :name,
                prenom = :prenom,
                email = :email,
                role = :role,
                phone = :phone,
                address = :address,
                ville = :ville,
                updated_at = NOW()
                WHERE id = :id";
            
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute([
                ':id' => $_GET['id'],
                ':name' => $data['name'],
                ':prenom' => $data['prenom'],
                ':email' => $data['email'],
                ':role' => $data['role'],
                ':phone' => $data['phone'] ?? null,
                ':address' => $data['address'] ?? null,
                ':ville' => $data['ville'] ?? null
            ]);

            if (!$result) {
                throw new Exception('Erreur lors de la mise à jour');
            }

            echo json_encode([
                'status' => 1,
                'message' => 'Utilisateur mis à jour avec succès'
            ]);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                throw new Exception('ID manquant');
            }

            $sql = "DELETE FROM users WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute([':id' => $_GET['id']]);

            if (!$result) {
                throw new Exception('Erreur lors de la suppression');
            }

            echo json_encode([
                'status' => 1,
                'message' => 'Utilisateur supprimé avec succès'
            ]);
            break;

        default:
            throw new Exception('Méthode non autorisée');
    }
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 0,
        'message' => $e->getMessage()
    ]);
}
?>