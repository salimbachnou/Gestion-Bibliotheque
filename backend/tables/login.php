<?php
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: *");
    header("Access-Control-Allow-Methods: *");
    header("Content-Type: application/json");

    include '../ConnectDB.php';
    $objectDb = new DbConnect;
    $conn = $objectDb->connect();

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case "GET":
            try {
                $sql = "SELECT id, name, prenom, email, password, role FROM users";
                $stmt = $conn->prepare($sql);
                $stmt->execute();
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (!is_array($users)) {
                    $users = [];
                }
                
                echo json_encode([
                    'status' => 1,
                    'data' => $users
                ]);
            } catch(Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 0,
                    'error' => $e->getMessage(),
                    'data' => []
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'status' => 0,
                'error' => 'Méthode non autorisée',
                'data' => []
            ]);
            break;
    }
?>
