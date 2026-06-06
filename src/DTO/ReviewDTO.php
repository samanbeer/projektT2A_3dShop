<?php
declare(strict_types=1);

class ReviewDTO {
    public ?int $id;
    public string $name;
    public int $stars;
    public string $text;
    public ?string $photoUrl;
    public string $createdAt;

    public function __construct(
        ?int $id,
        string $name,
        int $stars,
        string $text,
        ?string $photoUrl = null,
        string $createdAt = ''
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->stars = $stars;
        $this->text = $text;
        $this->photoUrl = $photoUrl;
        $this->createdAt = $createdAt;
    }
}
