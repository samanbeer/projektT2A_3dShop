<?php
declare(strict_types=1);

class CustomerRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function create(
        string $firstName,
        string $lastName,
        string $email,
        string $phone,
        string $street,
        string $city,
        string $zip
    ): CustomerDTO {
        $stmt = $this->db->prepare(
            "INSERT INTO customers (first_name, last_name, email, phone, street, city, zip)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $firstName,
            $lastName,
            $email,
            $phone,
            $street,
            $city,
            $zip
        ]);

        $id = (int)$this->db->lastInsertId();

        return new CustomerDTO(
            id: $id,
            firstName: $firstName,
            lastName: $lastName,
            email: $email,
            phone: $phone,
            street: $street,
            city: $city,
            zip: $zip
        );
    }

    public function getById(int $id): ?CustomerDTO {
        $stmt = $this->db->prepare("SELECT * FROM customers WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) return null;

        return new CustomerDTO(
            id: (int)$row['id'],
            firstName: $row['first_name'],
            lastName: $row['last_name'],
            email: $row['email'],
            phone: $row['phone'],
            street: $row['street'],
            city: $row['city'],
            zip: $row['zip']
        );
    }
}
