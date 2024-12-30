<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

include 'ConnectDB.php';
$objectDb = new DbConnect;
$conn = $objectDb->connect();


try {
    // Nombre total d'utilisateurs
    $usersSql = "SELECT COUNT(*) as total FROM users ";
    $usersStmt = $conn->query($usersSql);
    $totalUsers = $usersStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Nombre total de livres
    $booksSql = "SELECT COUNT(*) as total FROM books";
    $booksStmt = $conn->query($booksSql);
    $totalBooks = $booksStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Nombre d'emprunts actifs
    $loansSql = "SELECT COUNT(*) as total FROM reservations WHERE status = 'emprunte'";
    $loansStmt = $conn->query($loansSql);
    $activeLoans = $loansStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Activités récentes
    $activitiesSql = "SELECT 
        r.id,
        CASE 
            WHEN r.status = 'emprunte' THEN 'Livre emprunté'
            WHEN r.status = 'retourne' THEN 'Livre retourné'
            ELSE 'Statut modifié'
        END as action,
        CONCAT(u.prenom, ' ', u.name) as user_name,
        b.title as book_title,
        DATE_FORMAT(CONVERT_TZ(r.created_at, 'UTC', 'Europe/Paris'), '%Y-%m-%d %H:%i:%s') as time
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN books b ON r.book_id = b.id
        ORDER BY r.created_at DESC
        LIMIT 5";
    
    $activitiesStmt = $conn->query($activitiesSql);
    $recentActivities = $activitiesStmt->fetchAll(PDO::FETCH_ASSOC);

    // Statistiques des emprunts par mois (derniers 6 mois)
    $monthlyLoansSql = "
        WITH RECURSIVE months AS (
            SELECT DATE_FORMAT(CURRENT_DATE, '%Y-%m') as month
            UNION ALL
            SELECT DATE_FORMAT(DATE_SUB(STR_TO_DATE(month, '%Y-%m'), INTERVAL 1 MONTH), '%Y-%m')
            FROM months
            WHERE month > DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH), '%Y-%m')
        )
        SELECT 
            m.month,
            COALESCE(COUNT(r.id), 0) as count
        FROM months m
        LEFT JOIN reservations r ON DATE_FORMAT(r.created_at, '%Y-%m') = m.month 
            AND r.status = 'emprunte'
        GROUP BY m.month
        ORDER BY m.month ASC;
    ";

    $monthlyLoansStmt = $conn->prepare($monthlyLoansSql);
    $monthlyLoansStmt->execute();
    $monthlyLoans = $monthlyLoansStmt->fetchAll(PDO::FETCH_ASSOC);

    // Statistiques des livres par catégorie
    $booksByCategorySql = "
        SELECT 
            COALESCE(c.name, 'Non catégorisé') as category,
            COUNT(b.id) as count
        FROM categories c
        LEFT JOIN books b ON c.id = b.category_id
        GROUP BY c.id, c.name
        HAVING count > 0
        ORDER BY count DESC
    ";
    
    $booksByCategoryStmt = $conn->query($booksByCategorySql);
    $booksByCategory = $booksByCategoryStmt->fetchAll(PDO::FETCH_ASSOC);

    // Statistiques des statuts des livres
    $bookStatusSql = "SELECT 
        statut,
        COUNT(*) as count
        FROM books
        GROUP BY statut";
    
    $bookStatusStmt = $conn->query($bookStatusSql);
    $bookStatus = $bookStatusStmt->fetchAll(PDO::FETCH_ASSOC);

    // Après la section des emprunts mensuels, ajoutez :
    $monthlyUsersSql = "
        WITH RECURSIVE months AS (
            SELECT DATE_FORMAT(CURRENT_DATE(), '%Y-%m') as month
            UNION ALL
            SELECT DATE_FORMAT(DATE_SUB(STR_TO_DATE(month, '%Y-%m'), INTERVAL 1 MONTH), '%Y-%m')
            FROM months
            WHERE month > DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 5 MONTH), '%Y-%m')
        )
        SELECT 
            m.month,
            COUNT(u.id) as count
        FROM months m
        LEFT JOIN users u ON DATE_FORMAT(u.created_at, '%Y-%m') = m.month
        GROUP BY m.month
        ORDER BY m.month ASC
        LIMIT 6;
    ";

    $monthlyUsersStmt = $conn->query($monthlyUsersSql);
    $monthlyUsers = $monthlyUsersStmt->fetchAll(PDO::FETCH_ASSOC);

    // Statistiques des emprunts par statut
    $loanStatusSql = "SELECT 
        status,
        COUNT(*) as count
        FROM reservations 
        WHERE status IN ('emprunte', 'retourne', 'en retard')
        GROUP BY status";

    $loanStatusStmt = $conn->query($loanStatusSql);
    $loanStatus = $loanStatusStmt->fetchAll(PDO::FETCH_ASSOC);

    // Emprunts en retard
    $overdueBooksSql = "SELECT COUNT(*) as total 
        FROM reservations 
        WHERE status = 'en retard'";
    $overdueBooksStmt = $conn->query($overdueBooksSql);
    $overdueBooks = $overdueBooksStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Top 5 des livres les plus empruntés
    $topBooksSql = "SELECT 
        b.title,
        COUNT(r.id) as borrow_count
        FROM books b
        LEFT JOIN reservations r ON b.id = r.book_id
        GROUP BY b.id, b.title
        ORDER BY borrow_count DESC
        LIMIT 5";
    $topBooksStmt = $conn->query($topBooksSql);
    $topBooks = $topBooksStmt->fetchAll(PDO::FETCH_ASSOC);

    // Durée moyenne des emprunts (en jours)
    $avgDurationSql = "SELECT 
        AVG(DATEDIFF(COALESCE(return_date, CURRENT_DATE), borrow_date)) as avg_duration
        FROM reservations
        WHERE status != 'en retard'";
    $avgDurationStmt = $conn->query($avgDurationSql);
    $avgDuration = round($avgDurationStmt->fetch(PDO::FETCH_ASSOC)['avg_duration']);

    echo json_encode([
        'status' => 1,
        'data' => [
            'totalUsers' => $totalUsers,
            'totalBooks' => $totalBooks,
            'activeLoans' => $activeLoans,
            'recentActivities' => $recentActivities,
            'monthlyLoans' => $monthlyLoans,
            'monthlyUsers' => $monthlyUsers,
            'booksByCategory' => $booksByCategory,
            'bookStatus' => $bookStatus,
            'loanStatus' => $loanStatus,
            'overdueBooks' => $overdueBooks,
            'topBooks' => $topBooks,
            'avgDuration' => $avgDuration
        ]
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 0,
        'message' => $e->getMessage()
    ]);
}
?>