<?php
declare(strict_types=1);

class CategoryDTO {
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly string $slug,
        public readonly string $image,
        public readonly string $description
    ) {}
}
