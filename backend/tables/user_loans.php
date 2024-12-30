<?php
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
            $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
            
            if (!$user_id) {
                throw new Exception('ID utilisateur manquant');
            }

            $sql = "SELECT 
                r.id,
                b.title as bookTitle,
                b.author as author,
                r.borrow_date as borrowDate,
                r.due_date as dueDate,
                r.status,
                b.image as coverImage
                FROM reservations r
                JOIN books b ON r.book_id = b.id
                WHERE r.user_id = :user_id
                ORDER BY r.created_at DESC";

            $stmt = $conn->prepare($sql);
            $stmt->execute([':user_id' => $user_id]);
            $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convertir les statuts pour le frontend
            foreach ($loans as &$loan) {
                switch($loan['status']) {
                    case 'emprunte':
                        $loan['status'] = 'en_cours';
                        break;
                    case 'en retard':
                        $loan['status'] = 'retard';
                        break;
                    case 'retourne':
                        $loan['status'] = 'retourné';
                        break;
                }
            }

            echo json_encode([
                'status' => 1,
                'loans' => $loans
            ]);
        } catch(Exception $e) {
            http_response_code(400);
            echo json_encode([
                'status' => 0,
                'message' => $e->getMessage()
            ]);
        }
        break;
}
?> 