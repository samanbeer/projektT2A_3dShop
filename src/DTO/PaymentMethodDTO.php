<?php
declare(strict_types=1);

class PaymentMethodDTO {
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly float $price
    ) {}
}
