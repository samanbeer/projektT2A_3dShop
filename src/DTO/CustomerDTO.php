<?php
declare(strict_types=1);

class CustomerDTO {
    public function __construct(
        public readonly int $id,
        public readonly string $firstName,
        public readonly string $lastName,
        public readonly string $email,
        public readonly string $phone,
        public readonly string $street,
        public readonly string $city,
        public readonly string $zip
    ) {}
}
