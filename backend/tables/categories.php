<?php
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Content-Type: application/json");

    include '../ConnectDB.php';
    $objectDb = new DbConnect;
    $conn = $objectDb->connect();

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'GET':
            try {
                $sql = "SELECT c.*, 
                        (SELECT COUNT(*) FROM books WHERE category_id = c.id) as book_count 
                        FROM categories c";
                $stmt = $conn->prepare($sql);
                $stmt->execute();
                $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'status' => 1,
                    'categories' => $categories
                ]);
            } catch(Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 0,
                    'message' => $e->getMessage()
                ]);
            }
            break;

        case 'POST':
            try {
                $category = json_decode(file_get_contents('php://input'), true);
                
                if (!isset($category['name']) || empty($category['name'])) {
                    throw new Exception('Le nom de la catégorie est requis');
                }

                $sql = "INSERT INTO categories (name, description, nombre_livres, created_at) 
                        VALUES (:name, :description, 0, NOW())";
                $stmt = $conn->prepare($sql);
                $stmt->execute([
                    ':name' => $category['name'],
                    ':description' => $category['description'] ?? null
                ]);

                echo json_encode([
                    'status' => 1,
                    'message' => 'Catégorie ajoutée avec succès'
                ]);
            } catch(Exception $e) {
                http_response_code(400);
                echo json_encode([
                    'status' => 0,
                    'message' => $e->getMessage()
                ]);
            }
            break;

        case 'PUT':
            try {
                $category = json_decode(file_get_contents('php://input'), true);
                $id = $_GET['id'] ?? null;

                if (!$id) {
                    throw new Exception('ID manquant');
                }

                $sql = "UPDATE categories SET 
                        name = :name,
                        description = :description,
                        updated_at = NOW()
                        WHERE id = :id";
                
                $stmt = $conn->prepare($sql);
                $stmt->execute([
                    ':id' => $id,
                    ':name' => $category['name'],
                    ':description' => $category['description'] ?? null
                ]);

                echo json_encode([
                    'status' => 1,
                    'message' => 'Catégorie modifiée avec succès'
                ]);
            } catch(Exception $e) {
                http_response_code(400);
                echo json_encode([
                    'status' => 0,
                    'message' => $e->getMessage()
                ]);
            }
            break;

        case 'DELETE':
            try {
                $id = $_GET['id'] ?? null;

                if (!$id) {
                    throw new Exception('ID manquant');
                }

                // Vérifier si la catégorie a des livres
                $checkSql = "SELECT COUNT(*) FROM books WHERE category_id = :id";
                $checkStmt = $conn->prepare($checkSql);
                $checkStmt->execute([':id' => $id]);
                $count = $checkStmt->fetchColumn();

                if ($count > 0) {
                    throw new Exception('Impossible de supprimer la catégorie car elle contient des livres');
                }

                $sql = "DELETE FROM categories WHERE id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->execute([':id' => $id]);

                echo json_encode([
                    'status' => 1,
                    'message' => 'Catégorie supprimée avec succès'
                ]);
            } catch(Exception $e) {
                http_response_code(400);
                echo json_encode([
                    'status' => 0,
                    'message' => $e->getMessage()
                ]);
            }
            break;

        case 'OPTIONS':
            http_response_code(200);
            break;
    }
?>