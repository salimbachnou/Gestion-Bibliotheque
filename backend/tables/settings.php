<?php
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
    header("Content-Type: application/json");

    include '../ConnectDB.php';
    $objectDb = new DbConnect;
    $conn = $objectDb->connect();

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'GET':
            try {
                $sql = "SELECT * FROM settings ORDER BY id DESC LIMIT 1";
                $stmt = $conn->prepare($sql);
                $stmt->execute();
                $settings = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'status' => 1,
                    'settings' => $settings
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
                $settings = json_decode(file_get_contents('php://input'), true);
                
                $sql = "INSERT INTO settings (
                    library_name, address, city, postal_code, phone, email,
                    loan_duration, max_loans, email_notifications,
                    loan_reminders, new_books_notifications
                ) VALUES (
                    :library_name, :address, :city, :postal_code, :phone, :email,
                    :loan_duration, :max_loans, :email_notifications,
                    :loan_reminders, :new_books_notifications
                )";
                
                $stmt = $conn->prepare($sql);
                $result = $stmt->execute([
                    ':library_name' => $settings['libraryName'],
                    ':address' => $settings['address'],
                    ':city' => $settings['city'],
                    ':postal_code' => $settings['postalCode'],
                    ':phone' => $settings['phone'],
                    ':email' => $settings['email'],
                    ':loan_duration' => $settings['loanDuration'],
                    ':max_loans' => $settings['maxLoansPerUser'],
                    ':email_notifications' => $settings['notifications']['emailEnabled'] ? 1 : 0,
                    ':loan_reminders' => $settings['notifications']['loanReminders'] ? 1 : 0,
                    ':new_books_notifications' => $settings['notifications']['newBooks'] ? 1 : 0
                ]);

                if ($result) {
                    echo json_encode([
                        'status' => 1,
                        'message' => 'Paramètres sauvegardés avec succès'
                    ]);
                } else {
                    throw new Exception('Erreur lors de la sauvegarde des paramètres');
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
                $settings = json_decode(file_get_contents('php://input'), true);
                
                $sql = "UPDATE settings SET 
                    library_name = :library_name,
                    address = :address,
                    city = :city,
                    postal_code = :postal_code,
                    phone = :phone,
                    email = :email,
                    loan_duration = :loan_duration,
                    max_loans = :max_loans,
                    email_notifications = :email_notifications,
                    loan_reminders = :loan_reminders,
                    new_books_notifications = :new_books_notifications,
                    updated_at = NOW()
                    WHERE id = :id";
                
                $stmt = $conn->prepare($sql);
                $result = $stmt->execute([
                    ':id' => $settings['id'],
                    ':library_name' => $settings['libraryName'],
                    ':address' => $settings['address'],
                    ':city' => $settings['city'],
                    ':postal_code' => $settings['postalCode'],
                    ':phone' => $settings['phone'],
                    ':email' => $settings['email'],
                    ':loan_duration' => $settings['loanDuration'],
                    ':max_loans' => $settings['maxLoansPerUser'],
                    ':email_notifications' => $settings['notifications']['emailEnabled'] ? 1 : 0,
                    ':loan_reminders' => $settings['notifications']['loanReminders'] ? 1 : 0,
                    ':new_books_notifications' => $settings['notifications']['newBooks'] ? 1 : 0
                ]);

                if ($result) {
                    echo json_encode([
                        'status' => 1,
                        'message' => 'Paramètres mis à jour avec succès'
                    ]);
                } else {
                    throw new Exception('Erreur lors de la mise à jour des paramètres');
                }
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