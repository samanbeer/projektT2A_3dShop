<?php
declare(strict_types=1);

class ProductImageDTO {
    public function __construct(
        public readonly int $id,
        public readonly int $productId,
        public readonly string $image
    ) {}
}
