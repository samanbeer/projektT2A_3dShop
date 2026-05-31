<?php
declare(strict_types=1);

class Cart {
    public function __construct() {
        $this->startSession();
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }
        $this->closeSession();
    }

    private function startSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    private function closeSession(): void {
        session_write_close();
    }

    private function getKey(int $productId, ?string $variant = null): string {
        return $productId . '_' . md5($variant ?? '');
    }

    public function add(int $productId, string $productName, float $unitPrice, string $image, ?string $variant = null, int $quantity = 1): void {
        $this->startSession();
        $key = $this->getKey($productId, $variant);

        if (isset($_SESSION['cart'][$key])) {
            $_SESSION['cart'][$key]['quantity'] += $quantity;
        } else {
            $_SESSION['cart'][$key] = [
                'productId' => $productId,
                'productName' => $productName,
                'unitPrice' => $unitPrice,
                'image' => $image,
                'quantity' => $quantity,
                'variant' => $variant
            ];
        }
        $this->closeSession();
    }

    public function updateQuantity(int $productId, int $quantity, ?string $variant = null): void {
        $this->startSession();
        $key = $this->getKey($productId, $variant);

        if (isset($_SESSION['cart'][$key])) {
            if ($quantity <= 0) {
                $this->remove($productId, $variant);
            } else {
                $_SESSION['cart'][$key]['quantity'] = $quantity;
            }
        }
        $this->closeSession();
    }

    public function remove(int $productId, ?string $variant = null): void {
        $this->startSession();
        $key = $this->getKey($productId, $variant);
        if (isset($_SESSION['cart'][$key])) {
            unset($_SESSION['cart'][$key]);
        }
        $this->closeSession();
    }

    /**
     * @return CartItemDTO[]
     */
    public function getItems(): array {
        $items = [];
        if (!is_array($_SESSION['cart'] ?? null)) {
            $_SESSION['cart'] = [];
            return [];
        }
        foreach ($_SESSION['cart'] as $item) {
            if (!is_array($item) || !isset($item['productId'], $item['productName'], $item['unitPrice'])) {
                continue;
            }
            $items[] = new CartItemDTO(
                productId: (int)$item['productId'],
                productName: $item['productName'],
                unitPrice: (float)$item['unitPrice'],
                image: $item['image'] ?? '',
                quantity: (int)$item['quantity'],
                variant: $item['variant'] ?? null
            );
        }
        return $items;
    }

    public function getTotalPrice(): float {
        $total = 0.0;
        if (!is_array($_SESSION['cart'] ?? null)) {
            return 0.0;
        }
        foreach ($_SESSION['cart'] as $item) {
            if (!is_array($item) || !isset($item['unitPrice'], $item['quantity'])) {
                continue;
            }
            $total += ((float)$item['unitPrice'] * (int)$item['quantity']);
        }
        return $total;
    }

    public function getTotalQuantity(): int {
        $count = 0;
        if (!is_array($_SESSION['cart'] ?? null)) {
            return 0;
        }
        foreach ($_SESSION['cart'] as $item) {
            if (!is_array($item) || !isset($item['quantity'])) {
                continue;
            }
            $count += (int)$item['quantity'];
        }
        return $count;
    }

    public function isEmpty(): bool {
        return empty($_SESSION['cart']);
    }

    public function clear(): void {
        $this->startSession();
        $_SESSION['cart'] = [];
        $this->closeSession();
    }
}
