<?php
declare(strict_types=1);

class ShippingMethodDTO {
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly float $price,
        public readonly string $deliveryDays
    ) {}

    public function isFree(): bool {
        return $this->price <= 0;
    }
}
