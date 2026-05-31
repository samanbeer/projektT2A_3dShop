<?php
declare(strict_types=1);

class CategoryRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getAll(): array {
        $stmt = $this->db->query("SELECT * FROM categories ORDER BY id ASC");
        $categories = [];
        while ($row = $stmt->fetch()) {
            $categories[] = $this->mapRow($row);
        }
        return $categories;
    }

    public function getById(int $id): ?CategoryDTO {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->mapRow($row) : null;
    }

    public function getBySlug(string $slug): ?CategoryDTO {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE slug = ?");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ? $this->mapRow($row) : null;
    }

    private function mapRow(array $row): CategoryDTO {
        return new CategoryDTO(
            id: (int)$row['id'],
            name: $row['name'],
            slug: $row['slug'],
            image: $row['image'],
            description: $row['description']
        );
    }
}
