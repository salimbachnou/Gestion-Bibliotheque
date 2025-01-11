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
                $sql = "SELECT b.*, c.name as category_name 
                        FROM books b 
                        LEFT JOIN categories c ON b.category_id = c.id";
                $stmt = $conn->prepare($sql);
                $stmt->execute();
                $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'status' => 1,
                    'books' => $books
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
                $book = json_decode(file_get_contents('php://input'), true);
                
                $sql = "INSERT INTO books (
                    title, author, isbn, description, publication_year,
                    number_pages, image, emplacement, statut, category_id, 
                    quantite, created_at
                ) VALUES (
                    :title, :author, :isbn, :description, :publication_year,
                    :number_pages, :image, :emplacement, :statut, :category_id,
                    :quantite, NOW()
                )";
                
                $stmt = $conn->prepare($sql);
                $result = $stmt->execute([
                    ':title' => $book['title'],
                    ':author' => $book['author'],
                    ':isbn' => $book['isbn'],
                    ':description' => $book['description'],
                    ':publication_year' => $book['publication_year'],
                    ':number_pages' => $book['number_pages'],
                    ':image' => $book['image'] ?? null,
                    ':emplacement' => $book['emplacement'],
                    ':statut' => $book['quantite'] > 0 ? 'disponible' : 'emprunte',
                    ':category_id' => $book['category_id'],
                    ':quantite' => $book['quantite'] ?? 1
                ]);

                if ($result) {
                    $newId = $conn->lastInsertId();
                    echo json_encode([
                        'status' => 1,
                        'message' => 'Livre ajouté avec succès',
                        'id' => $newId
                    ]);
                } else {
                    throw new Exception('Erreur lors de l\'ajout du livre');
                }
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
                $book = json_decode(file_get_contents('php://input'), true);
                $id = $_GET['id'] ?? null;

                if (!$id) {
                    throw new Exception('ID manquant');
                }

                $sql = "UPDATE books SET 
                    title = :title,
                    author = :author,
                    isbn = :isbn,
                    description = :description,
                    publication_year = :publication_year,
                    number_pages = :number_pages,
                    image = :image,
                    emplacement = :emplacement,
                    quantite = :quantite,
                    statut = CASE 
                        WHEN :quantite <= 0 THEN 'emprunte'
                        ELSE 'disponible'
                    END,
                    category_id = :category_id,
                    updated_at = NOW()
                    WHERE id = :id";
                
                $stmt = $conn->prepare($sql);
                $result = $stmt->execute([
                    ':id' => $id,
                    ':title' => $book['title'],
                    ':author' => $book['author'],
                    ':isbn' => $book['isbn'],
                    ':description' => $book['description'],
                    ':publication_year' => $book['publication_year'],
                    ':number_pages' => $book['number_pages'],
                    ':image' => $book['image'] ?? null,
                    ':emplacement' => $book['emplacement'],
                    ':quantite' => $book['quantite'],
                    ':category_id' => $book['category_id']
                ]);

                if ($result) {
                    echo json_encode([
                        'status' => 1,
                        'message' => 'Livre modifié avec succès'
                    ]);
                } else {
                    throw new Exception('Erreur lors de la mise à jour');
                }
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

                // Récupérer la catégorie avant la suppression
                $getCatSql = "SELECT category_id FROM books WHERE id = :id";
                $getCatStmt = $conn->prepare($getCatSql);
                $getCatStmt->execute([':id' => $id]);
                $categoryId = $getCatStmt->fetchColumn();

                // Vérifier si le livre est emprunté
                $checkSql = "SELECT COUNT(*) FROM reservations WHERE book_id = :id AND status = 'emprunte'";
                $checkStmt = $conn->prepare($checkSql);
                $checkStmt->execute([':id' => $id]);
                $count = $checkStmt->fetchColumn();

                if ($count > 0) {
                    throw new Exception('Impossible de supprimer le livre car il est actuellement emprunté');
                }

                // Supprimer le livre
                $sql = "DELETE FROM books WHERE id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->execute([':id' => $id]);

                // Mettre à jour le nombre de livres dans la catégorie
                $updateCatSql = "UPDATE categories SET nombre_livres = nombre_livres - 1 WHERE id = :category_id";
                $updateCatStmt = $conn->prepare($updateCatSql);
                $updateCatStmt->execute([':category_id' => $categoryId]);

                echo json_encode([
                    'status' => 1,
                    'message' => 'Livre supprimé avec succès'
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

        default:
            http_response_code(405);
            echo json_encode([
                'status' => 0,
                'message' => 'Méthode non autorisée'
            ]);
            break;
    }
?>