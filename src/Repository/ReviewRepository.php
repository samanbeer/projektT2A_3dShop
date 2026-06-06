<?php
declare(strict_types=1);

class ReviewRepository {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * @return ReviewDTO[]
     */
    public function getAll(): array {
        $stmt = $this->db->query("SELECT * FROM reviews ORDER BY id DESC");
        $reviews = [];
        while ($row = $stmt->fetch()) {
            $reviews[] = new ReviewDTO(
                (int)$row['id'],
                $row['name'],
                (int)$row['stars'],
                $row['text'],
                $row['photo_url'],
                $row['created_at']
            );
        }
        return $reviews;
    }

    public function save(ReviewDTO $review): bool {
        $stmt = $this->db->prepare("INSERT INTO reviews (name, stars, text, photo_url) VALUES (?, ?, ?, ?)");
        return $stmt->execute([
            $review->name,
            $review->stars,
            $review->text,
            $review->photoUrl
        ]);
    }

    public function getReplies(int $reviewId): array {
        $stmt = $this->db->prepare("SELECT * FROM review_replies WHERE review_id = ? ORDER BY id ASC");
        $stmt->execute([$reviewId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveReply(int $reviewId, string $name, string $text, ?string $photoUrl = null): bool {
        $stmt = $this->db->prepare("INSERT INTO review_replies (review_id, name, text, photo_url) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$reviewId, $name, $text, $photoUrl]);
    }
}
