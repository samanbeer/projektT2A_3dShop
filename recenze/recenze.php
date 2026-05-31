<?php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';

$db = Database::getConnection();

// Self-healing uploads directory setup
$uploadDir = __DIR__ . '/../imgs/reviews';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate CSRF token if empty
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Handle Form Submissions (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Handle Review Submission
    if ($action === 'review') {
        $name = trim($_POST['name'] ?? '');
        $stars = (int)($_POST['stars'] ?? 5);
        $text = trim($_POST['text'] ?? '');
        
        if ($name !== '' && $text !== '') {
            $photoUrl = null;
            if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                $fileName = $_FILES['photo']['name'];
                $fileTmpPath = $_FILES['photo']['tmp_name'];
                $fileCmps = explode(".", $fileName);
                $fileExtension = strtolower(end($fileCmps));
                $allowedExtensions = ['jpg', 'gif', 'png', 'jpeg', 'webp'];
                
                if (in_array($fileExtension, $allowedExtensions)) {
                    $newFileName = time() . '_' . md5(uniqid()) . '.' . $fileExtension;
                    $destPath = $uploadDir . '/' . $newFileName;
                    if (move_uploaded_file($fileTmpPath, $destPath)) {
                        $photoUrl = 'imgs/reviews/' . $newFileName;
                    }
                }
            }

            // Insert into SQLite database
            $stmt = $db->prepare("INSERT INTO reviews (name, stars, text, photo_url) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $stars, $text, $photoUrl]);

            $_SESSION['notification'] = "Recenze byla úspěšně odeslána! 🍺";
        } else {
            $_SESSION['notification'] = "Chyba: Vyplňte prosím všechna povinná pole. ⚠️";
        }
        header('Location: recenze.php');
        exit;
    }

    // Handle Reply Submission
    if ($action === 'reply') {
        $reviewId = (int)($_POST['review_id'] ?? 0);
        $name = trim($_POST['reply_name'] ?? '');
        $text = trim($_POST['reply_text'] ?? '');

        if ($reviewId > 0 && $name !== '' && $text !== '') {
            $photoUrl = null;
            if (isset($_FILES['reply_photo']) && $_FILES['reply_photo']['error'] === UPLOAD_ERR_OK) {
                $fileName = $_FILES['reply_photo']['name'];
                $fileTmpPath = $_FILES['reply_photo']['tmp_name'];
                $fileCmps = explode(".", $fileName);
                $fileExtension = strtolower(end($fileCmps));
                $allowedExtensions = ['jpg', 'gif', 'png', 'jpeg', 'webp'];
                
                if (in_array($fileExtension, $allowedExtensions)) {
                    $newFileName = 'reply_' . time() . '_' . md5(uniqid()) . '.' . $fileExtension;
                    $destPath = $uploadDir . '/' . $newFileName;
                    if (move_uploaded_file($fileTmpPath, $destPath)) {
                        $photoUrl = 'imgs/reviews/' . $newFileName;
                    }
                }
            }

            // Insert into SQLite database
            $stmt = $db->prepare("INSERT INTO review_replies (review_id, name, text, photo_url) VALUES (?, ?, ?, ?)");
            $stmt->execute([$reviewId, $name, $text, $photoUrl]);

            $_SESSION['notification'] = "Odpověď byla úspěšně odeslána! 🍺";
        } else {
            $_SESSION['notification'] = "Chyba: Vyplňte prosím všechna pole odpovědi. ⚠️";
        }
        header('Location: recenze.php');
        exit;
    }
}

// Fetch all reviews
$stmt = $db->query("SELECT * FROM reviews ORDER BY id DESC");
$reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Helper function to load replies
function getReplies(int $reviewId, PDO $db) {
    $stmt = $db->prepare("SELECT * FROM review_replies WHERE review_id = ? ORDER BY id ASC");
    $stmt->execute([$reviewId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recenze | BEER 3D</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="recenze.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body class="dark-theme">
    <div class="bg-glow"></div>

    <header class="navbar" role="banner">
        <div class="nav-container">
            <a href="../index.php" class="logo" role="img" aria-label="Beer 3D logo" style="text-decoration: none;"><span class="accent">🍺</span> BEER 3D</a>
            <nav role="navigation" aria-label="Hlavní navigace" class="reviews-nav">
                <a href="../index.php" id="nav-home" class="nav-link desktop-nav">DOMŮ</a>
                <a href="../materialy.php" id="nav-materials" class="nav-link desktop-nav">MATERIÁLY</a>
                <a href="../produkty.php" id="nav-products" class="nav-link desktop-nav">PRODUKTY</a>
                <a href="../index.php" class="nav-link mobile-back-btn">← ZPĚT</a>
            </nav>
        </div>
    </header>

    <main class="page" id="page-reviews">
        <div class="reviews-wrapper">
            <div class="page-intro">
                <h2 class="section-title">Napište nám recenzi!</h2>
                <p>Podělte se o své zkušenosti s našimi produkty a službami.</p>
            </div>

            <div class="reviews-layout">
                <!-- Add Review Form -->
                <div class="review-form-container glass-effect">
                    <h3>Přidat recenzi</h3>
                    <form id="review-form" method="POST" enctype="multipart/form-data" action="recenze.php">
                        <input type="hidden" name="action" value="review">
                        
                        <div class="form-group">
                            <label for="review-name">Jméno</label>
                            <input type="text" id="review-name" name="name" class="form-control" placeholder="Vaše jméno..." required>
                        </div>
                        <div class="form-group">
                            <label for="review-stars">Hodnocení (1-5 🍺)</label>
                            <select id="review-stars" name="stars" class="form-control" required>
                                <option value="5">🍺🍺🍺🍺🍺 (Vynikající)</option>
                                <option value="4">🍺🍺🍺🍺 (Velmi dobré)</option>
                                <option value="3">🍺🍺🍺 (Dobré)</option>
                                <option value="2">🍺🍺 (Ujde to)</option>
                                <option value="1">🍺 (Špatné)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="review-text">Recenze</label>
                            <textarea id="review-text" name="text" class="form-control" rows="5" placeholder="Napište pár slov..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="review-photo">Přidat fotku (volitelné)</label>
                            <input type="file" id="review-photo" name="photo" accept="image/*">
                        </div>
                        
                        <button type="submit" id="submit-review" class="btn-main" style="width: 100%; border: none; cursor: pointer;">Odeslat recenzi</button>
                    </form>
                </div>

                <!-- Reviews list container -->
                <div class="reviews-list-container">
                    <h3>Co o nás říkají ostatní</h3>
                    <div id="reviews-list" class="glass-effect">
                        <?php if (empty($reviews)): ?>
                            <p class="no-reviews" style="padding: 20px; text-align: center; color: var(--text-secondary);">Zatím tu nejsou žádné recenze. Buďte první! 🍺</p>
                        <?php else: ?>
                            <?php foreach ($reviews as $rev): ?>
                                <?php 
                                $replies = getReplies((int)$rev['id'], $db);
                                $ratingBeer = str_repeat('🍺', (int)$rev['stars']);
                                $reviewDate = date('d.m.Y', strtotime($rev['created_at']));
                                ?>
                                <div class="review-item" data-review-id="<?= $rev['id'] ?>">
                                    <div class="review-header">
                                        <span class="review-name"><?= htmlspecialchars($rev['name']) ?></span>
                                        <span class="review-rating" title="<?= $rev['stars'] ?>/5"><?= $ratingBeer ?></span>
                                    </div>
                                    <p class="review-text"><?= nl2br(htmlspecialchars($rev['text'])) ?></p>
                                    <?php if (!empty($rev['photo_url'])): ?>
                                        <img src="../<?= htmlspecialchars($rev['photo_url']) ?>" alt="Fotka k recenzi" class="review-photo" onclick="openLightbox('../<?= htmlspecialchars($rev['photo_url']) ?>')">
                                    <?php endif; ?>
                                    <div class="review-footer">
                                        <div class="review-date"><?= $reviewDate ?></div>
                                        <button class="reply-btn" onclick="openReplyModal('<?= $rev['id'] ?>')">💬 Odpovědět</button>
                                    </div>
                                    <div class="replies-container" id="replies-<?= $rev['id'] ?>">
                                        <?php if (!empty($replies)): ?>
                                            <button class="replies-toggle" onclick="toggleReplies('<?= $rev['id'] ?>')" id="toggle-<?= $rev['id'] ?>">
                                                <span class="toggle-arrow">▼</span> Odpovědi (<?= count($replies) ?>)
                                            </button>
                                            <div class="replies-list" id="replies-list-<?= $rev['id'] ?>" style="display: none;">
                                                <?php foreach ($replies as $rep): ?>
                                                    <?php $replyDate = date('d.m.Y', strtotime($rep['created_at'])); ?>
                                                    <div class="reply-item">
                                                        <div class="reply-header">
                                                            <span class="reply-name">↳ <?= htmlspecialchars($rep['name']) ?></span>
                                                        </div>
                                                        <p class="reply-text"><?= nl2br(htmlspecialchars($rep['text'])) ?></p>
                                                        <?php if (!empty($rep['photo_url'])): ?>
                                                            <img src="../<?= htmlspecialchars($rep['photo_url']) ?>" alt="Fotka k odpovědi" class="reply-photo" onclick="openLightbox('../<?= htmlspecialchars($rep['photo_url']) ?>')">
                                                        <?php endif; ?>
                                                        <div class="reply-date"><?= $replyDate ?></div>
                                                    </div>
                                                <?php endforeach; ?>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Image Lightbox Modal -->
    <div class="lightbox-overlay" id="image-lightbox" onclick="closeLightbox()">
        <button class="lightbox-close" onclick="closeLightbox()" aria-label="Zavřít">×</button>
        <img src="" alt="Zvětšený obrázek" class="lightbox-image" id="lightbox-image" onclick="event.stopPropagation()">
    </div>

    <!-- Reply Modal -->
    <div class="reply-modal-overlay" id="reply-modal" onclick="closeReplyModal()">
        <div class="reply-modal-content" onclick="event.stopPropagation()">
            <button class="modal-close" onclick="closeReplyModal()" aria-label="Zavřít">×</button>
            <h3>Napsat odpověď</h3>
            <form id="reply-form" method="POST" enctype="multipart/form-data" action="recenze.php">
                <input type="hidden" name="action" value="reply">
                <input type="hidden" name="review_id" id="reply-review-id" value="">
                
                <div class="form-group">
                    <label for="reply-name">Jméno</label>
                    <input type="text" id="reply-name" name="reply_name" class="form-control" placeholder="Vaše jméno..." required>
                </div>
                <div class="form-group">
                    <label for="reply-text">Odpověď</label>
                    <textarea id="reply-text" name="reply_text" class="form-control" rows="4" placeholder="Napište odpověď..." required></textarea>
                </div>
                <div class="form-group">
                    <label for="reply-photo">Přidat fotku (volitelné)</label>
                    <input type="file" id="reply-photo" name="reply_photo" accept="image/*">
                </div>
                
                <button type="submit" id="submit-reply" class="btn-main" style="width: 100%; border: none; cursor: pointer;">Odeslat odpověď</button>
            </form>
        </div>
    </div>

    <footer class="footer" role="contentinfo">
        <div class="footer-grid">
            <div class="foot-col">© 2025 BEER 3D. Všechna práva vyhrazena.</div>
        </div>
    </footer>

    <!-- Notification Toast Popup -->
    <?php if (isset($_SESSION['notification'])): ?>
        <div class="cart-notification show">
            <?= htmlspecialchars($_SESSION['notification']) ?>
        </div>
        <?php unset($_SESSION['notification']); ?>
        <script>
            setTimeout(() => {
                const notif = document.querySelector('.cart-notification');
                if (notif) {
                    notif.classList.remove('show');
                    setTimeout(() => notif.remove(), 300);
                }
            }, 3000);
        </script>
    <?php endif; ?>

    <script>
        // Modal Controls
        let currentReviewId = null;

        window.openReplyModal = function (reviewId) {
            currentReviewId = reviewId;
            document.getElementById('reply-review-id').value = reviewId;
            const modal = document.getElementById('reply-modal');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        window.closeReplyModal = function () {
            const modal = document.getElementById('reply-modal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
            currentReviewId = null;
        }

        window.toggleReplies = function (reviewId) {
            const repliesList = document.getElementById(`replies-list-${reviewId}`);
            const toggleButton = document.getElementById(`toggle-${reviewId}`);
            const arrow = toggleButton.querySelector('.toggle-arrow');

            if (repliesList.style.display === 'none') {
                repliesList.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            } else {
                repliesList.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
        }

        // Lightbox Functions
        function openLightbox(imageUrl) {
            const lightbox = document.getElementById('image-lightbox');
            const lightboxImage = document.getElementById('lightbox-image');
            lightboxImage.src = imageUrl;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            const lightbox = document.getElementById('image-lightbox');
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
                closeReplyModal();
            }
        });
    </script>
</body>
</html>
