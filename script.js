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
  if (!currentModalPrize) return;
  
  const prizeId = currentModalPrize.prizeId;
  const prizeName = currentModalPrize.value;
  
  const claimData = {
    action: 'claim_prize',
    message: `DEBUG:Prize CLAIMED! ID:${prizeId}`,
    prizeId: prizeId,
    prizeName: prizeName,
    timestamp: Date.now()
  };
  
  if (typeof sendDataToBot === 'function') {
    sendDataToBot(claimData);
  }
  
  console.log('📤 Claim request sent to bot:', claimData);
  
  removePrizeFromInventory(prizeId);
  closePrizeModal();
  
  if (typeof tg !== 'undefined' && tg.openTelegramLink) {
    const botUsername = 'YourBotUsername'; // CHANGE THIS
    const botUrl = `https://t.me/${botUsername}`;
    
    try {
      tg.openTelegramLink(botUrl);
      console.log('✅ Opened Telegram bot:', botUrl);
    } catch (error) {
      console.error('❌ Error opening bot:', error);
    }
  }
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

document.querySelector('.content-box-left-1').addEventListener('click', () => {
  navigateToPage('dailyspin');
});

document.querySelector('.content-box-right').addEventListener('click', () => {
  alert('Inventory clicked!');
});

document.querySelector('.content-box-bottom-1').addEventListener('click', () => {
  alert('Projects clicked!');
});

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
// DAILY SPIN PAGE FUNCTIONALITY
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

function renderPrizeToCube(cube, prize) {
  cube.dataset.prizeId = prize.id;
  cube.dataset.prizeType = prize.type;
  cube.dataset.prizeValue = prize.value;
  
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
    
    lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: prize.lottie
    });
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

function updateCubeScales(cubes) {
  if (!wheelContainer) return;
  
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
    
    cubes.forEach(cube => {
      const randomPrize = selectPrize();
      renderPrizeToCube(cube, randomPrize);
    });
    
    const minSpinDistance = 5000 + Math.random() * 600;
    const cubePositionsToScroll = Math.floor(minSpinDistance / totalCubeWidth);
    
    const winningCubeIndex = cubePositionsToScroll % cubes.length;
    
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
