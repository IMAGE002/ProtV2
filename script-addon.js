// ============================================
// LIVE GIFT NOTIFICATIONS SYSTEM
// ============================================

let liveGiftNotifications = [];
const MAX_LIVE_NOTIFICATIONS = 15;
const NOTIFICATION_DURATION = 25000; // 25 seconds

// Prize categorization
const RARE_GIFTS = ['Ring', 'Trophy', 'Diamond', 'Calendar'];
const NFT_GIFTS = ['Calendar']; // Calendar is NFT

/**
 * Add a live gift notification to the notification bar
 * @param {Object} prize - The prize object with value, lottie, type
 */
function addLiveGiftNotification(prize) {
  if (liveGiftNotifications.length >= MAX_LIVE_NOTIFICATIONS) {
    // Remove oldest notification
    const oldestId = liveGiftNotifications[0];
    removeLiveNotification(oldestId);
  }

  const notificationId = Date.now() + Math.random();
  const isNFT = NFT_GIFTS.includes(prize.value);
  
  const cube = document.createElement('div');
  cube.className = `notification-cube ${isNFT ? 'nft-notification' : 'gift-notification'}`;
  cube.dataset.id = notificationId;

  // Create Lottie container
  const lottieContainer = document.createElement('div');
  lottieContainer.className = 'gift-notification-lottie';
  cube.appendChild(lottieContainer);

  // Load Lottie animation
  if (prize.lottie) {
    lottie.loadAnimation({
      container: lottieContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: prize.lottie,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    });
  }

  // Add label
  const label = document.createElement('div');
  label.className = 'gift-notification-label';
  label.textContent = isNFT ? 'NFT' : prize.value;
  cube.appendChild(label);

  // Add close button
  const closeBtn = document.createElement('div');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    removeLiveNotification(notificationId);
  };
  cube.appendChild(closeBtn);

  // Add time bar
  const timeBar = document.createElement('div');
  timeBar.className = 'time-bar';
  const timeBarFill = document.createElement('div');
  timeBarFill.className = 'time-bar-fill';
  timeBarFill.style.animationDuration = `${NOTIFICATION_DURATION}ms`;
  timeBar.appendChild(timeBarFill);
  cube.appendChild(timeBar);

  // Click to open prize modal
  cube.onclick = () => {
    // Find the prize in inventory
    const inventoryPrize = inventoryItems.find(item => item.value === prize.value);
    if (inventoryPrize) {
      openPrizeModal(inventoryPrize);
    }
  };

  const notificationContainer = document.getElementById('notificationContainer');
  if (notificationContainer) {
    notificationContainer.appendChild(cube);
  }

  liveGiftNotifications.push(notificationId);
  updateLiveNotificationCount();

  // Auto-remove after duration
  setTimeout(() => {
    removeLiveNotification(notificationId);
  }, NOTIFICATION_DURATION);

  console.log('🎁 Live gift notification added:', prize.value, isNFT ? '(NFT)' : '(Telegram Gift)');
}

/**
 * Remove a live gift notification
 */
function removeLiveNotification(id) {
  const cube = document.querySelector(`[data-id="${id}"]`);
  if (cube) {
    cube.style.animation = 'none';
    cube.style.transform = 'translateX(100px)';
    cube.style.opacity = '0';
    setTimeout(() => {
      cube.remove();
      liveGiftNotifications = liveGiftNotifications.filter(n => n !== id);
      updateLiveNotificationCount();
    }, 300);
  }
}

/**
 * Update notification count in debug panel
 */
function updateLiveNotificationCount() {
  const notificationCount = document.getElementById('notificationCount');
  if (notificationCount) {
    notificationCount.textContent = liveGiftNotifications.length;
  }
}

// ============================================
// FULL INVENTORY MODAL SYSTEM
// ============================================

const fullInventoryModal = document.getElementById('fullInventoryModal');
const fullInventoryClose = document.getElementById('fullInventoryClose');
const fullInventoryGrid = document.getElementById('fullInventoryGrid');
const emptyInventory = document.getElementById('emptyInventory');

let currentFilter = 'all';

/**
 * Open the full inventory modal
 */
function openFullInventoryModal() {
  if (!fullInventoryModal) return;

  // Load Lottie icon
  const iconContainer = document.getElementById('fullInventoryLottieIcon');
  if (iconContainer && iconContainer.children.length === 0) {
    lottie.loadAnimation({
      container: iconContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/CrystalForInv.json'
    });
  }

  // Update stats
  updateInventoryStats();

  // Render inventory
  renderFullInventory(currentFilter);

  // Show modal
  fullInventoryModal.classList.add('show');

  console.log('📦 Full inventory modal opened');
}

/**
 * Close the full inventory modal
 */
function closeFullInventoryModal() {
  if (!fullInventoryModal) return;
  fullInventoryModal.classList.remove('show');
  console.log('📦 Full inventory modal closed');
}

/**
 * Update inventory statistics
 */
function updateInventoryStats() {
  const totalGifts = inventoryItems.length;
  const totalValue = inventoryItems.reduce((sum, item) => {
    return sum + (PRIZE_COIN_VALUES[item.value] || 0);
  }, 0);
  const rareGifts = inventoryItems.filter(item => RARE_GIFTS.includes(item.value)).length;

  document.getElementById('totalGiftsCount').textContent = totalGifts;
  document.getElementById('totalGiftValue').textContent = totalValue.toLocaleString();
  document.getElementById('rareGiftsCount').textContent = rareGifts;
}

/**
 * Render the full inventory grid
 */
function renderFullInventory(filter = 'all') {
  if (!fullInventoryGrid) return;

  fullInventoryGrid.innerHTML = '';

  let filteredItems = inventoryItems;

  // Apply filter
  if (filter === 'telegram') {
    filteredItems = inventoryItems.filter(item => !NFT_GIFTS.includes(item.value));
  } else if (filter === 'nft') {
    filteredItems = inventoryItems.filter(item => NFT_GIFTS.includes(item.value));
  } else if (filter === 'rare') {
    filteredItems = inventoryItems.filter(item => RARE_GIFTS.includes(item.value));
  }

  // Show empty state if no items
  if (filteredItems.length === 0) {
    emptyInventory.style.display = 'flex';
    fullInventoryGrid.style.display = 'none';
  } else {
    emptyInventory.style.display = 'none';
    fullInventoryGrid.style.display = 'grid';

    // Render items
    filteredItems.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'full-inventory-item';
      
      if (NFT_GIFTS.includes(item.value)) {
        itemDiv.classList.add('nft-item');
      }

      // Lottie container
      const lottieContainer = document.createElement('div');
      lottieContainer.className = 'full-item-lottie';
      
      if (item.lottie) {
        lottie.loadAnimation({
          container: lottieContainer,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: item.lottie
        });
      }

      itemDiv.appendChild(lottieContainer);

      // Item name
      const name = document.createElement('div');
      name.className = 'full-item-name';
      name.textContent = item.value;
      itemDiv.appendChild(name);

      // Item ID
      const id = document.createElement('div');
      id.className = 'full-item-id';
      id.textContent = item.prizeId;
      itemDiv.appendChild(id);

      // NFT badge
      if (NFT_GIFTS.includes(item.value)) {
        const badge = document.createElement('div');
        badge.className = 'full-item-badge';
        badge.textContent = 'NFT';
        itemDiv.appendChild(badge);
      }

      // Click to open prize modal
      itemDiv.addEventListener('click', () => {
        openPrizeModal(item);
        closeFullInventoryModal();
      });

      fullInventoryGrid.appendChild(itemDiv);
    });
  }
}

/**
 * Setup filter buttons
 */
function setupInventoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Apply filter
      currentFilter = btn.dataset.filter;
      renderFullInventory(currentFilter);

      console.log('🔍 Filter applied:', currentFilter);
    });
  });
}

// ============================================
// EVENT LISTENERS
// ============================================

// Close full inventory modal
if (fullInventoryClose) {
  fullInventoryClose.addEventListener('click', closeFullInventoryModal);
}

// Close modal when clicking outside
if (fullInventoryModal) {
  fullInventoryModal.addEventListener('click', (e) => {
    if (e.target === fullInventoryModal) {
      closeFullInventoryModal();
    }
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && fullInventoryModal && fullInventoryModal.classList.contains('show')) {
    closeFullInventoryModal();
  }
  
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    openFullInventoryModal();
  }
});

// Setup inventory box click handler
const inventoryBoxClick = document.getElementById('inventoryBoxClick');
if (inventoryBoxClick) {
  inventoryBoxClick.addEventListener('click', () => {
    openFullInventoryModal();
  });
}

// Setup filters on load
document.addEventListener('DOMContentLoaded', () => {
  setupInventoryFilters();
});

// ============================================
// ENHANCED PRIZE ADDITION
// ============================================

// Override the existing addPrizeToInventory to also create live notifications
const originalAddPrizeToInventory = window.addPrizeToInventory;

window.addPrizeToInventory = function(prize) {
  // Call original function
  const result = originalAddPrizeToInventory(prize);
  
  // Add live notification for gifts (not coins)
  if (prize.type === 'gift') {
    addLiveGiftNotification(prize);
  }
  
  // Update stats if modal is open
  if (fullInventoryModal && fullInventoryModal.classList.contains('show')) {
    updateInventoryStats();
    renderFullInventory(currentFilter);
  }
  
  return result;
};

// ============================================
// EXPORTS
// ============================================

window.addLiveGiftNotification = addLiveGiftNotification;
window.removeLiveNotification = removeLiveNotification;
window.openFullInventoryModal = openFullInventoryModal;
window.closeFullInventoryModal = closeFullInventoryModal;
window.renderFullInventory = renderFullInventory;

console.log('✨ Live gift notifications and full inventory modal system loaded!');
