<?php
declare(strict_types=1);
?>
            </main>
        </div>
    </div>

    <!-- Simple notification popup if needed -->
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
        document.addEventListener('DOMContentLoaded', () => {
            // Re-trigger visual entry animations
            const cards = document.querySelectorAll('.product-card, .portfolio-item');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.05}s`;
            });
        });
    </script>
</body>
</html>
