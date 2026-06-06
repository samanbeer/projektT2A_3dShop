<?php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';

$db = Database::getConnection();
$reviewRepo = new ReviewRepository($db);

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
            $review = new ReviewDTO(null, $name, $stars, $text);
            $reviewRepo->save($review);

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
            $reviewRepo->saveReply($reviewId, $name, $text);
            $_SESSION['notification'] = "Odpověď byla úspěšně odeslána! 🍺";
        } else {
            $_SESSION['notification'] = "Chyba: Vyplňte prosím všechna pole odpovědi. ⚠️";
        }
        header('Location: recenze.php');
        exit;
    }
}

// Fetch all reviews
$reviews = $reviewRepo->getAll();
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
                    <form id="review-form" method="POST" action="recenze.php">
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
                                $replies = $reviewRepo->getReplies((int)$rev->id);
                                $ratingBeer = str_repeat('🍺', (int)$rev->stars);
                                $reviewDate = date('d.m.Y', strtotime($rev->createdAt));
                                ?>
                                <div class="review-item" data-review-id="<?= $rev->id ?>">
                                    <div class="review-header">
                                        <span class="review-name"><?= htmlspecialchars($rev->name) ?></span>
                                        <span class="review-rating" title="<?= $rev->stars ?>/5"><?= $ratingBeer ?></span>
                                    </div>
                                    <p class="review-text"><?= nl2br(htmlspecialchars($rev->text)) ?></p>
                                    <div class="review-footer">
                                        <div class="review-date"><?= $reviewDate ?></div>
                                        <button class="reply-btn" onclick="openReplyModal('<?= $rev->id ?>')">💬 Odpovědět</button>
                                    </div>
                                    <div class="replies-container" id="replies-<?= $rev->id ?>">
                                        <?php if (!empty($replies)): ?>
                                            <button class="replies-toggle" onclick="toggleReplies('<?= $rev->id ?>')" id="toggle-<?= $rev->id ?>">
                                                <span class="toggle-arrow">▼</span> Odpovědi (<?= count($replies) ?>)
                                            </button>
                                            <div class="replies-list" id="replies-list-<?= $rev->id ?>" style="display: none;">
                                                <?php foreach ($replies as $rep): ?>
                                                    <?php $replyDate = date('d.m.Y', strtotime($rep['created_at'])); ?>
                                                    <div class="reply-item">
                                                        <div class="reply-header">
                                                            <span class="reply-name">↳ <?= htmlspecialchars($rep['name']) ?></span>
                                                        </div>
                                                        <p class="reply-text"><?= nl2br(htmlspecialchars($rep['text'])) ?></p>
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

    <!-- Reply Modal -->
    <div class="reply-modal-overlay" id="reply-modal" onclick="closeReplyModal()">
        <div class="reply-modal-content" onclick="event.stopPropagation()">
            <button class="modal-close" onclick="closeReplyModal()" aria-label="Zavřít">×</button>
            <h3>Napsat odpověď</h3>
            <form id="reply-form" method="POST" action="recenze.php">
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

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeReplyModal();
            }
        });
    </script>
</body>
</html>
