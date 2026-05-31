<?php
declare(strict_types=1);

class ProductRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    private function getBaseQuery(): string {
        return "SELECT p.*, c.name as category_name,
                       (SELECT COUNT(*) FROM product_parameters pp WHERE pp.product_id = p.id AND pp.type = 'select') as select_count
                FROM products p
                JOIN categories c ON p.category_id = c.id";
    }

    public function getAll(): array {
        $stmt = $this->db->query($this->getBaseQuery() . " ORDER BY p.id ASC");
        $products = [];
        while ($row = $stmt->fetch()) {
            $products[] = $this->mapRow($row);
        }
        return $products;
    }

    public function getFeatured(int $limit = 6): array {
        $stmt = $this->db->prepare($this->getBaseQuery() . " WHERE p.is_featured = 1 LIMIT ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        $products = [];
        while ($row = $stmt->fetch()) {
            $products[] = $this->mapRow($row);
        }
        return $products;
    }

    public function getByCategory(int $categoryId): array {
        $stmt = $this->db->prepare($this->getBaseQuery() . " WHERE p.category_id = ? ORDER BY p.id ASC");
        $stmt->execute([$categoryId]);
        $products = [];
        while ($row = $stmt->fetch()) {
            $products[] = $this->mapRow($row);
        }
        return $products;
    }

    public function getByCategorySlug(string $slug): array {
        $stmt = $this->db->prepare($this->getBaseQuery() . " WHERE c.slug = ? ORDER BY p.id ASC");
        $stmt->execute([$slug]);
        $products = [];
        while ($row = $stmt->fetch()) {
            $products[] = $this->mapRow($row);
        }
        return $products;
    }

    public function getBySlug(string $slug): ?ProductDTO {
        $stmt = $this->db->prepare($this->getBaseQuery() . " WHERE p.slug = ?");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ? $this->mapRow($row) : null;
    }

    public function getById(int $id): ?ProductDTO {
        $stmt = $this->db->prepare($this->getBaseQuery() . " WHERE p.id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->mapRow($row) : null;
    }

    /**
     * @return ProductImageDTO[]
     */
    public function getImages(int|string $productId): array {
        $stmt = $this->db->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY id ASC");
        $stmt->execute([$productId]);
        $images = [];
        while ($row = $stmt->fetch()) {
            $images[] = new ProductImageDTO(
                id: (int)$row['id'],
                productId: (int)$row['product_id'],
                image: $row['image']
            );
        }
        return $images;
    }

    /**
     * @return ProductParameterDTO[]
     */
    public function getParameters(int|string $productId): array {
        $stmt = $this->db->prepare("SELECT * FROM product_parameters WHERE product_id = ? ORDER BY id ASC");
        $stmt->execute([$productId]);
        $parameters = [];
        while ($row = $stmt->fetch()) {
            $parameters[] = new ProductParameterDTO(
                id: (int)$row['id'],
                productId: (int)$row['product_id'],
                name: $row['name'],
                value: $row['value'],
                type: $row['type']
            );
        }
        return $parameters;
    }

    public function search(string $query): array {
        $stmt = $this->db->prepare($this->getBaseQuery() . " WHERE p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ? ORDER BY p.id ASC");
        $likeQuery = '%' . $query . '%';
        $stmt->execute([$likeQuery, $likeQuery, $likeQuery]);
        $products = [];
        while ($row = $stmt->fetch()) {
            $products[] = $this->mapRow($row);
        }
        return $products;
    }

    private function mapRow(array $row): ProductDTO {
        return new ProductDTO(
            id: (int)$row['id'],
            name: $row['name'],
            slug: $row['slug'],
            price: (float)$row['price'],
            description: $row['description'],
            image: $row['image'],
            categoryId: (int)$row['category_id'],
            categoryName: $row['category_name'],
            isFeatured: (int)$row['is_featured'] === 1,
            inStock: (int)$row['in_stock'] === 1,
            hasVariants: (int)$row['select_count'] > 0
        );
    }
}
