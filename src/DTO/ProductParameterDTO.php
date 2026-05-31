<?php
declare(strict_types=1);

class ProductParameterDTO {
    public function __construct(
        public readonly int $id,
        public readonly int $productId,
        public readonly string $name,
        public readonly string $value,
        public readonly string $type
    ) {}

    public function isSelectable(): bool {
        return $this->type === 'select';
    }
}
