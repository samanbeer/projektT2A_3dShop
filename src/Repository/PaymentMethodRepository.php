<?php
declare(strict_types=1);

class PaymentMethodRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
        try {
            $stmt = $this->db->query("SELECT COUNT(*) FROM payment_methods WHERE id = 4");
            if ($stmt && (int)$stmt->fetchColumn() === 0) {
                $this->db->exec("INSERT INTO payment_methods (id, name, price) VALUES (4, 'Platba pivem (25 Kč = 1 pivo)', 0.0)");
            }
        } catch (Exception $e) {
            // Ignore if database is not initialized yet
        }
    }

    public function getAll(): array {
        $stmt = $this->db->query("SELECT * FROM payment_methods ORDER BY id ASC");
        $methods = [];
        while ($row = $stmt->fetch()) {
            $methods[] = $this->mapRow($row);
        }
        return $methods;
    }

    public function getById(int $id): ?PaymentMethodDTO {
        $stmt = $this->db->prepare("SELECT * FROM payment_methods WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->mapRow($row) : null;
    }

    private function mapRow(array $row): PaymentMethodDTO {
        return new PaymentMethodDTO(
            id: (int)$row['id'],
            name: $row['name'],
            price: (float)$row['price']
        );
    }
}
