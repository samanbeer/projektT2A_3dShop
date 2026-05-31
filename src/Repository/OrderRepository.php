<?php
declare(strict_types=1);

class OrderRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * @param CartItemDTO[] $cartItems
     */
    public function create(
        int $customerId,
        int $shippingMethodId,
        int $paymentMethodId,
        ?string $note,
        array $cartItems
    ): OrderDTO {
        $this->db->beginTransaction();

        try {
            // 1. Get shipping price
            $shippingStmt = $this->db->prepare("SELECT price FROM shipping_methods WHERE id = ?");
            $shippingStmt->execute([$shippingMethodId]);
            $shippingPrice = (float)($shippingStmt->fetchColumn() ?: 0.0);

            // 2. Get payment price
            $paymentStmt = $this->db->prepare("SELECT price FROM payment_methods WHERE id = ?");
            $paymentStmt->execute([$paymentMethodId]);
            $paymentPrice = (float)($paymentStmt->fetchColumn() ?: 0.0);

            // 3. Calculate total items price
            $itemsPrice = 0.0;
            foreach ($cartItems as $item) {
                $itemsPrice += $item->unitPrice * $item->quantity;
            }

            $totalPrice = $itemsPrice + $shippingPrice + $paymentPrice;

            // 4. Insert order
            $orderStmt = $this->db->prepare(
                "INSERT INTO orders (customer_id, shipping_method_id, payment_method_id, shipping_price, payment_price, total_price, note)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            $orderStmt->execute([
                $customerId,
                $shippingMethodId,
                $paymentMethodId,
                $shippingPrice,
                $paymentPrice,
                $totalPrice,
                $note
            ]);

            $orderId = (int)$this->db->lastInsertId();

            // 5. Insert order items
            $itemStmt = $this->db->prepare(
                "INSERT INTO order_items (order_id, product_id, product_name, variant, quantity, unit_price)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );
            foreach ($cartItems as $item) {
                $itemStmt->execute([
                    $orderId,
                    $item->productId,
                    $item->productName,
                    $item->variant,
                    $item->quantity,
                    $item->unitPrice
                ]);
            }

            $this->db->commit();

            return new OrderDTO(
                id: $orderId,
                customerId: $customerId,
                shippingMethodId: $shippingMethodId,
                paymentMethodId: $paymentMethodId,
                shippingPrice: $shippingPrice,
                paymentPrice: $paymentPrice,
                totalPrice: $totalPrice,
                note: $note,
                status: 'new'
            );

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getById(int $id): ?OrderDTO {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) return null;

        return new OrderDTO(
            id: (int)$row['id'],
            customerId: (int)$row['customer_id'],
            shippingMethodId: (int)$row['shipping_method_id'],
            paymentMethodId: (int)$row['payment_method_id'],
            shippingPrice: (float)$row['shipping_price'],
            paymentPrice: (float)$row['payment_price'],
            totalPrice: (float)$row['total_price'],
            note: $row['note'],
            status: $row['status'],
            createdAt: $row['created_at']
        );
    }
}
