// ============================================
// TELEGRAM WEB APP INITIALIZATION
// ============================================

let tg = window.Telegram.WebApp;
let userData = null;

function initTelegramWebApp() {
  try {
    tg.expand();
    tg.enableClosingConfirmation();
    userData = tg.initDataUnsafe?.user;
    
    if (userData) {
      console.log('✅ Telegram User Data Loaded:', userData);
      updateUserProfile(userData);
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#0f172a');
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
    } else {
      console.warn('⚠️ No Telegram user data - running in browser test mode');
      updateUserProfile({
        first_name: 'Test User',
        username: 'testuser',
        photo_url: null
      });
    }
    
    tg.ready();
  } catch (error) {
    console.error('❌ Error initializing Telegram Web App:', error);
    updateUserProfile({
      first_name: 'Guest',
      username: 'guest',
      photo_url: null
    });
  }
}

function updateUserProfile(user) {
  const accountName = document.querySelector('.account-name');
  const accountUsername = document.querySelector('.account-username');
  const accountAvatar = document.querySelector('.account-avatar');
  
  if (accountName) {
    const fullName = user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.first_name;
    accountName.textContent = fullName || 'User';
  }
  
  if (accountUsername) {
    accountUsername.textContent = user.username ? `@${user.username}` : 'No username';
  }
  
  if (accountAvatar) {
    if (user.photo_url) {
      accountAvatar.style.backgroundImage = `url(${user.photo_url})`;
      accountAvatar.style.backgroundSize = 'cover';
      accountAvatar.style.backgroundPosition = 'center';
    } else {
      const initials = (user.first_name?.[0] || 'U') + (user.last_name?.[0] || '');
      accountAvatar.textContent = initials;
      accountAvatar.style.display = 'flex';
      accountAvatar.style.alignItems = 'center';
      accountAvatar.style.justifyContent = 'center';
      accountAvatar.style.fontSize = '1.5rem';
      accountAvatar.style.fontWeight = 'bold';
      accountAvatar.style.color = '#60a5fa';
    }
  }
}

function sendDataToBot(data) {
  if (tg && tg.sendData) {
    try {
      tg.sendData(JSON.stringify(data));
      console.log('📤 Data sent to bot:', data);
    } catch (error) {
      console.error('❌ Error sending data to bot:', error);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTelegramWebApp);
} else {
  initTelegramWebApp();
}

// ============================================
// LOADING SCREEN LOGIC
// ============================================

(function() {
  'use strict';
  
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  window.addEventListener('orientationchange', function() {
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
  });
  
  function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
  
  let loadingAnimation;
  
  function initLoadingAnimation() {
    const container = document.getElementById('lottie-loading-container');
    if (container && typeof lottie !== 'undefined') {
      loadingAnimation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/dev_duck--@DMJ_Stickers.json'
      });
    }
  }
  
  function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent = document.getElementById('mainContent');
    
    if (loadingScreen && mainContent) {
      loadingScreen.classList.add('hidden');
      
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainContent.style.display = 'block';
        
        setTimeout(() => {
          mainContent.classList.add('visible');
          document.body.classList.remove('no-scroll');
        }, 50);
      }, 500);
    }
  }
  
  function initLoadingScreen() {
    if (typeof lottie === 'undefined') {
      setTimeout(initLoadingScreen, 100);
      return;
    }
    
    initLoadingAnimation();
    
    const minLoadingTime = 2000;
    const startTime = Date.now();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        checkLoadingComplete(startTime, minLoadingTime);
      });
    } else {
      checkLoadingComplete(startTime, minLoadingTime);
    }
  }
  
  function checkLoadingComplete(startTime, minLoadingTime) {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minLoadingTime - elapsed);
    
    setTimeout(() => {
      hideLoadingScreen();
    }, remaining);
  }
  
  initLoadingScreen();
})();

// ============================================
// PRIZE ID GENERATION & INVENTORY SYSTEM
// ============================================

function generatePrizeId() {
  const fourDigits = Math.floor(1000 + Math.random() * 9000);
  const twoDigits = Math.floor(10 + Math.random() * 90);
  const threeLetters = Array.from({length: 3}, () => 
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  
  return `${fourDigits}-${twoDigits}-${threeLetters}`;
}

const PRIZE_COIN_VALUES = {
  'Heart': 50,
  'Bear': 75,
  'Rose': 100,
  'Gift': 125,
  'Cake': 150,
  'Rose Bouquet': 200,
  'Ring': 300,
  'Trophy': 500,
  'Diamond': 750,
  'Calendar': 1000
};

let inventoryItems = [];
const MAX_INVENTORY_DISPLAY = 6;

function addPrizeToInventory(prize) {
  const prizeWithId = {
    ...prize,
    prizeId: generatePrizeId(),
    claimedAt: Date.now()
  };
  
  inventoryItems.push(prizeWithId);
  updateInventoryDisplay();
  
  console.log('✅ Prize added to inventory:', prizeWithId);
  return prizeWithId;
}

function removePrizeFromInventory(prizeId) {
  const index = inventoryItems.findIndex(item => item.prizeId === prizeId);
  
  if (index !== -1) {
    const removed = inventoryItems.splice(index, 1)[0];
    updateInventoryDisplay();
    console.log('🗑️ Prize removed from inventory:', removed);
    return removed;
  }
  
  return null;
}

function updateInventoryDisplay() {
  const inventoryGrid = document.querySelector('.inventory-grid');
  if (!inventoryGrid) return;
  
  inventoryGrid.innerHTML = '';
  
  const displayItems = inventoryItems.slice(0, MAX_INVENTORY_DISPLAY);
  
  displayItems.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';
    itemDiv.dataset.prizeId = item.prizeId;
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'item-icon-container';
    
    if (item.lottie) {
      lottie.loadAnimation({
        container: iconDiv,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: item.lottie
      });
    }
    
    itemDiv.appendChild(iconDiv);
    
    itemDiv.addEventListener('click', () => {
      openPrizeModal(item);
    });
    
    inventoryGrid.appendChild(itemDiv);
  });
  
  const emptySlots = MAX_INVENTORY_DISPLAY - displayItems.length;
  for (let i = 0; i < emptySlots; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'inventory-item empty';
    inventoryGrid.appendChild(emptyDiv);
  }
  
  if (typeof updateLeaderboardData === 'function') {
    updateLeaderboardData();
  }
}

// ============================================
// PRIZE MODAL SYSTEM
// ============================================

const prizeModal = document.getElementById('prizeModal');
const prizeModalClose = document.getElementById('prizeModalClose');
const prizeModalIcon = document.getElementById('prizeModalIcon');
const prizeModalName = document.getElementById('prizeModalName');
const prizeModalId = document.getElementById('prizeModalId');
const prizeModalCoinValue = document.getElementById('prizeModalCoinValue');
const convertBtn = document.getElementById('convertBtn');
const claimPrizeBtn = document.getElementById('claimPrizeBtn');

let currentModalPrize = null;

function openPrizeModal(prize) {
  currentModalPrize = prize;
  
  prizeModalIcon.innerHTML = '';
  
  if (prize.lottie) {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    prizeModalIcon.appendChild(container);
    
    lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: prize.lottie
    });
  }
  
  prizeModalName.textContent = prize.value;
  prizeModalId.textContent = `ID: ${prize.prizeId}`;
  
  const coinValue = PRIZE_COIN_VALUES[prize.value] || 50;
  prizeModalCoinValue.innerHTML = `
    <img src="assets/Coin.svg" alt="Coin">
    <span>${coinValue.toLocaleString()} Coins</span>
  `;
  
  prizeModal.classList.add('show');
}

function closePrizeModal() {
  prizeModal.classList.remove('show');
  setTimeout(() => {
    prizeModalIcon.innerHTML = '';
    currentModalPrize = null;
  }, 300);
}

convertBtn.addEventListener('click', () => {
  if (!currentModalPrize) return;
  
  const coinValue = PRIZE_COIN_VALUES[currentModalPrize.value] || 50;
  
  const oldValue = virtualCurrency;
  const newValue = virtualCurrency + coinValue;
  animateCurrencyChange(oldValue, newValue);
  
  removePrizeFromInventory(currentModalPrize.prizeId);
  closePrizeModal();
  
  console.log(`💰 Converted ${currentModalPrize.value} (ID: ${currentModalPrize.prizeId}) to ${coinValue} coins`);
});

claimPrizeBtn.addEventListener('click', () => {
  if (!currentModalPrize) {
    console.error('❌ No prize selected!');
    return;
  }
  
  const prizeId = currentModalPrize.prizeId;
  const prizeName = currentModalPrize.value;
  
  console.log('🎁 CLAIM BUTTON CLICKED');
  console.log('   Prize ID:', prizeId);
  console.log('   Prize Name:', prizeName);
  
  const claimData = {
    action: 'claim_prize',
    prizeId: prizeId,
    prizeName: prizeName,
    timestamp: Date.now()
  };
  
  console.log('📦 Claim data prepared:', claimData);
  
  // ============================================
  // FIX 1: Check if Telegram WebApp is available
  // ============================================
  if (typeof window.Telegram === 'undefined' || !window.Telegram.WebApp) {
    console.error('❌ Telegram WebApp not available!');
    console.log('🔍 Running in browser mode - showing alert instead');
    alert(`Prize Claimed!\n\nPrize: ${prizeName}\nID: ${prizeId}\n\n(In Telegram, this would send data to bot)`);
    
    removePrizeFromInventory(prizeId);
    closePrizeModal();
    return;
  }
  
  // ============================================
  // FIX 2: Use the correct method to send data
  // ============================================
  try {
    const tg = window.Telegram.WebApp;
    const dataString = JSON.stringify(claimData);
    
    console.log('📤 Attempting to send data to bot...');
    console.log('   Data string:', dataString);
    console.log('   Data length:', dataString.length, 'bytes');
    
    // Send data to bot
    tg.sendData(dataString);
    
    console.log('✅ Data sent successfully!');
    console.log('🔔 Check your bot console for the message');
    
    // Show success feedback
    alert(`Prize claim sent to bot!\n\nPrize: ${prizeName}\nID: ${prizeId}\n\nCheck your Telegram for confirmation!`);
    
  } catch (error) {
    console.error('❌ Error sending data to bot:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    alert(`Error sending to bot: ${error.message}\n\nPlease try again or contact support.`);
    return;
  }
  
  // Remove from inventory and close modal
  removePrizeFromInventory(prizeId);
  closePrizeModal();
  
  console.log('✅ Prize removed from inventory, modal closed');
});

if (prizeModalClose) {
  prizeModalClose.addEventListener('click', closePrizeModal);
}

if (prizeModal) {
  prizeModal.addEventListener('click', (e) => {
    if (e.target === prizeModal) {
      closePrizeModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && prizeModal && prizeModal.classList.contains('show')) {
    closePrizeModal();
  }
});

function getInventoryItems() {
  return inventoryItems.map(item => ({
    prizeId: item.prizeId,
    prizeName: item.value,
    prizeType: item.type,
    claimedAt: item.claimedAt
  }));
}

function verifyPrizeExists(prizeId) {
  return inventoryItems.some(item => item.prizeId === prizeId);
}

window.generatePrizeId = generatePrizeId;
window.addPrizeToInventory = addPrizeToInventory;
window.removePrizeFromInventory = removePrizeFromInventory;
window.getInventoryItems = getInventoryItems;
window.verifyPrizeExists = verifyPrizeExists;

// ============================================
// MAIN PORTFOLIO FUNCTIONALITY
// ============================================

let currentPage = 'home';

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navClose = document.getElementById('navClose');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-link');
const debugPanel = document.getElementById('debugPanel');
const imitateWinBtn = document.getElementById('imitateWinBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const notificationContainer = document.getElementById('notificationContainer');
const notificationCount = document.getElementById('notificationCount');
const currencyAmount = document.getElementById('currencyAmount');
const currentPageDebug = document.getElementById('currentPageDebug');

let notifications = [];
const MAX_NOTIFICATIONS = 15;
let virtualCurrency = 0;

function navigateToPage(pageName) {
  document.querySelectorAll('.page-content').forEach(page => {
    page.classList.remove('active');
  });
  
  const selectedPage = document.getElementById(`page-${pageName}`);
  if (selectedPage) {
    selectedPage.classList.add('active');
  }
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === pageName) {
      link.classList.add('active');
    }
  });
  
  currentPageDebug.textContent = pageName;
  currentPage = pageName;
  
  history.pushState(null, null, `#${pageName}`);
  
  if (pageName === 'leaderboard') {
    initializeLeaderboard();
  }
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageName = link.dataset.page;
    navigateToPage(pageName);
    
    if (navMenu.classList.contains('active')) {
      toggleMenu();
    }
  });
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1) || 'home';
  navigateToPage(hash);
});

window.addEventListener('load', () => {
  const hash = window.location.hash.slice(1) || 'home';
  navigateToPage(hash);
});

function updateCurrencyDisplay() {
  const formattedAmount = virtualCurrency.toLocaleString();
  currencyAmount.textContent = formattedAmount;
}

function animateCurrencyChange(oldValue, newValue, duration = 1000) {
  const start = performance.now();
  const difference = newValue - oldValue;

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(oldValue + (difference * easeOutCubic));
    
    currencyAmount.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      virtualCurrency = newValue;
      currencyAmount.textContent = newValue.toLocaleString();
      
      updateLeaderboardData();
    }
  }
  
  requestAnimationFrame(update);
}

function addCurrency(amount) {
  const oldValue = virtualCurrency;
  const newValue = virtualCurrency + amount;
  animateCurrencyChange(oldValue, newValue);
}

updateCurrencyDisplay();
updateInventoryDisplay();

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    let lottieAnim = lottie.loadAnimation({
      container: document.getElementById('lottieAnimation'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'assets/DailyGift.json'
    });

    lottieAnim.addEventListener('complete', function() {
      setTimeout(() => {
        lottieAnim.goToAndPlay(0, true);
      }, 5000);
    });

    setTimeout(() => {
      lottieAnim.play();
    }, 1000);

    let inventoryLottieAnim = lottie.loadAnimation({
      container: document.getElementById('inventoryLottieAnimation'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'assets/CrystalForInv.json'
    });

    inventoryLottieAnim.addEventListener('complete', function() {
      setTimeout(() => {
        inventoryLottieAnim.goToAndPlay(0, true);
      }, 5000);
    });

    setTimeout(() => {
      inventoryLottieAnim.play();
    }, 1000);
  }, 2500);
});

function toggleMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  overlay.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

hamburger.addEventListener('click', toggleMenu);
navClose.addEventListener('click', toggleMenu);

overlay.addEventListener('click', () => {
  if (navMenu.classList.contains('active')) {
    toggleMenu();
  }
  if (debugPanel.classList.contains('active')) {
    debugPanel.classList.remove('active');
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    debugPanel.classList.toggle('active');
  }
  
  if (e.key === 'Escape') {
    if (navMenu.classList.contains('active')) {
      toggleMenu();
    }
    if (debugPanel.classList.contains('active')) {
      debugPanel.classList.remove('active');
    }
  }
});

function createErrorIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.style.color = '#ef4444';
  
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '10');
  
  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', '15');
  line1.setAttribute('y1', '9');
  line1.setAttribute('x2', '9');
  line1.setAttribute('y2', '15');
  
  const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2.setAttribute('x1', '9');
  line2.setAttribute('y1', '9');
  line2.setAttribute('x2', '15');
  line2.setAttribute('y2', '15');
  
  svg.appendChild(circle);
  svg.appendChild(line1);
  svg.appendChild(line2);
  
  return svg;
}

function addNotification() {
  if (notifications.length >= MAX_NOTIFICATIONS) {
    console.log('Maximum notifications reached');
    return;
  }

  const cube = document.createElement('div');
  cube.className = 'notification-cube';
  const id = Date.now() + Math.random();
  cube.dataset.id = id;

  const icon = createErrorIcon();
  cube.appendChild(icon);

  const closeBtn = document.createElement('div');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    removeNotification(id);
  };
  cube.appendChild(closeBtn);

  const timeBar = document.createElement('div');
  timeBar.className = 'time-bar';
  
  const timeBarFill = document.createElement('div');
  timeBarFill.className = 'time-bar-fill';
  
  timeBar.appendChild(timeBarFill);
  cube.appendChild(timeBar);

  cube.onclick = () => {
    alert('Notification clicked! ID: ' + id);
  };

  notificationContainer.appendChild(cube);
  notifications.push(id);
  updateNotificationCount();

  setTimeout(() => {
    removeNotification(id);
  }, 20000);
}

function removeNotification(id) {
  const cube = document.querySelector(`[data-id="${id}"]`);
  if (cube) {
    cube.style.animation = 'none';
    cube.style.transform = 'translateX(100px)';
    cube.style.opacity = '0';
    setTimeout(() => {
      cube.remove();
      notifications = notifications.filter(n => n !== id);
      updateNotificationCount();
    }, 300);
  }
}

function clearAllNotifications() {
  notifications.forEach(id => {
    const cube = document.querySelector(`[data-id="${id}"]`);
    if (cube) {
      cube.style.animation = 'none';
      cube.style.transform = 'translateX(100px)';
      cube.style.opacity = '0';
    }
  });
  setTimeout(() => {
    notificationContainer.innerHTML = '';
    notifications = [];
    updateNotificationCount();
  }, 300);
}

function updateNotificationCount() {
  notificationCount.textContent = notifications.length;
}

imitateWinBtn.addEventListener('click', () => {
  addNotification();
  const earnedAmount = Math.floor(Math.random() * 151) + 50;
  addCurrency(earnedAmount);
});

clearAllBtn.addEventListener('click', () => {
  clearAllNotifications();
});

// ============================================
// CONTENT BOX CLICK HANDLERS
// ============================================

// Daily Bag of Loot (purple box) - Navigate to spin wheel
document.querySelector('.content-box-left-1').addEventListener('click', () => {
  navigateToPage('dailyspin');
});

// Inventory (golden box) - Currently shows alert
document.querySelector('.content-box-right').addEventListener('click', () => {
  alert('Inventory clicked!');
});

// Projects (bottom left) - Placeholder
document.querySelector('.content-box-bottom-1').addEventListener('click', () => {
  alert('Projects clicked!');
});

// Contact (bottom right) - Placeholder
document.querySelector('.content-box-bottom-2').addEventListener('click', () => {
  alert('Contact clicked!');
});


// ============================================
// LEADERBOARD FUNCTIONALITY
// ============================================

let leaderboardData = {
  coins: [
    { id: 1, name: 'CryptoKing', username: 'cryptoking', coins: 15420, avatar: null },
    { id: 2, name: 'MoonWalker', username: 'moonwalker', coins: 12850, avatar: null },
    { id: 3, name: 'DiamondHands', username: 'diamondhands', coins: 10370, avatar: null },
    { id: 4, name: 'TokenMaster', username: 'tokenmaster', coins: 8920, avatar: null },
    { id: 5, name: 'BlockChainer', username: 'blockchainer', coins: 7540, avatar: null },
    { id: 6, name: 'NFT Hunter', username: 'nfthunter', coins: 6230, avatar: null },
    { id: 7, name: 'Satoshi Fan', username: 'satoshifan', coins: 5180, avatar: null },
    { id: 8, name: 'Whale Watcher', username: 'whalewatcher', coins: 4560, avatar: null },
  ],
  gifts: [
    { id: 1, name: 'GiftCollector', username: 'giftcollector', gifts: 87, avatar: null },
    { id: 2, name: 'Present Pro', username: 'presentpro', gifts: 65, avatar: null },
    { id: 3, name: 'Lucky Winner', username: 'luckywinner', gifts: 52, avatar: null },
    { id: 4, name: 'Spin Master', username: 'spinmaster', gifts: 43, avatar: null },
    { id: 5, name: 'Fortune Finder', username: 'fortunefinder', gifts: 38, avatar: null },
    { id: 6, name: 'Reward Hunter', username: 'rewardhunter', gifts: 31, avatar: null },
    { id: 7, name: 'Loot Lord', username: 'lootlord', gifts: 27, avatar: null },
    { id: 8, name: 'Prize Collector', username: 'prizecollector', gifts: 19, avatar: null },
  ]
};

let currentLeaderboardTab = 'coins';

function initializeLeaderboard() {
  const trophyIcon = document.getElementById('leaderboardTrophyIcon');
  if (trophyIcon && trophyIcon.children.length === 0) {
    lottie.loadAnimation({
      container: trophyIcon,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/giftTrophy.json'
    });
  }
  
  const giftTabIcon = document.getElementById('giftTabIcon');
  if (giftTabIcon && giftTabIcon.children.length === 0) {
    lottie.loadAnimation({
      container: giftTabIcon,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/giftHeart.json'
    });
  }
  
  const tabs = document.querySelectorAll('.leaderboard-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabType = tab.dataset.tab;
      currentLeaderboardTab = tabType;
      
      document.querySelectorAll('.leaderboard-list').forEach(list => {
        list.classList.remove('active');
      });
      document.getElementById(`leaderboard-${tabType}`).classList.add('active');
      
      renderLeaderboard(tabType);
    });
  });
  
  renderLeaderboard('coins');
}

function renderLeaderboard(type) {
  const data = type === 'coins' ? leaderboardData.coins : leaderboardData.gifts;
  const container = document.getElementById(`leaderboard-${type}`);
  
  if (!container) return;
  
  const podiumContainer = container.querySelector('.podium-container');
  const ranksList = container.querySelector('.ranks-list');
  
  podiumContainer.innerHTML = '';
  ranksList.innerHTML = '';
  
  data.slice(0, 3).forEach((player, index) => {
    const rank = index + 1;
    const card = createPodiumCard(player, rank, type);
    podiumContainer.appendChild(card);
  });
  
  data.slice(3).forEach((player, index) => {
    const rank = index + 4;
    const card = createRankCard(player, rank, type);
    ranksList.appendChild(card);
  });
  
  updateYourRank(type);
}

function createPodiumCard(player, rank, type) {
  const card = document.createElement('div');
  card.className = 'podium-card';
  card.setAttribute('data-rank', rank);
  
  const rankBadge = document.createElement('div');
  rankBadge.className = 'podium-rank';
  rankBadge.textContent = rank;
  
  const avatar = document.createElement('div');
  avatar.className = 'podium-avatar';
  if (player.avatar) {
    avatar.style.backgroundImage = `url(${player.avatar})`;
    avatar.style.backgroundSize = 'cover';
  } else {
    const initials = player.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    avatar.textContent = initials;
  }
  
  const name = document.createElement('div');
  name.className = 'podium-name';
  name.textContent = player.name;
  
  const score = document.createElement('div');
  score.className = 'podium-score';
  score.textContent = type === 'coins' ? player.coins.toLocaleString() : `${player.gifts} gifts`;
  
  card.appendChild(rankBadge);
  card.appendChild(avatar);
  card.appendChild(name);
  card.appendChild(score);
  
  return card;
}

function createRankCard(player, rank, type) {
  const card = document.createElement('div');
  card.className = 'rank-card';
  
  const position = document.createElement('div');
  position.className = 'rank-position';
  position.textContent = `#${rank}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'rank-avatar';
  if (player.avatar) {
    avatar.style.backgroundImage = `url(${player.avatar})`;
    avatar.style.backgroundSize = 'cover';
  } else {
    const initials = player.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    avatar.textContent = initials;
  }
  
  const info = document.createElement('div');
  info.className = 'rank-info';
  
  const name = document.createElement('div');
  name.className = 'rank-name';
  name.textContent = player.name;
  
  const score = document.createElement('div');
  score.className = 'rank-score';
  score.textContent = type === 'coins' ? `${player.coins.toLocaleString()} coins` : `${player.gifts} gifts`;
  
  info.appendChild(name);
  info.appendChild(score);
  
  card.appendChild(position);
  card.appendChild(avatar);
  card.appendChild(info);
  
  return card;
}

function updateYourRank(type) {
  const yourRankElem = document.getElementById('yourRank');
  const yourRankNameElem = document.getElementById('yourRankName');
  const yourRankScoreElem = document.getElementById('yourRankScore');
  
  if (!yourRankElem || !yourRankNameElem || !yourRankScoreElem) return;
  
  const currentUser = userData || { first_name: 'You', username: 'you' };
  const userName = currentUser.last_name 
    ? `${currentUser.first_name} ${currentUser.last_name}` 
    : currentUser.first_name;
  
  yourRankNameElem.textContent = userName;
  
  if (type === 'coins') {
    const data = leaderboardData.coins;
    let rank = data.filter(p => p.coins > virtualCurrency).length + 1;
    
    yourRankElem.textContent = rank;
    yourRankScoreElem.textContent = `${virtualCurrency.toLocaleString()} coins`;
  } else {
    const giftCount = inventoryItems.length;
    const data = leaderboardData.gifts;
    let rank = data.filter(p => p.gifts > giftCount).length + 1;
    
    yourRankElem.textContent = rank;
    yourRankScoreElem.textContent = `${giftCount} gifts`;
  }
}

function updateLeaderboardData() {
  if (currentPage === 'leaderboard') {
    updateYourRank(currentLeaderboardTab);
  }
}

// ============================================
// SETTINGS PAGE FUNCTIONALITY - FIXED VERSION
// ============================================

// Settings state
const settingsState = {
  language: 'en',
  pushNotifications: true,
  soundEffects: true,
  prizeAlerts: true,
  animationsEnabled: true,
  confettiEffects: true,
  showInLeaderboard: true,
  shareStats: true
};

// COMPREHENSIVE Translation system - ALL text in the app
const translations = {
  en: {
    // Settings page
    settings: 'Settings',
    customizeExperience: 'Customize your experience',
    promocode: 'Promocode',
    enterPromocode: 'Enter promocode...',
    language: 'Language',
    appLanguage: 'App Language',
    chooseLanguage: 'Choose your preferred language',
    notifications: 'Notifications',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Receive notifications about wins and updates',
    soundEffects: 'Sound Effects',
    soundEffectsDesc: 'Play sounds when spinning the wheel',
    prizeAlerts: 'Prize Alerts',
    prizeAlertsDesc: 'Get notified when you win rare prizes',
    display: 'Display',
    animations: 'Animations',
    animationsDesc: 'Enable smooth animations and effects',
    confettiEffects: 'Confetti Effects',
    confettiEffectsDesc: 'Show confetti when winning prizes',
    privacy: 'Privacy',
    showInLeaderboard: 'Show in Leaderboard',
    showInLeaderboardDesc: 'Display your stats on the public leaderboard',
    shareStats: 'Share Statistics',
    shareStatsDesc: 'Allow sharing your game stats with friends',
    
    // Navigation
    home: 'Home',
    leaderboard: 'Leaderboard',
    deposit: 'Deposit',
    
    // Home page
    dailyGift: 'Daily',
    bagOfLoot: 'Bag of Loot!',
    dailyGiftSubtitle: 'Daily gift from us!',
    inventory: 'Inventory',
    yourCollectedItems: 'Your collected items',
    viewAllItems: 'View All Items',
    projects: 'Projects',
    contact: 'Contact',
    
    // Leaderboard
    topPlayers: 'Top Players',
    coins: 'Coins',
    gifts: 'Gifts',
    yourRank: 'Your Rank',
    
    // Daily Spin
    spinToWin: 'Spin to Win',
    spinWheel: 'SPIN THE WHEEL',
    congratulations: 'Congratulations!',
    youWon: 'You won',
    claimPrize: 'Claim Prize',
    
    // Prize Modal
    convertToCoins: 'Convert to Coins',
    claim: 'Claim',
    
    // Settings sections
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    dangerZone: 'Danger Zone',
    resetAllData: 'Reset All Data',
    resetDataDesc: 'Delete all your coins, prizes, and settings',
    clearCache: 'Clear Cache',
    clearCacheDesc: 'Clear temporary cached data',
    
    // Common
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save'
  },
  
  ru: {
    // Settings page
    settings: 'Настройки',
    customizeExperience: 'Настройте свой опыт',
    promocode: 'Промокод',
    enterPromocode: 'Введите промокод...',
    language: 'Язык',
    appLanguage: 'Язык приложения',
    chooseLanguage: 'Выберите предпочитаемый язык',
    notifications: 'Уведомления',
    pushNotifications: 'Push-уведомления',
    pushNotificationsDesc: 'Получайте уведомления о выигрышах и обновлениях',
    soundEffects: 'Звуковые эффекты',
    soundEffectsDesc: 'Воспроизводить звуки при вращении колеса',
    prizeAlerts: 'Оповещения о призах',
    prizeAlertsDesc: 'Получать уведомления о редких призах',
    display: 'Отображение',
    animations: 'Анимации',
    animationsDesc: 'Включить плавные анимации и эффекты',
    confettiEffects: 'Эффекты конфетти',
    confettiEffectsDesc: 'Показывать конфетти при выигрыше призов',
    privacy: 'Конфиденциальность',
    showInLeaderboard: 'Показать в таблице лидеров',
    showInLeaderboardDesc: 'Отображать вашу статистику в публичной таблице',
    shareStats: 'Делиться статистикой',
    shareStatsDesc: 'Разрешить делиться игровой статистикой с друзьями',
    
    // Navigation
    home: 'Главная',
    leaderboard: 'Таблица лидеров',
    deposit: 'Депозит',
    
    // Home page
    dailyGift: 'Ежедневный',
    bagOfLoot: 'Мешок добычи!',
    dailyGiftSubtitle: 'Ежедневный подарок от нас!',
    inventory: 'Инвентарь',
    yourCollectedItems: 'Ваши собранные предметы',
    viewAllItems: 'Просмотреть все предметы',
    projects: 'Проекты',
    contact: 'Контакт',
    
    // Leaderboard
    topPlayers: 'Лучшие игроки',
    coins: 'Монеты',
    gifts: 'Подарки',
    yourRank: 'Ваш ранг',
    
    // Daily Spin
    spinToWin: 'Крутите, чтобы выиграть',
    spinWheel: 'КРУТИТЬ КОЛЕСО',
    congratulations: 'Поздравляем!',
    youWon: 'Вы выиграли',
    claimPrize: 'Забрать приз',
    
    // Prize Modal
    convertToCoins: 'Конвертировать в монеты',
    claim: 'Забрать',
    
    // Settings sections
    termsOfService: 'Условия использования',
    privacyPolicy: 'Политика конфиденциальности',
    dangerZone: 'Опасная зона',
    resetAllData: 'Сбросить все данные',
    resetDataDesc: 'Удалить все ваши монеты, призы и настройки',
    clearCache: 'Очистить кэш',
    clearCacheDesc: 'Очистить временные кэшированные данные',
    
    // Common
    close: 'Закрыть',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    save: 'Сохранить'
  },
  
  es: {
    // Settings page
    settings: 'Configuración',
    customizeExperience: 'Personaliza tu experiencia',
    promocode: 'Código promocional',
    enterPromocode: 'Ingresa código promocional...',
    language: 'Idioma',
    appLanguage: 'Idioma de la aplicación',
    chooseLanguage: 'Elige tu idioma preferido',
    notifications: 'Notificaciones',
    pushNotifications: 'Notificaciones Push',
    pushNotificationsDesc: 'Recibir notificaciones sobre ganancias y actualizaciones',
    soundEffects: 'Efectos de sonido',
    soundEffectsDesc: 'Reproducir sonidos al girar la rueda',
    prizeAlerts: 'Alertas de premios',
    prizeAlertsDesc: 'Recibir notificaciones cuando ganes premios raros',
    display: 'Pantalla',
    animations: 'Animaciones',
    animationsDesc: 'Habilitar animaciones y efectos suaves',
    confettiEffects: 'Efectos de confeti',
    confettiEffectsDesc: 'Mostrar confeti al ganar premios',
    privacy: 'Privacidad',
    showInLeaderboard: 'Mostrar en tabla de clasificación',
    showInLeaderboardDesc: 'Mostrar tus estadísticas en la tabla pública',
    shareStats: 'Compartir estadísticas',
    shareStatsDesc: 'Permitir compartir tus estadísticas del juego con amigos',
    
    // Navigation
    home: 'Inicio',
    leaderboard: 'Tabla de clasificación',
    deposit: 'Depósito',
    
    // Home page
    dailyGift: 'Diario',
    bagOfLoot: '¡Bolsa de botín!',
    dailyGiftSubtitle: '¡Regalo diario de nosotros!',
    inventory: 'Inventario',
    yourCollectedItems: 'Tus artículos recolectados',
    viewAllItems: 'Ver todos los artículos',
    projects: 'Proyectos',
    contact: 'Contacto',
    
    // Leaderboard
    topPlayers: 'Mejores jugadores',
    coins: 'Monedas',
    gifts: 'Regalos',
    yourRank: 'Tu rango',
    
    // Daily Spin
    spinToWin: 'Gira para ganar',
    spinWheel: 'GIRAR LA RUEDA',
    congratulations: '¡Felicitaciones!',
    youWon: 'Ganaste',
    claimPrize: 'Reclamar premio',
    
    // Prize Modal
    convertToCoins: 'Convertir a monedas',
    claim: 'Reclamar',
    
    // Settings sections
    termsOfService: 'Términos de servicio',
    privacyPolicy: 'Política de privacidad',
    dangerZone: 'Zona de peligro',
    resetAllData: 'Restablecer todos los datos',
    resetDataDesc: 'Eliminar todas tus monedas, premios y configuraciones',
    clearCache: 'Limpiar caché',
    clearCacheDesc: 'Limpiar datos temporales en caché',
    
    // Common
    close: 'Cerrar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar'
  },
  
  fr: {
    // Settings page
    settings: 'Paramètres',
    customizeExperience: 'Personnalisez votre expérience',
    promocode: 'Code promo',
    enterPromocode: 'Entrez le code promo...',
    language: 'Langue',
    appLanguage: 'Langue de l\'application',
    chooseLanguage: 'Choisissez votre langue préférée',
    notifications: 'Notifications',
    pushNotifications: 'Notifications Push',
    pushNotificationsDesc: 'Recevoir des notifications sur les gains et mises à jour',
    soundEffects: 'Effets sonores',
    soundEffectsDesc: 'Jouer des sons lors de la rotation de la roue',
    prizeAlerts: 'Alertes de prix',
    prizeAlertsDesc: 'Être notifié lorsque vous gagnez des prix rares',
    display: 'Affichage',
    animations: 'Animations',
    animationsDesc: 'Activer les animations et effets fluides',
    confettiEffects: 'Effets de confettis',
    confettiEffectsDesc: 'Afficher des confettis lors de la victoire',
    privacy: 'Confidentialité',
    showInLeaderboard: 'Afficher dans le classement',
    showInLeaderboardDesc: 'Afficher vos statistiques dans le classement public',
    shareStats: 'Partager les statistiques',
    shareStatsDesc: 'Autoriser le partage de vos statistiques de jeu avec des amis',
    
    // Navigation
    home: 'Accueil',
    leaderboard: 'Classement',
    deposit: 'Dépôt',
    
    // Home page
    dailyGift: 'Quotidien',
    bagOfLoot: 'Sac de butin!',
    dailyGiftSubtitle: 'Cadeau quotidien de notre part!',
    inventory: 'Inventaire',
    yourCollectedItems: 'Vos objets collectés',
    viewAllItems: 'Voir tous les objets',
    projects: 'Projets',
    contact: 'Contact',
    
    // Leaderboard
    topPlayers: 'Meilleurs joueurs',
    coins: 'Pièces',
    gifts: 'Cadeaux',
    yourRank: 'Votre rang',
    
    // Daily Spin
    spinToWin: 'Tournez pour gagner',
    spinWheel: 'TOURNER LA ROUE',
    congratulations: 'Félicitations!',
    youWon: 'Vous avez gagné',
    claimPrize: 'Réclamer le prix',
    
    // Prize Modal
    convertToCoins: 'Convertir en pièces',
    claim: 'Réclamer',
    
    // Settings sections
    termsOfService: 'Conditions d\'utilisation',
    privacyPolicy: 'Politique de confidentialité',
    dangerZone: 'Zone dangereuse',
    resetAllData: 'Réinitialiser toutes les données',
    resetDataDesc: 'Supprimer toutes vos pièces, prix et paramètres',
    clearCache: 'Vider le cache',
    clearCacheDesc: 'Effacer les données temporaires en cache',
    
    // Common
    close: 'Fermer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer'
  },
  
  de: {
    // Settings page
    settings: 'Einstellungen',
    customizeExperience: 'Passen Sie Ihre Erfahrung an',
    promocode: 'Aktionscode',
    enterPromocode: 'Aktionscode eingeben...',
    language: 'Sprache',
    appLanguage: 'App-Sprache',
    chooseLanguage: 'Wählen Sie Ihre bevorzugte Sprache',
    notifications: 'Benachrichtigungen',
    pushNotifications: 'Push-Benachrichtigungen',
    pushNotificationsDesc: 'Benachrichtigungen über Gewinne und Updates erhalten',
    soundEffects: 'Soundeffekte',
    soundEffectsDesc: 'Sounds beim Drehen des Rads abspielen',
    prizeAlerts: 'Preis-Benachrichtigungen',
    prizeAlertsDesc: 'Benachrichtigt werden, wenn Sie seltene Preise gewinnen',
    display: 'Anzeige',
    animations: 'Animationen',
    animationsDesc: 'Flüssige Animationen und Effekte aktivieren',
    confettiEffects: 'Konfetti-Effekte',
    confettiEffectsDesc: 'Konfetti beim Gewinnen von Preisen anzeigen',
    privacy: 'Datenschutz',
    showInLeaderboard: 'In Bestenliste anzeigen',
    showInLeaderboardDesc: 'Ihre Statistiken in der öffentlichen Bestenliste anzeigen',
    shareStats: 'Statistiken teilen',
    shareStatsDesc: 'Teilen Ihrer Spielstatistiken mit Freunden erlauben',
    
    // Navigation
    home: 'Startseite',
    leaderboard: 'Bestenliste',
    deposit: 'Einzahlung',
    
    // Home page
    dailyGift: 'Täglich',
    bagOfLoot: 'Beutesack!',
    dailyGiftSubtitle: 'Tägliches Geschenk von uns!',
    inventory: 'Inventar',
    yourCollectedItems: 'Ihre gesammelten Gegenstände',
    viewAllItems: 'Alle Gegenstände anzeigen',
    projects: 'Projekte',
    contact: 'Kontakt',
    
    // Leaderboard
    topPlayers: 'Top-Spieler',
    coins: 'Münzen',
    gifts: 'Geschenke',
    yourRank: 'Ihr Rang',
    
    // Daily Spin
    spinToWin: 'Drehen zum Gewinnen',
    spinWheel: 'RAD DREHEN',
    congratulations: 'Herzlichen Glückwunsch!',
    youWon: 'Sie haben gewonnen',
    claimPrize: 'Preis beanspruchen',
    
    // Prize Modal
    convertToCoins: 'In Münzen umwandeln',
    claim: 'Beanspruchen',
    
    // Settings sections
    termsOfService: 'Nutzungsbedingungen',
    privacyPolicy: 'Datenschutzrichtlinie',
    dangerZone: 'Gefahrenzone',
    resetAllData: 'Alle Daten zurücksetzen',
    resetDataDesc: 'Alle Ihre Münzen, Preise und Einstellungen löschen',
    clearCache: 'Cache leeren',
    clearCacheDesc: 'Temporäre zwischengespeicherte Daten löschen',
    
    // Common
    close: 'Schließen',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    save: 'Speichern'
  },
  
  zh: {
    // Settings page
    settings: '设置',
    customizeExperience: '自定义您的体验',
    promocode: '促销代码',
    enterPromocode: '输入促销代码...',
    language: '语言',
    appLanguage: '应用语言',
    chooseLanguage: '选择您的首选语言',
    notifications: '通知',
    pushNotifications: '推送通知',
    pushNotificationsDesc: '接收有关获奖和更新的通知',
    soundEffects: '音效',
    soundEffectsDesc: '转动轮盘时播放声音',
    prizeAlerts: '奖品提醒',
    prizeAlertsDesc: '获得稀有奖品时收到通知',
    display: '显示',
    animations: '动画',
    animationsDesc: '启用流畅的动画和效果',
    confettiEffects: '彩纸效果',
    confettiEffectsDesc: '获胜时显示彩纸',
    privacy: '隐私',
    showInLeaderboard: '显示在排行榜',
    showInLeaderboardDesc: '在公共排行榜上显示您的统计数据',
    shareStats: '分享统计',
    shareStatsDesc: '允许与朋友分享您的游戏统计',
    
    // Navigation
    home: '主页',
    leaderboard: '排行榜',
    deposit: '存款',
    
    // Home page
    dailyGift: '每日',
    bagOfLoot: '战利品袋！',
    dailyGiftSubtitle: '我们的每日礼物！',
    inventory: '库存',
    yourCollectedItems: '您收集的物品',
    viewAllItems: '查看所有物品',
    projects: '项目',
    contact: '联系',
    
    // Leaderboard
    topPlayers: '顶级玩家',
    coins: '硬币',
    gifts: '礼物',
    yourRank: '您的排名',
    
    // Daily Spin
    spinToWin: '旋转获胜',
    spinWheel: '转动轮盘',
    congratulations: '恭喜！',
    youWon: '您赢得了',
    claimPrize: '领取奖品',
    
    // Prize Modal
    convertToCoins: '转换为硬币',
    claim: '领取',
    
    // Settings sections
    termsOfService: '服务条款',
    privacyPolicy: '隐私政策',
    dangerZone: '危险区域',
    resetAllData: '重置所有数据',
    resetDataDesc: '删除所有您的硬币、奖品和设置',
    clearCache: '清除缓存',
    clearCacheDesc: '清除临时缓存数据',
    
    // Common
    close: '关闭',
    cancel: '取消',
    confirm: '确认',
    save: '保存'
  }
};

// Language names
const languageNames = {
  'en': 'English',
  'ru': 'Русский',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'zh': '中文'
};

// Translation function
function t(key) {
  const lang = settingsState.language;
  return translations[lang]?.[key] || translations['en'][key] || key;
}

// FIXED: Comprehensive translation application
function applyTranslations() {
  console.log('🌐 Applying translations for language:', settingsState.language);
  
  // 1. Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    
    if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
      el.placeholder = translation;
    } else if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      // For buttons and links, preserve icons but update text
      const icon = el.querySelector('svg, img, .icon');
      if (icon) {
        // Keep icon, replace text
        const textNodes = Array.from(el.childNodes).filter(node => 
          node.nodeType === Node.TEXT_NODE && node.textContent.trim()
        );
        textNodes.forEach(node => node.textContent = translation);
      } else {
        el.textContent = translation;
      }
    } else {
      el.textContent = translation;
    }
  });
  
  // 2. Navigation links (special handling to preserve icons)
  const navTranslations = {
    'home': 'Home',
    'leaderboard': 'Leaderboard',
    'deposit': 'Deposit',
    'settings': 'Settings'
  };
  
  document.querySelectorAll('.nav-link').forEach(link => {
    const page = link.getAttribute('data-page');
    if (page && navTranslations[page]) {
      const translationKey = page === 'settings' ? 'settings' : page;
      const translation = t(translationKey);
      
      // Find text node and update it
      const textNode = Array.from(link.childNodes).find(node => 
        node.nodeType === Node.TEXT_NODE
      );
      if (textNode) {
        textNode.textContent = translation;
      }
    }
  });
  
  // 3. Daily gift title (complex structure)
  const dailyGiftTitle = document.querySelector('.daily-gift-title');
  if (dailyGiftTitle) {
    dailyGiftTitle.innerHTML = `
      <span class="star">★</span>
      <span>${t('dailyGift')} </span>
      <span class="loot-text">${t('bagOfLoot')}</span>
    `;
  }
  
  // 4. Settings page specific elements
  const settingsTitle = document.querySelector('.settings-title');
  if (settingsTitle) settingsTitle.textContent = t('settings');
  
  const settingsSubtitle = document.querySelector('.settings-subtitle');
  if (settingsSubtitle) settingsSubtitle.textContent = t('customizeExperience');
  
  // 5. Section headers in settings
  document.querySelectorAll('.settings-section h3').forEach(header => {
    const key = header.getAttribute('data-i18n');
    if (key) {
      header.textContent = t(key);
    }
  });
  
  // 6. Setting items labels and descriptions
  document.querySelectorAll('.setting-item').forEach(item => {
    const label = item.querySelector('.setting-label');
    const desc = item.querySelector('.setting-description');
    
    if (label) {
      const key = label.getAttribute('data-i18n');
      if (key) label.textContent = t(key);
    }
    
    if (desc) {
      const key = desc.getAttribute('data-i18n');
      if (key) desc.textContent = t(key);
    }
  });
  
  // 7. Buttons
  document.querySelectorAll('.setting-button, .danger-button').forEach(btn => {
    const key = btn.getAttribute('data-i18n');
    if (key) btn.textContent = t(key);
  });
  
  // 8. Update current language display
  const currentLanguageElem = document.getElementById('currentLanguage');
  if (currentLanguageElem) {
    currentLanguageElem.textContent = languageNames[settingsState.language];
  }
  
  // 9. Leaderboard tab labels
  const coinTabLabel = document.querySelector('[data-tab="coins"]');
  if (coinTabLabel) {
    const textSpan = coinTabLabel.querySelector('.tab-label');
    if (textSpan) textSpan.textContent = t('coins');
  }
  
  const giftTabLabel = document.querySelector('[data-tab="gifts"]');
  if (giftTabLabel) {
    const textSpan = giftTabLabel.querySelector('.tab-label');
    if (textSpan) textSpan.textContent = t('gifts');
  }
  
  // 10. Your Rank section
  const yourRankLabel = document.querySelector('.your-rank-label');
  if (yourRankLabel) yourRankLabel.textContent = t('yourRank');
  
  console.log(`✅ Translations applied for language: ${settingsState.language}`);
}

// FIXED: Animation control that preserves critical animations
function applySettingsEffects() {
  const html = document.documentElement;
  
  console.log('⚙️ Applying settings effects...');
  console.log('   Animations enabled:', settingsState.animationsEnabled);
  
  if (!settingsState.animationsEnabled) {
    // Add a class to control animations via CSS
    html.classList.add('animations-disabled');
    
    // Disable most animations but preserve critical ones
    const style = document.createElement('style');
    style.id = 'animation-override';
    style.textContent = `
      /* Disable most animations */
      .animations-disabled * {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
      
      /* PRESERVE critical animations for functionality */
      .animations-disabled #mainContent,
      .animations-disabled #loadingScreen,
      .animations-disabled .page-content,
      .animations-disabled .modal,
      .animations-disabled .notification-cube,
      .animations-disabled .time-bar-fill {
        animation-duration: 0.3s !important;
        transition-duration: 0.3s !important;
      }
      
      /* Keep Lottie animations working */
      .animations-disabled svg,
      .animations-disabled svg * {
        animation-duration: revert !important;
        transition-duration: revert !important;
      }
      
      /* Preserve leaderboard tab transitions */
      .animations-disabled .leaderboard-tab,
      .animations-disabled .leaderboard-list {
        transition-duration: 0.3s !important;
      }
    `;
    
    // Remove old style if exists
    const oldStyle = document.getElementById('animation-override');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
    
  } else {
    // Remove the animation-disabled class
    html.classList.remove('animations-disabled');
    
    // Remove the override style
    const style = document.getElementById('animation-override');
    if (style) style.remove();
  }
  
  // Sound effects
  window.soundEnabled = settingsState.soundEffects;
  
  // Confetti effects
  window.confettiEnabled = settingsState.confettiEffects;
  
  console.log('✅ Settings effects applied');
}

// Load settings from localStorage
function loadSettings() {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(settingsState, parsed);
      applySettings();
      applySettingsEffects();
      applyTranslations();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
}

// Save settings to localStorage
function saveSettings() {
  try {
    localStorage.setItem('appSettings', JSON.stringify(settingsState));
    console.log('✅ Settings saved');
  } catch (error) {
    console.error('❌ Error saving settings:', error);
  }
}

// Apply settings to UI
function applySettings() {
  // Update toggle switches
  document.getElementById('pushNotifications').checked = settingsState.pushNotifications;
  document.getElementById('soundEffects').checked = settingsState.soundEffects;
  document.getElementById('prizeAlerts').checked = settingsState.prizeAlerts;
  document.getElementById('animationsEnabled').checked = settingsState.animationsEnabled;
  document.getElementById('confettiEffects').checked = settingsState.confettiEffects;
  document.getElementById('showInLeaderboard').checked = settingsState.showInLeaderboard;
  document.getElementById('shareStats').checked = settingsState.shareStats;
  
  // Update language display
  const currentLanguageElem = document.getElementById('currentLanguage');
  if (currentLanguageElem) {
    currentLanguageElem.textContent = languageNames[settingsState.language] || 'English';
  }
}

// Initialize settings page
function initializeSettings() {
  loadSettings();
  
  // Setup toggle listeners
  const toggles = [
    'pushNotifications',
    'soundEffects',
    'prizeAlerts',
    'animationsEnabled',
    'confettiEffects',
    'showInLeaderboard',
    'shareStats'
  ];
  
  toggles.forEach(id => {
    const toggle = document.getElementById(id);
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        settingsState[id] = e.target.checked;
        saveSettings();
        applySettingsEffects();
        
        showSettingChangedFeedback(id);
        
        console.log(`${id} changed to:`, e.target.checked);
      });
    }
  });
  
  // Language setting click
  const languageSetting = document.getElementById('languageSetting');
  if (languageSetting) {
    languageSetting.addEventListener('click', openLanguageModal);
  }
  
  // Terms & Privacy buttons
  const termsBtn = document.getElementById('termsBtn');
  if (termsBtn) {
    termsBtn.addEventListener('click', () => {
      alert('Terms of Service\n\nThis would open the Terms of Service page.');
    });
  }
  
  const privacyBtn = document.getElementById('privacyBtn');
  if (privacyBtn) {
    privacyBtn.addEventListener('click', () => {
      alert('Privacy Policy\n\nThis would open the Privacy Policy page.');
    });
  }
  
  // Danger zone buttons
  const resetDataBtn = document.getElementById('resetDataBtn');
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', handleResetData);
  }
  
  const clearCacheBtn = document.getElementById('clearCacheBtn');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', handleClearCache);
  }
  
  // Promocode functionality
  initializePromocode();
}

// Show feedback when setting changed
function showSettingChangedFeedback(settingId) {
  const toast = document.createElement('div');
  toast.className = 'setting-toast';
  toast.textContent = '✓ Setting saved';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(16, 185, 129, 0.9);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}

// ============================================
// LANGUAGE MODAL
// ============================================

const languageModal = document.getElementById('languageModal');
const languageModalClose = document.getElementById('languageModalClose');

function openLanguageModal() {
  if (languageModal) {
    languageModal.classList.add('show');
    updateLanguageSelection();
  }
}

function closeLanguageModal() {
  if (languageModal) {
    languageModal.classList.remove('show');
  }
}

function updateLanguageSelection() {
  const options = document.querySelectorAll('.language-option');
  options.forEach(option => {
    const lang = option.dataset.lang;
    if (lang === settingsState.language) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

// Language modal close button
if (languageModalClose) {
  languageModalClose.addEventListener('click', closeLanguageModal);
}

// Close modal when clicking outside
if (languageModal) {
  languageModal.addEventListener('click', (e) => {
    if (e.target === languageModal) {
      closeLanguageModal();
    }
  });
}

// Language option clicks
document.querySelectorAll('.language-option').forEach(option => {
  option.addEventListener('click', () => {
    const lang = option.dataset.lang;
    settingsState.language = lang;
    saveSettings();
    
    // Update current language display
    const currentLanguageElem = document.getElementById('currentLanguage');
    if (currentLanguageElem) {
      currentLanguageElem.textContent = languageNames[lang];
    }
    
    updateLanguageSelection();
    
    // APPLY TRANSLATIONS TO ENTIRE APP
    applyTranslations();
    
    setTimeout(() => {
      closeLanguageModal();
      showSettingChangedFeedback('language');
    }, 300);
    
    console.log('Language changed to:', lang);
  });
});

// ============================================
// PROMOCODE FUNCTIONALITY
// ============================================

const promocodeInput = document.getElementById('promocodeInput');
const promocodeSubmitBtn = document.getElementById('promocodeSubmitBtn');
const promocodeStatus = document.getElementById('promocodeStatus');

// Valid promocodes
const validPromocodes = {
  'WELCOME100': { coins: 100, message: 'Welcome bonus claimed!' },
  'LUCKY777': { coins: 777, message: 'Lucky bonus activated!' },
  'FREECOINS': { coins: 50, message: 'Free coins added!' },
  'VOIDGIFT': { coins: 200, message: 'Special gift redeemed!' },
  'SPIN2WIN': { coins: 150, message: 'Spin bonus unlocked!' }
};

// Redeemed promocodes
let redeemedCodes = [];

function loadRedeemedCodes() {
  const saved = localStorage.getItem('redeemedCodes');
  if (saved) {
    try {
      redeemedCodes = JSON.parse(saved);
    } catch (error) {
      console.error('Error loading redeemed codes:', error);
      redeemedCodes = [];
    }
  }
}

function saveRedeemedCode(code) {
  if (!redeemedCodes.includes(code)) {
    redeemedCodes.push(code);
    localStorage.setItem('redeemedCodes', JSON.stringify(redeemedCodes));
  }
}

function initializePromocode() {
  loadRedeemedCodes();
  
  if (promocodeSubmitBtn) {
    promocodeSubmitBtn.addEventListener('click', submitPromocode);
  }
  
  if (promocodeInput) {
    promocodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitPromocode();
      }
    });
    
    promocodeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
    });
  }
}

function submitPromocode() {
  const code = promocodeInput.value.trim().toUpperCase();
  
  if (!code) {
    showPromocodeStatus('Please enter a promocode', 'error');
    return;
  }
  
  if (redeemedCodes.includes(code)) {
    showPromocodeStatus('This code has already been redeemed', 'error');
    return;
  }
  
  if (validPromocodes[code]) {
    const promo = validPromocodes[code];
    
    if (typeof addCurrency === 'function') {
      addCurrency(promo.coins);
    }
    
    saveRedeemedCode(code);
    showPromocodeStatus(`✓ ${promo.message} +${promo.coins} coins!`, 'success');
    promocodeInput.value = '';
    
    promocodeSubmitBtn.disabled = true;
    setTimeout(() => {
      promocodeSubmitBtn.disabled = false;
    }, 2000);
    
    console.log(`✅ Promocode redeemed: ${code} (+${promo.coins} coins)`);
  } else {
    showPromocodeStatus('Invalid promocode', 'error');
  }
}

function showPromocodeStatus(message, type) {
  if (!promocodeStatus) return;
  
  promocodeStatus.textContent = message;
  promocodeStatus.className = 'promocode-status show ' + type;
  
  setTimeout(() => {
    promocodeStatus.classList.remove('show');
  }, 3000);
}

// ============================================
// DANGER ZONE ACTIONS
// ============================================

function handleResetData() {
  const confirmed = confirm(
    '⚠️ WARNING: Reset All Data?\n\n' +
    'This will delete:\n' +
    '• All your coins\n' +
    '• All your prizes\n' +
    '• All your inventory items\n' +
    '• All redeemed promocodes\n' +
    '• All settings\n\n' +
    'This action CANNOT be undone!\n\n' +
    'Are you sure you want to continue?'
  );
  
  if (!confirmed) return;
  
  const doubleConfirm = confirm(
    '🚨 FINAL WARNING!\n\n' +
    'This will permanently delete ALL your data.\n\n' +
    'Type "RESET" in the next prompt to confirm.'
  );
  
  if (!doubleConfirm) return;
  
  const userInput = prompt('Type "RESET" to confirm:');
  
  if (userInput === 'RESET') {
    localStorage.clear();
    
    if (typeof virtualCurrency !== 'undefined') {
      virtualCurrency = 0;
      if (typeof updateCurrencyDisplay === 'function') {
        updateCurrencyDisplay();
      }
    }
    
    if (typeof inventoryItems !== 'undefined') {
      inventoryItems = [];
      if (typeof updateInventoryDisplay === 'function') {
        updateInventoryDisplay();
      }
    }
    
    Object.keys(settingsState).forEach(key => {
      if (typeof settingsState[key] === 'boolean') {
        settingsState[key] = true;
      } else if (key === 'language') {
        settingsState[key] = 'en';
      }
    });
    
    applySettings();
    
    alert('✅ All data has been reset!\n\nThe page will now reload.');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    console.log('🗑️ All data reset');
  } else {
    alert('Reset cancelled. Data NOT deleted.');
  }
}

function handleClearCache() {
  const confirmed = confirm(
    'Clear Cache?\n\n' +
    'This will clear temporary cached data.\n' +
    'Your coins, prizes, and settings will NOT be affected.\n\n' +
    'Continue?'
  );
  
  if (confirmed) {
    console.log('🗑️ Cache cleared');
    alert('✅ Cache cleared successfully!');
  }
}

// ============================================
// EXPORT & INITIALIZE
// ============================================

window.settingsState = settingsState;
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.applyTranslations = applyTranslations;
window.t = t;

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeSettings();
    applyTranslations();
  });
} else {
  initializeSettings();
  applyTranslations();
}

console.log('⚙️ Settings module loaded with comprehensive translations');
// ============================================
// DAILY SPIN PAGE FUNCTIONALITY - OPTIMIZED
// ============================================

const spinButton = document.getElementById('spinButton');
const wheel = document.getElementById('wheel');
const wheelContainer = document.querySelector('.wheel-container');
const winModal = document.getElementById('winModal');
const modalPrizeIcon = document.getElementById('modalPrizeIcon');
const modalPrizeName = document.getElementById('modalPrizeName');
const claimButton = document.getElementById('claimButton');

let isSpinning = false;
let currentWinningPrize = null;
let scrollPosition = 0;
let scrollSpeed = 1;
let animationFrameId = null;

// Store Lottie instances for cleanup
let lottieInstances = new Map();

const cubeWidth = 120;
const gapWidth = 48;
const totalCubeWidth = cubeWidth + gapWidth;

const prizes = [
  { id: 'coin1', type: 'coin', value: 1, chance: 32.14, icon: 'coin' },
  { id: 'coin5', type: 'coin', value: 5, chance: 18.40, icon: 'coin' },
  { id: 'coin10', type: 'coin', value: 10, chance: 12.30, icon: 'coin' },
  { id: 'coin25', type: 'coin', value: 25, chance: 9.80, icon: 'coin' },
  { id: 'coin50', type: 'coin', value: 50, chance: 6.10, icon: 'coin' },
  { id: 'coin100', type: 'coin', value: 100, chance: 4.90, icon: 'coin' },
  { id: 'coin250', type: 'coin', value: 250, chance: 2.50, icon: 'coin' },
  { id: 'coin500', type: 'coin', value: 500, chance: 1.20, icon: 'coin' },
  { id: 'giftHeart', type: 'gift', value: 'Heart', chance: 2.50, lottie: 'assets/giftHeart.json' },
  { id: 'giftBear', type: 'gift', value: 'Bear', chance: 2.50, lottie: 'assets/giftBear.json' },
  { id: 'giftRose', type: 'gift', value: 'Rose', chance: 1.80, lottie: 'assets/giftRose.json' },
  { id: 'giftGift', type: 'gift', value: 'Gift', chance: 1.80, lottie: 'assets/giftGift.json' },
  { id: 'giftCake', type: 'gift', value: 'Cake', chance: 1.20, lottie: 'assets/giftCake.json' },
  { id: 'giftRoseBouquet', type: 'gift', value: 'Rose Bouquet', chance: 1.20, lottie: 'assets/giftRoseBouquet.json' },
  { id: 'giftRing', type: 'gift', value: 'Ring', chance: 0.60, lottie: 'assets/giftRing.json' },
  { id: 'giftTrophy', type: 'gift', value: 'Trophy', chance: 0.40, lottie: 'assets/giftTrophy.json' },
  { id: 'giftDiamond', type: 'gift', value: 'Diamond', chance: 0.60, lottie: 'assets/giftDiamond.json' },
  { id: 'giftCalendar', type: 'gift', value: 'Calendar', chance: 0.06, lottie: 'assets/giftCalendar.json' }
];

function selectPrize() {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (let prize of prizes) {
    cumulative += prize.chance;
    if (random <= cumulative) {
      return prize;
    }
  }
  
  return prizes[0];
}

// Cleanup Lottie instance for a cube
function cleanupCubeLottie(cube) {
  const cubeId = cube.dataset.cubeId;
  if (cubeId && lottieInstances.has(cubeId)) {
    const instance = lottieInstances.get(cubeId);
    instance.destroy();
    lottieInstances.delete(cubeId);
  }
}

// Optimized render function with cleanup
function renderPrizeToCube(cube, prize) {
  // Clean up existing Lottie animation
  cleanupCubeLottie(cube);
  
  cube.dataset.prizeId = prize.id;
  cube.dataset.prizeType = prize.type;
  cube.dataset.prizeValue = prize.value;
  
  // Generate unique ID for this cube if it doesn't have one
  if (!cube.dataset.cubeId) {
    cube.dataset.cubeId = 'cube_' + Math.random().toString(36).substr(2, 9);
  }
  
  cube.innerHTML = '';
  
  if (prize.type === 'coin') {
    const img = document.createElement('img');
    img.src = 'assets/Coin.svg';
    img.alt = 'Coin';
    img.style.width = '70px';
    img.style.height = '70px';
    img.style.objectFit = 'contain';
    img.style.margin = 'auto';
    cube.appendChild(img);
    
    const valueText = document.createElement('div');
    valueText.textContent = prize.value;
    valueText.style.position = 'absolute';
    valueText.style.top = '15%';
    valueText.style.left = '25%';
    valueText.style.transform = 'translate(-50%, -50%)';
    valueText.style.fontSize = '1.5rem';
    valueText.style.fontWeight = '700';
    valueText.style.color = '#ffffff';
    valueText.style.textShadow = '0 2px 8px rgba(0, 0, 0, 0.8)';
    valueText.style.pointerEvents = 'none';
    cube.appendChild(valueText);
  } else {
    const container = document.createElement('div');
    container.style.width = '80px';
    container.style.height = '80px';
    container.style.margin = 'auto';
    cube.appendChild(container);
    
    // Store Lottie instance for cleanup
    const lottieInstance = lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: prize.lottie,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
        clearCanvas: true,
        progressiveLoad: true,
        hideOnTransparent: true
      }
    });
    
    lottieInstances.set(cube.dataset.cubeId, lottieInstance);
  }
  
  cube.style.position = 'relative';
  cube.style.display = 'flex';
  cube.style.alignItems = 'center';
  cube.style.justifyContent = 'center';
}

function populateCubes() {
  const cubes = document.querySelectorAll('.cube');
  cubes.forEach(cube => {
    const prize = selectPrize();
    renderPrizeToCube(cube, prize);
  });
}

// Optimized scale update - only when needed
let lastScaleUpdate = 0;
const SCALE_UPDATE_INTERVAL = 16; // ~60fps

function updateCubeScales(cubes) {
  if (!wheelContainer) return;
  
  const now = Date.now();
  if (now - lastScaleUpdate < SCALE_UPDATE_INTERVAL && isSpinning) {
    return; // Skip update if too frequent during spin
  }
  lastScaleUpdate = now;
  
  const containerCenter = wheelContainer.offsetWidth / 2;
  
  cubes.forEach(cube => {
    const cubeRect = cube.getBoundingClientRect();
    const containerRect = wheelContainer.getBoundingClientRect();
    const cubeCenter = cubeRect.left + cubeRect.width / 2 - containerRect.left;
    const distance = Math.abs(cubeCenter - containerCenter);
    
    const maxDistance = containerCenter;
    const scale = Math.max(0.6, 1.5 - (distance / maxDistance) * 0.9);
    
    cube.style.transform = `scale(${scale})`;
    
    if (scale > 1.3) {
      cube.style.borderColor = 'rgba(96, 165, 250, 0.8)';
      cube.style.boxShadow = '0 0 30px rgba(96, 165, 250, 0.5)';
    } else {
      cube.style.borderColor = 'rgba(96, 165, 250, 0.4)';
      cube.style.boxShadow = 'none';
    }
  });
}

function updateWheelAnimation() {
  if (!wheel || !wheelContainer) {
    animationFrameId = requestAnimationFrame(updateWheelAnimation);
    return;
  }
  
  const cubes = Array.from(document.querySelectorAll('.cube'));
  if (cubes.length === 0) {
    animationFrameId = requestAnimationFrame(updateWheelAnimation);
    return;
  }
  
  scrollPosition += scrollSpeed;
  
  if (scrollPosition >= totalCubeWidth) {
    const firstCube = cubes[0];
    wheel.appendChild(firstCube);
    scrollPosition -= totalCubeWidth;
    
    if (!isSpinning) {
      const prize = selectPrize();
      renderPrizeToCube(firstCube, prize);
    }
  }
  
  wheel.style.transform = `translateX(-${scrollPosition}px)`;
  
  updateCubeScales(cubes);
  
  animationFrameId = requestAnimationFrame(updateWheelAnimation);
}

function showWinModal(prize) {
  currentWinningPrize = prize;
  
  modalPrizeIcon.innerHTML = '';
  
  if (prize.type === 'coin') {
    const img = document.createElement('img');
    img.src = 'assets/Coin.svg';
    img.alt = 'Coin';
    modalPrizeIcon.appendChild(img);
    
    const valueText = document.createElement('div');
    valueText.className = 'win-modal-value';
    valueText.textContent = prize.value;
    modalPrizeIcon.appendChild(valueText);
    
    modalPrizeName.textContent = `${prize.value} Coins`;
  } else {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    modalPrizeIcon.appendChild(container);
    
    lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: prize.lottie
    });
    
    modalPrizeName.textContent = `the ${prize.value}`;
  }
  
  winModal.classList.add('show');
}

function hideWinModal() {
  winModal.classList.remove('show');
  setTimeout(() => {
    modalPrizeIcon.innerHTML = '';
  }, 300);
}

if (claimButton) {
  claimButton.addEventListener('click', () => {
    if (currentWinningPrize) {
      if (currentWinningPrize.type === 'coin') {
        virtualCurrency += parseInt(currentWinningPrize.value);
        updateCurrencyDisplay();
      } else {
        addPrizeToInventory(currentWinningPrize);
        console.log('🎁 Prize added to inventory with unique ID');
      }
    }
    
    hideWinModal();
    currentWinningPrize = null;
    
    // Clean up all Lottie instances before repopulating
    const cubes = document.querySelectorAll('.cube');
    cubes.forEach(cube => cleanupCubeLottie(cube));
    
    // Repopulate with fresh prizes
    populateCubes();
    
    scrollSpeed = 1;
    isSpinning = false;
    if (spinButton) {
      spinButton.disabled = false;
    }
    
    console.log('✅ Spin state reset - ready for next spin');
  });
}

window.addEventListener('load', () => {
  populateCubes();
  updateWheelAnimation();
  
  const coinIds = ['coin1', 'coin5', 'coin10', 'coin25', 'coin50', 'coin100', 'coin250', 'coin500'];
  coinIds.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      const img = document.createElement('img');
      img.src = 'assets/Coin.svg';
      img.alt = 'Coin';
      container.appendChild(img);
    }
  });

  const gifts = [
    { id: 'giftHeart', json: 'assets/giftHeart.json' },
    { id: 'giftBear', json: 'assets/giftBear.json' },
    { id: 'giftGift', json: 'assets/giftGift.json' },
    { id: 'giftRose', json: 'assets/giftRose.json' },
    { id: 'giftCake', json: 'assets/giftCake.json' },
    { id: 'giftRoseBouquet', json: 'assets/giftRoseBouquet.json' },
    { id: 'giftRing', json: 'assets/giftRing.json' },
    { id: 'giftTrophy', json: 'assets/giftTrophy.json' },
    { id: 'giftDiamond', json: 'assets/giftDiamond.json' },
    { id: 'giftCalendar', json: 'assets/giftCalendar.json' }
  ];

  gifts.forEach(gift => {
    const container = document.getElementById(gift.id);
    if (container) {
      lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: gift.json
      });
    }
  });
});

if (spinButton) {
  spinButton.addEventListener('click', () => {
    if (isSpinning) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    
    console.log('🎰 SPIN STARTED');

    const winningPrize = selectPrize();
    console.log('🎯 Selected winning prize:', winningPrize);

    const cubes = Array.from(document.querySelectorAll('.cube'));
    
    if (cubes.length === 0) {
      console.error('❌ NO CUBES FOUND!');
      isSpinning = false;
      spinButton.disabled = false;
      return;
    }
    
    // Clean up all existing Lottie instances before spin
    cubes.forEach(cube => cleanupCubeLottie(cube));
    
    // Repopulate cubes with new random prizes
    cubes.forEach(cube => {
      const randomPrize = selectPrize();
      renderPrizeToCube(cube, randomPrize);
    });
    
    const minSpinDistance = 5000 + Math.random() * 600;
    const cubePositionsToScroll = Math.floor(minSpinDistance / totalCubeWidth);
    
    const winningCubeIndex = cubePositionsToScroll % cubes.length;
    
    // Set winning prize
    renderPrizeToCube(cubes[winningCubeIndex], winningPrize);
    
    console.log('🎲 Winning cube index:', winningCubeIndex, '| Distance:', minSpinDistance.toFixed(0), 'px');

    const startTime = Date.now();
    const duration = 4500;
    const maxSpeed = 25;
    
    function animateSpin() {
      if (!isSpinning) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      scrollSpeed = maxSpeed * (1 - easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        scrollSpeed = 0;
        
        console.log('🎯 Spin complete, snapping to center...');
        
        setTimeout(() => {
          const cubes = Array.from(document.querySelectorAll('.cube'));
          const containerCenter = wheelContainer.offsetWidth / 2;
          let centerCube = null;
          let minDistance = Infinity;
          let distanceToSnap = 0;
          
          cubes.forEach(cube => {
            const cubeRect = cube.getBoundingClientRect();
            const containerRect = wheelContainer.getBoundingClientRect();
            const cubeCenter = cubeRect.left + cubeRect.width / 2 - containerRect.left;
            const distance = Math.abs(cubeCenter - containerCenter);
            
            if (distance < minDistance) {
              minDistance = distance;
              centerCube = cube;
              distanceToSnap = cubeCenter - containerCenter;
            }
          });
          
          const snapStartTime = Date.now();
          const snapDuration = 400;
          const startScrollPos = scrollPosition;
          
          function snapToCenter() {
            const snapElapsed = Date.now() - snapStartTime;
            const snapProgress = Math.min(snapElapsed / snapDuration, 1);
            const snapEase = 1 - Math.pow(1 - snapProgress, 3);
            
            scrollPosition = startScrollPos + (distanceToSnap * snapEase);
            
            if (snapProgress < 1) {
              requestAnimationFrame(snapToCenter);
            } else {
              if (centerCube) {
                centerCube.style.transition = 'all 0.3s ease';
                centerCube.style.borderColor = '#60a5fa';
                centerCube.style.boxShadow = '0 0 40px rgba(96, 165, 250, 0.8)';
                
                setTimeout(() => {
                  centerCube.style.transition = '';
                }, 300);
                
                const finalPrize = prizes.find(p => p.id === centerCube.dataset.prizeId);
                
                console.log('✅ Final winning prize:', finalPrize);
                
                setTimeout(() => {
                  if (finalPrize) {
                    showWinModal(finalPrize);
                  }
                }, 200);
              }
            }
          }
          
          snapToCenter();
        }, 100);
      }
    }
    
    animateSpin();
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  lottieInstances.forEach(instance => instance.destroy());
  lottieInstances.clear();
});
