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
    // Récupérer toutes les catégories
    $categoriesQuery = "SELECT id, name FROM categories ORDER BY name";
    $categoriesStmt = $conn->prepare($categoriesQuery);
    $categoriesStmt->execute();
    $categories = $categoriesStmt->fetchAll(PDO::FETCH_ASSOC);

    // Récupérer tous les livres avec leurs catégories
    $booksQuery = "SELECT 
        b.id,
        b.title,
        b.author,
        b.description,
        b.publication_year as publicationYear,
        b.number_pages as pages,
        b.quantite,
        b.image as cover,
        b.emplacement as location,
        b.statut,
        c.id as category_id,
        c.name as category_name
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        ORDER BY b.title";

    $booksStmt = $conn->prepare($booksQuery);
    $booksStmt->execute();
    $books = $booksStmt->fetchAll(PDO::FETCH_ASSOC);

    // Formater les données
    $formattedBooks = array_map(function($book) {
        return [
            'id' => $book['id'],
            'title' => $book['title'],
            'author' => $book['author'],
            'category' => $book['category_id'],
            'categoryName' => $book['category_name'],
            'cover' => $book['cover'] ? 
                "http://localhost/gestionBiblio/backend/uploads/books/" . $book['cover'] : 
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
            'status' => $book['quantite'] > 0 ? 'available' : 'borrowed',
            'description' => $book['description'],
            'publicationYear' => $book['publicationYear'],
            'pages' => $book['pages'],
            'location' => $book['location'],
            'quantity' => $book['quantite']
        ];
    }, $books);

    // Préparer les catégories avec l'ID comme clé
    $formattedCategories = array_merge(
        [['id' => 'all', 'name' => 'Toutes les catégories']],
        array_map(function($category) {
            return [
                'id' => $category['id'],
                'name' => $category['name']
            ];
        }, $categories)
    );

    echo json_encode([
        'status' => 1,
        'categories' => $formattedCategories,
        'books' => $formattedBooks
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 0,
        'message' => $e->getMessage()
    ]);
}
?> 