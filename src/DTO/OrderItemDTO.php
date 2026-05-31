<?php
declare(strict_types=1);

class OrderItemDTO {
    public function __construct(
        public readonly int $id,
        public readonly int $orderId,
        public readonly int $productId,
        public readonly string $productName,
        public readonly ?string $variant,
        public readonly int $quantity,
        public readonly float $unitPrice
    ) {}
}
