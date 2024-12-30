<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 0, 'message' => 'Méthode non autorisée']);
    exit();
}

try {
    if (!isset($_FILES['image'])) {
        throw new Exception('Aucune image n\'a été envoyée');
    }

    $file = $_FILES['image'];
    $fileName = $file['name'];
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    // Vérifier le type de fichier
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($fileType, $allowedTypes)) {
        throw new Exception('Seuls les fichiers JPG, JPEG, PNG et GIF sont autorisés');
    }

    // Vérifier la taille du fichier (2MB max)
    if ($file['size'] > 2000000) {
        throw new Exception('L\'image ne doit pas dépasser 2MB');
    }

    // Générer un nom unique pour le fichier
    $newFileName = uniqid() . '.' . $fileType;
    $uploadPath = 'uploads/books/' . $newFileName;
    $fullPath = dirname(__FILE__) . '/' . $uploadPath;  // Chemin complet pour l'upload

    // Créer le dossier s'il n'existe pas
    if (!file_exists(dirname($fullPath))) {
        mkdir(dirname($fullPath), 0777, true);
    }

    // Déplacer le fichier
    if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
        throw new Exception('Erreur lors de l\'upload du fichier');
    }

    echo json_encode([
        'status' => 1,
        'message' => 'Image uploadée avec succès',
        'path' => $uploadPath,
        'filename' => $newFileName  // Ajout du nom du fichier seul
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 0,
        'message' => $e->getMessage()
    ]);
}
?>