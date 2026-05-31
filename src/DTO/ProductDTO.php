<?php
declare(strict_types=1);

class ProductDTO {
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly string $slug,
        public readonly float $price,
        public readonly string $description,
        public readonly string $image,
        public readonly int $categoryId,
        public readonly string $categoryName,
        public readonly bool $isFeatured = false,
        public readonly bool $inStock = true,
        public readonly bool $hasVariants = false
    ) {}
}
