<?php
declare(strict_types=1);

class ShippingMethodRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getAll(): array {
        $stmt = $this->db->query("SELECT * FROM shipping_methods ORDER BY id ASC");
        $methods = [];
        while ($row = $stmt->fetch()) {
            $methods[] = $this->mapRow($row);
        }
        return $methods;
    }

    public function getById(int $id): ?ShippingMethodDTO {
        $stmt = $this->db->prepare("SELECT * FROM shipping_methods WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->mapRow($row) : null;
    }

    private function mapRow(array $row): ShippingMethodDTO {
        return new ShippingMethodDTO(
            id: (int)$row['id'],
            name: $row['name'],
            price: (float)$row['price'],
            deliveryDays: $row['delivery_days']
        );
    }
}
