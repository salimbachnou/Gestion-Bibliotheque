<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === "OPTIONS") {
    http_response_code(200);
    exit();
}

include '../ConnectDB.php';
$objectDb = new DbConnect;
$conn = $objectDb->connect();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validation des données
    if (empty($data['email']) || empty($data['password']) || empty($data['name']) || 
        empty($data['prenom']) || empty($data['ville']) || empty($data['date_of_birth'])) {
        throw new Exception('Tous les champs obligatoires doivent être remplis');
    }

    // Vérifier si l'email existe déjà
    $checkEmail = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $checkEmail->execute([$data['email']]);
    if ($checkEmail->rowCount() > 0) {
        throw new Exception('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    // Insérer le nouvel utilisateur
    $sql = "INSERT INTO users (
        name, prenom, email, password, phone, address, ville, 
        date_of_birth, role, created_at, updated_at
    ) VALUES (
        :name, :prenom, :email, :password, :phone, :address, :ville,
        :date_of_birth, 'client', NOW(), NOW()
    )";

    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([
        ':name' => $data['name'],
        ':prenom' => $data['prenom'],
        ':email' => $data['email'],
        ':password' => $hashedPassword,
        ':phone' => $data['phone'] ?? null,
        ':address' => $data['address'] ?? null,
        ':ville' => $data['ville'],
        ':date_of_birth' => $data['date_of_birth']
    ]);

    if ($result) {
        echo json_encode([
            'status' => 1,
            'message' => 'Inscription réussie'
        ]);
    } else {
        throw new Exception('Erreur lors de l\'inscription');
    }

} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 0,
        'message' => $e->getMessage()
    ]);
}
?> 