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
                $sql = "SELECT 
                    r.*,
                    b.title as book_title,
                    b.author as book_author,
                    u.name as user_name,
                    u.prenom as user_prenom
                    FROM reservations r
                    JOIN books b ON r.book_id = b.id
                    JOIN users u ON r.user_id = u.id
                    ORDER BY r.created_at DESC";
                
                $stmt = $conn->prepare($sql);
                $stmt->execute();
                $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'status' => 1,
                    'reservations' => $reservations
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
                $reservation = json_decode(file_get_contents('php://input'), true);
                
                // Vérifier la disponibilité
                $checkSql = "SELECT statut, quantite FROM books WHERE id = :book_id";
                $checkStmt = $conn->prepare($checkSql);
                $checkStmt->execute([':book_id' => $reservation['book_id']]);
                $bookInfo = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($bookInfo['quantite'] <= 0) {
                    throw new Exception('Aucun exemplaire disponible de ce livre');
                }

                // Créer la réservation
                $sql = "INSERT INTO reservations (
                    user_id, book_id, borrow_date, due_date, status, created_at
                ) VALUES (
                    :user_id, :book_id, :borrow_date, :return_date, 'en attente', NOW()
                )";
                
                $stmt = $conn->prepare($sql);
                $stmt->execute([
                    ':user_id' => $reservation['user_id'],
                    ':book_id' => $reservation['book_id'],
                    ':borrow_date' => $reservation['borrow_date'],
                    ':return_date' => $reservation['return_date']
                ]);

                echo json_encode([
                    'status' => 1,
                    'message' => 'Demande de réservation envoyée avec succès'
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
                $id = $_GET['id'] ?? null;
                $data = json_decode(file_get_contents('php://input'));

                if (!$id) {
                    throw new Exception('ID manquant');
                }

                // Commencer une transaction
                $conn->beginTransaction();

                try {
                    // Récupérer l'information du livre
                    $getBookSql = "SELECT book_id FROM reservations WHERE id = :id";
                    $getBookStmt = $conn->prepare($getBookSql);
                    $getBookStmt->execute([':id' => $id]);
                    $bookId = $getBookStmt->fetchColumn();

                    // Pas besoin de normaliser le statut
                    $status = $data->status;

                    // Mettre à jour la réservation
                    if ($status === 'emprunte') {
                        // Calculer les dates
                        $borrowDate = date('Y-m-d');
                        $dueDate = date('Y-m-d', strtotime('+14 days'));

                        // Mettre à jour la réservation avec les dates
                        $sql = "UPDATE reservations SET 
                                status = :status,
                                borrow_date = :borrow_date,
                                due_date = :due_date,
                                updated_at = NOW()
                                WHERE id = :id";
                        
                        $stmt = $conn->prepare($sql);
                        $stmt->execute([
                            ':id' => $id,
                            ':status' => $status,
                            ':borrow_date' => $borrowDate,
                            ':due_date' => $dueDate
                        ]);
                    } else {
                        // Pour les autres statuts, mise à jour simple
                        $sql = "UPDATE reservations SET 
                                status = :status,
                                updated_at = NOW()
                                WHERE id = :id";
                        
                        $stmt = $conn->prepare($sql);
                        $stmt->execute([
                            ':id' => $id,
                            ':status' => $status
                        ]);
                    }

                    // Si le statut change à 'emprunte', mettre à jour la quantité du livre
                    if ($status === 'emprunte') {
                        $updateBookSql = "UPDATE books SET 
                            quantite = quantite - 1,
                            statut = CASE 
                                WHEN quantite - 1 <= 0 THEN 'emprunte'
                                ELSE 'disponible'
                            END
                            WHERE id = :book_id";
                        
                        $updateBookStmt = $conn->prepare($updateBookSql);
                        $updateBookStmt->execute([':book_id' => $bookId]);
                    }

                    $conn->commit();

                    echo json_encode([
                        'status' => 1,
                        'message' => 'Statut mis à jour avec succès'
                    ]);
                } catch (Exception $e) {
                    $conn->rollBack();
                    throw $e;
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

                $conn->beginTransaction();

                try {
                    // Récupérer les informations avant la suppression
                    $getInfoSql = "SELECT book_id, status FROM reservations WHERE id = :id";
                    $getInfoStmt = $conn->prepare($getInfoSql);
                    $getInfoStmt->execute([':id' => $id]);
                    $reservationInfo = $getInfoStmt->fetch(PDO::FETCH_ASSOC);

                    // Supprimer la réservation
                    $sql = "DELETE FROM reservations WHERE id = :id";
                    $stmt = $conn->prepare($sql);
                    $stmt->execute([':id' => $id]);

                    // Si la réservation était active, remettre à jour la quantité
                    if ($reservationInfo['status'] === 'emprunte') {
                        $updateBookSql = "UPDATE books SET 
                            quantite = quantite + 1,
                            statut = 'disponible'
                            WHERE id = :book_id";
                        
                        $updateBookStmt = $conn->prepare($updateBookSql);
                        $updateBookStmt->execute([':book_id' => $reservationInfo['book_id']]);
                    }

                    $conn->commit();

                    echo json_encode([
                        'status' => 1,
                        'message' => 'Réservation supprimée avec succès'
                    ]);
                } catch (Exception $e) {
                    $conn->rollBack();
                    throw $e;
                }
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