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
    if (!$data) {
        throw new Exception('Données invalides');
    }

    // Vérification des champs requis
    if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
        throw new Exception('Tous les champs sont obligatoires');
    }

    // Validation de l'email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Veuillez entrer une adresse email valide');
    }

    // Validation de la longueur du message
    if (strlen($data['message']) < 10) {
        throw new Exception('Le message doit contenir au moins 10 caractères');
    }

    // Validation du nom
    if (strlen($data['name']) < 2) {
        throw new Exception('Le nom doit contenir au moins 2 caractères');
    }

    

    // Insertion du message
    $sql = "INSERT INTO contact_messages (name, email, message, status, created_at) 
            VALUES (:name, :email, :message, 'non_lu', NOW())";
    
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([
        ':name' => htmlspecialchars($data['name']),
        ':email' => $data['email'],
        ':message' => htmlspecialchars($data['message'])
    ]);

    if ($result) {
        // Récupérer les paramètres de la bibliothèque pour l'email
        $settingsStmt = $conn->query("SELECT email FROM settings LIMIT 1");
        $settings = $settingsStmt->fetch(PDO::FETCH_ASSOC);
        
        // Envoyer un email si l'adresse est configurée
        if ($settings && $settings['email']) {
            $to = $settings['email'];
            $subject = "Nouveau message de contact - BiblioTech";
            $messageBody = "Nouveau message reçu de : \n\n";
            $messageBody .= "Nom : " . $data['name'] . "\n";
            $messageBody .= "Email : " . $data['email'] . "\n\n";
            $messageBody .= "Message :\n" . $data['message'];
            
            $headers = "From: " . $data['email'] . "\r\n";
            $headers .= "Reply-To: " . $data['email'] . "\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion();

            mail($to, $subject, $messageBody, $headers);
        }

        echo json_encode([
            'status' => 1,
            'message' => 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
        ]);
    } else {
        throw new Exception('Une erreur est survenue lors de l\'envoi du message');
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 0,
        'message' => 'Erreur de base de données: ' . $e->getMessage()
    ]);
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 0,
        'message' => $e->getMessage()
    ]);
}
?>