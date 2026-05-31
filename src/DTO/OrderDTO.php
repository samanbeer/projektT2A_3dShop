<?php
declare(strict_types=1);

class OrderDTO {
    public function __construct(
        public readonly int $id,
        public readonly int $customerId,
        public readonly int $shippingMethodId,
        public readonly int $paymentMethodId,
        public readonly float $shippingPrice,
        public readonly float $paymentPrice,
        public readonly float $totalPrice,
        public readonly ?string $note,
        public readonly string $status = 'new',
        public readonly ?string $createdAt = null
    ) {}
}
