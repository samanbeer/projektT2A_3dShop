<?php
declare(strict_types=1);

class CartItemDTO {
    public readonly int $id;
    public readonly string $name;
    public readonly float $price;

    public function __construct(
        public readonly int $productId,
        public readonly string $productName,
        public readonly float $unitPrice,
        public readonly string $image,
        public readonly int $quantity,
        public readonly ?string $variant = null
    ) {
        $this->id = $productId;
        $this->name = $productName;
        $this->price = $unitPrice;
    }

    public function getSubtotal(): float {
        return $this->unitPrice * $this->quantity;
    }
}
