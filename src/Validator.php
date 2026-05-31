<?php
declare(strict_types=1);

class Validator {
    private array $data;
    private array $errors = [];

    public function __construct(array $data) {
        $this->data = $data;
    }

    public function required(string $field, string $errorMessage): self {
        if (!isset($this->data[$field]) || trim((string)$this->data[$field]) === '') {
            $this->errors[$field] = $errorMessage;
        }
        return $this;
    }

    public function email(string $field, string $errorMessage): self {
        if (isset($this->errors[$field])) {
            return $this;
        }
        $value = $this->data[$field] ?? '';
        if (trim($value) !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = $errorMessage;
        }
        return $this;
    }

    public function phone(string $field, string $errorMessage): self {
        if (isset($this->errors[$field])) {
            return $this;
        }
        $value = $this->data[$field] ?? '';
        if (trim($value) !== '' && !preg_match('/^\+?[0-9\s\-]{9,15}$/', $value)) {
            $this->errors[$field] = $errorMessage;
        }
        return $this;
    }

    public function zip(string $field, string $errorMessage): self {
        if (isset($this->errors[$field])) {
            return $this;
        }
        $value = $this->data[$field] ?? '';
        if (trim($value) !== '' && !preg_match('/^[0-9]{3}\s?[0-9]{2}$/', $value)) {
            $this->errors[$field] = $errorMessage;
        }
        return $this;
    }

    public function isValid(): bool {
        return empty($this->errors);
    }

    public function getErrors(): array {
        return $this->errors;
    }
}
