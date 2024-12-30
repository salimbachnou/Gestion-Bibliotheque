<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

include '../ConnectDB.php';
$objectDb = new DbConnect;
$conn = $objectDb->connect();

if ($_SERVER['REQUEST_METHOD'] === "OPTIONS") {
    http_response_code(200);
    exit();
}

try {
    $sql = "SELECT 
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.description,
        b.publication_year as publicationYear,
        b.number_pages as pages,
        b.quantite,
        b.image as cover,
        b.emplacement as location,
        b.statut as status,
        b.created_at,
        b.updated_at,
        c.name as category,
        c.id as category_id
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        ORDER BY b.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formater les données pour le frontend
    $formattedBooks = array_map(function($book) {
        return [
            'id' => $book['id'],
            'title' => $book['title'],
            'author' => $book['author'],
            'isbn' => $book['isbn'],
            'description' => $book['description'],
            'cover' => $book['cover'] ? 
                "http://localhost/gestionBiblio/backend/uploads/books/" . $book['cover'] : 
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
            'status' => $book['quantite'] > 0 ? 'available' : 'borrowed',
            'statut' => $book['status'],
            'category' => $book['category'] ?? 'Non catégorisé',
            'category_id' => $book['category_id'],
            'publicationYear' => $book['publicationYear'],
            'pages' => $book['pages'],
            'location' => $book['location'],
            'quantity' => $book['quantite']
        ];
    }, $books);

    echo json_encode([
        'status' => 1,
        'books' => $formattedBooks,
        'total' => count($formattedBooks),
        'available' => count(array_filter($formattedBooks, function($book) {
            return $book['statut'] === 'disponible' && $book['quantity'] > 0;
        })),
        'borrowed' => count(array_filter($formattedBooks, function($book) {
            return $book['statut'] === 'emprunte' || $book['quantity'] <= 0;
        }))
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 0,
        'message' => $e->getMessage()
    ]);
}
?>