// ============================================
// TELEGRAM WEB APP - COMPLETE GAME SYSTEM
// ============================================
// Version: 2.0
// Author: Your Team
// Description: Complete Telegram mini-app with spin wheel, inventory, 
//              leaderboard, settings, and prize management

'use strict';

// ============================================
// GLOBAL CONFIGURATION
// ============================================

const CONFIG = {
  MAX_INVENTORY_DISPLAY: 6,
  MAX_NOTIFICATIONS: 15,
  MAX_LIVE_NOTIFICATIONS: 15,
  NOTIFICATION_DURATION: 25000,
  LOADING_MIN_TIME: 2000,
  SPIN_DURATION: 4500,
  SPIN_MAX_SPEED: 25,
  CUBE_WIDTH: 120,
  GAP_WIDTH: 48,
  BALANCE_SYNC_INTERVAL: 30000
};

const PRIZE_COIN_VALUES = {
  'Heart': 15,
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

const RARE_GIFTS = ['Ring', 'Trophy', 'Diamond', 'Calendar'];
const NFT_GIFTS = ['Calendar'];

// UPDATED: Star prizes instead of coins
const SPIN_PRIZES = [
  { id: 'star1', type: 'star', value: 1, chance: 32.14, icon: 'star' },
  { id: 'star5', type: 'star', value: 5, chance: 18.40, icon: 'star' },
  { id: 'star10', type: 'star', value: 10, chance: 12.30, icon: 'star' },
  { id: 'star25', type: 'star', value: 25, chance: 9.80, icon: 'star' },
  { id: 'star50', type: 'star', value: 50, chance: 6.10, icon: 'star' },
  { id: 'star100', type: 'star', value: 100, chance: 4.90, icon: 'star' },
  { id: 'star250', type: 'star', value: 250, chance: 2.50, icon: 'star' },
  { id: 'star500', type: 'star', value: 500, chance: 1.20, icon: 'star' },
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

const VALID_PROMOCODES = {
  'WELCOME100': { coins: 100, message: 'Welcome bonus claimed!' },
  'LUCKY777': { coins: 777, message: 'Lucky bonus activated!' },
  'FREECOINS': { coins: 50, message: 'Free coins added!' },
  'VOIDGIFT': { coins: 200, message: 'Special gift redeemed!' },
  'SPIN2WIN': { coins: 150, message: 'Spin bonus unlocked!' }
};

// ============================================
// DEPOSIT CONFIGURATION
// ============================================

const DEPOSIT_PACKAGES = {
  stars: [
    { id: 'package_tiny', amount: 1, stars: 1, popular: false },
    { id: 'package_mini', amount: 25, stars: 25, popular: false },
    { id: 'package_small', amount: 50, stars: 50, popular: false },
    { id: 'package_bit', amount: 75, stars: 75, popular: true },
    { id: 'package_medium', amount: 100, stars: 100, popular: false },
    { id: 'package_biggermedium', amount: 250, stars: 250, popular: false },
    { id: 'package_moderate', amount: 500, stars: 500, popular: false },
    { id: 'package_large', amount: 750, stars: 750, popular: false },
    { id: 'package_superlarge', amount: 1000, stars: 1000, popular: false },
    { id: 'package_huge', amount: 2500, stars: 2500, popular: false },
    { id: 'package_xlsize', amount: 5000, stars: 5000, popular: true },
    { id: 'package_mega', amount: 7500, stars: 7500, popular: false },
    { id: 'package_giant', amount: 10000, stars: 10000, popular: false }
  ]
};
// ============================================
// GLOBAL STATE
// ============================================

const STATE = {
  // Telegram
  tg: window.Telegram?.WebApp || null,
  userData: null,
  
  // Game
  currentPage: 'home',
  userStars: 0,
  inventoryItems: [],
  
  // Notifications
  notifications: [],
  liveGiftNotifications: [],
  
  // Spin wheel
  isSpinning: false,
  currentWinningPrize: null,
  scrollPosition: 0,
  scrollSpeed: 1,
  animationFrameId: null,
  lottieInstances: new Map(),
  lastScaleUpdate: 0,
  
  // Leaderboard
  currentLeaderboardTab: 'stars',
  leaderboardData: {
    stars: [
      { id: 1, name: 'CryptoKing', username: 'cryptoking', stars: 15420, avatar: null },
      { id: 2, name: 'MoonWalker', username: 'moonwalker', stars: 12850, avatar: null },
      { id: 3, name: 'DiamondHands', username: 'diamondhands', stars: 10370, avatar: null },
      { id: 4, name: 'TokenMaster', username: 'tokenmaster', stars: 8920, avatar: null },
      { id: 5, name: 'BlockChainer', username: 'blockchainer', stars: 7540, avatar: null },
      { id: 6, name: 'NFT Hunter', username: 'nfthunter', stars: 6230, avatar: null },
      { id: 7, name: 'Satoshi Fan', username: 'satoshifan', stars: 5180, avatar: null },
      { id: 8, name: 'Whale Watcher', username: 'whalewatcher', stars: 4560, avatar: null },
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
  },
  settings: {
    language: 'en',
    pushNotifications: true,
    soundEffects: true,
    prizeAlerts: true,
    animationsEnabled: true,
    confettiEffects: true,
    showInLeaderboard: true,
    shareStats: true
  },
  currentDepositTab: 'stars',
  currentModalPrize: null,
  currentFilter: 'all',
  redeemedCodes: [],
  isSyncing: false,
  lastBalanceSync: null,
  syncIntervalId: null
};

// ============================================
// TRANSLATIONS
// ============================================

const TRANSLATIONS = {
  en: {
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
    home: 'Home',
    leaderboard: 'Leaderboard',
    deposit: 'Deposit',
    dailyGift: 'Daily',
    bagOfLoot: 'Bag of Loot!',
    dailyGiftSubtitle: 'Daily gift from us!',
    inventory: 'Inventory',
    yourCollectedItems: 'Your collected items',
    viewAllItems: 'View All Items',
    projects: 'Projects',
    contact: 'Contact',
    topPlayers: 'Top Players',
    coins: 'Coins',
    gifts: 'Gifts',
    yourRank: 'Your Rank',
    spinToWin: 'Spin to Win',
    spinWheel: 'SPIN THE WHEEL',
    congratulations: 'Congratulations!',
    youWon: 'You won',
    claimPrize: 'Claim Prize',
    convertToStars: 'Convert To Stars',
    claim: 'Claim',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    dangerZone: 'Danger Zone',
    resetAllData: 'Reset All Data',
    resetDataDesc: 'Delete all your coins, prizes, and settings',
    clearCache: 'Clear Cache',
    clearCacheDesc: 'Clear temporary cached data',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save'
  },
  ru: {
    settings: 'Настройки',
    customizeExperience: 'Настройте свой опыт',
    home: 'Главная',
    leaderboard: 'Таблица лидеров',
    deposit: 'Депозит',
    coins: 'Монеты',
    gifts: 'Подарки',
    // Add more Russian translations as needed
  },
  es: {
    settings: 'Configuración',
    customizeExperience: 'Personaliza tu experiencia',
    home: 'Inicio',
    leaderboard: 'Tabla de clasificación',
    deposit: 'Depósito',
    coins: 'Monedas',
    gifts: 'Regalos',
    // Add more Spanish translations as needed
  }
};

const LANGUAGE_NAMES = {
  'en': 'English',
  'ru': 'Русский',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'zh': '中文'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
  // Generate unique prize ID
  generatePrizeId() {
    const fourDigits = Math.floor(1000 + Math.random() * 9000);
    const twoDigits = Math.floor(10 + Math.random() * 90);
    const threeLetters = Array.from({length: 3}, () => 
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    return `${fourDigits}-${twoDigits}-${threeLetters}`;
  },
  
  // Translation helper
  t(key) {
    const lang = STATE.settings.language;
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
  },

  // Create error icon SVG
  createErrorIcon() {
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
  },
  
  // Viewport height fix for mobile
  setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  },
  
  // Show toast notification
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'setting-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
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
    setTimeout(() => toast.style.opacity = '1', 10);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
};

// Standalone helpers (outside Utils)
function isOpenInvoiceSupported() {
  return STATE.tg && typeof STATE.tg.openInvoice === 'function';
}

function showPaymentUnsupportedError() {
  if (STATE.tg && STATE.tg.showPopup) {
    STATE.tg.showPopup({
      title: '⚠️ Update Required',
      message: 'Please update your Telegram app to the latest version to use in-app payments.',
      buttons: [{ type: 'close' }]
    });
  } else {
    alert('Please update your Telegram app to use payments.');
  }
}

const BackendAPI = {
  isCloudStorageAvailable() {
    return STATE.tg && 
           STATE.tg.CloudStorage && 
           typeof STATE.tg.CloudStorage.getItem === 'function';
  },

  async getUserBalance() {
    if (this.isCloudStorageAvailable()) {
      return new Promise((resolve) => {
        STATE.tg.CloudStorage.getItem('userStars', (error, value) => {
          if (error) {
            console.warn('⚠️ CloudStorage error, using localStorage:', error);
            const fallback = localStorage.getItem('userStars');
            resolve(fallback ? parseInt(fallback) : STATE.userStars);
          } else {
            const balance = value ? parseInt(value) : STATE.userStars;
            console.log('📖 Stars from CloudStorage:', balance);
            resolve(balance);
          }
        });
      });
    }
    
    console.log('📖 Using localStorage (CloudStorage unavailable)');
    const saved = localStorage.getItem('userStars');
    return saved ? parseInt(saved) : STATE.userStars;
  },
  
  async saveUserBalance(balance) {
    let cloudSaved = false;
    
    if (this.isCloudStorageAvailable()) {
      cloudSaved = await new Promise((resolve) => {
        STATE.tg.CloudStorage.setItem('userStars', balance.toString(), (error, success) => {
          if (error) {
            console.warn('⚠️ CloudStorage save failed:', error);
            resolve(false);
          } else {
            console.log('💾 Stars saved to CloudStorage:', balance);
            resolve(true);
          }
        });
      });
    }
    
    try {
      localStorage.setItem('userStars', balance.toString());
      console.log('💾 Stars saved to localStorage:', balance);
      return true;
    } catch (error) {
      console.error('❌ localStorage save failed:', error);
      return cloudSaved;
    }
  },
  
  async syncBalance() {
    if (STATE.isSyncing) return;
    
    STATE.isSyncing = true;
    const balance = await this.getUserBalance();
    
    if (balance !== STATE.userStars) {
      const oldBalance = STATE.userStars;
      STATE.userStars = balance;
      Currency.update();
      console.log(`⭐ Balance synced: ${oldBalance} → ${balance}`);
    }
    
    STATE.lastBalanceSync = Date.now();
    STATE.isSyncing = false;
  },
  
  startPeriodicSync() {
    this.syncBalance();
    
    if (this.isCloudStorageAvailable()) {
      console.log('✅ Using Telegram CloudStorage');
    } else {
      console.log('✅ Using localStorage (CloudStorage not available)');
    }
    
    if (STATE.syncIntervalId) {
      clearInterval(STATE.syncIntervalId);
    }
    
    STATE.syncIntervalId = setInterval(() => {
      this.syncBalance();
    }, CONFIG.BALANCE_SYNC_INTERVAL);
    
    console.log('✅ Periodic sync started (every 30s)');
  },
  
  stopPeriodicSync() {
    if (STATE.syncIntervalId) {
      clearInterval(STATE.syncIntervalId);
      STATE.syncIntervalId = null;
      console.log('🛑 Periodic sync stopped');
    }
  }
};

// ============================================
// TELEGRAM WEB APP INITIALIZATION
// ============================================

const TelegramApp = {
  init() {
    console.log('🔧 Initializing Telegram WebApp...');
    
    if (STATE.tg) {
      console.log('✅ Telegram WebApp available');
      
      if (STATE.tg.initDataUnsafe?.user) {
        STATE.userData = STATE.tg.initDataUnsafe.user;
        this.updateUserProfile(STATE.userData);
        console.log('👤 User:', STATE.userData);
      }
      
      this.setupPaymentHandlers();
      this.applyTheme();
      
      STATE.tg.ready();
      STATE.tg.expand();
      
      // ADDED: Start balance sync
      BackendAPI.startPeriodicSync();
      
    } else {
      console.warn('⚠️ Telegram WebApp not available - running in fallback mode');
      this.initFallbackMode();
    }
  },

 setupPaymentHandlers() {
  if (!STATE.tg) return;
  
  console.log('✅ Payment handlers initialized');
  console.log('📱 Using openInvoice() for direct invoice popup');
  console.log('🔗 Invoice will open IN Mini App - NO chat redirect!');
  
  // Check if openInvoice is available
  if (typeof STATE.tg.openInvoice !== 'function') {
    console.warn('⚠️ openInvoice() not available in this Telegram version');
    console.warn('⚠️ User may need to update their Telegram app');
  } else {
    console.log('✅ openInvoice() is available and ready!');
  }
  
  // Listen for when user returns to app (after payment)
  STATE.tg.onEvent('viewportChanged', (event) => {
    if (event.isStateStable) {
      console.log('✅ User returned to app - syncing balance...');
      setTimeout(() => {
        BackendAPI.syncBalance();
      }, 1000);
    }
  });
  
  // Listen for theme changes
  STATE.tg.onEvent('themeChanged', () => {
    console.log('🎨 Theme changed - may indicate payment completion');
    setTimeout(() => {
      BackendAPI.syncBalance();
    }, 1000);
  });
},
  
initFallbackMode() {
  this.updateUserProfile({
    first_name: 'Test User',
    username: 'testuser',
    photo_url: null
  });
},
  
  updateUserProfile(user) {
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
  },
  
  applyTheme() {
    if (STATE.tg && STATE.tg.themeParams) {
      document.documentElement.style.setProperty(
        '--tg-theme-bg-color', 
        STATE.tg.themeParams.bg_color || '#0f172a'
      );
      document.documentElement.style.setProperty(
        '--tg-theme-text-color', 
        STATE.tg.themeParams.text_color || '#ffffff'
      );
    }
  },
  
  sendData(data) {
    if (STATE.tg && STATE.tg.sendData) {
      try {
        STATE.tg.sendData(JSON.stringify(data));
        console.log('📤 Data sent to bot:', data);
        return true;
      } catch (error) {
        console.error('❌ Error sending data:', error);
        return false;
      }
    }
    return false;
  }
};


// ============================================
// LOADING SCREEN
// ============================================

const LoadingScreen = {
  loadingAnimation: null,
  
  init() {
    document.addEventListener('touchmove', function(e) {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    
    window.addEventListener('orientationchange', function() {
      document.body.style.display = 'none';
      document.body.offsetHeight;
      document.body.style.display = '';
    });
    
    Utils.setVH();
    window.addEventListener('resize', Utils.setVH);
    window.addEventListener('orientationchange', Utils.setVH);
    
    if (typeof lottie !== 'undefined') {
      this.initAnimation();
      this.startLoading();
    } else {
      setTimeout(() => this.init(), 100);
    }
  },
  
  initAnimation() {
    const container = document.getElementById('lottie-loading-container');
    if (container) {
      this.loadingAnimation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/dev_duck--@DMJ_Stickers.json'
      });
    }
  },
  
  startLoading() {
    const startTime = Date.now();
    
    const checkComplete = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, CONFIG.LOADING_MIN_TIME - elapsed);
      
      setTimeout(() => this.hide(), remaining);
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkComplete);
    } else {
      checkComplete();
    }
  },
  
  hide() {
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
};

// ============================================
// CURRENCY MANAGEMENT
// ============================================

const Currency = {
  add(amount) {
    const oldValue = STATE.userStars;
    const newValue = STATE.userStars + amount;
    this.animateChange(oldValue, newValue);
    
    // Save to cloud storage
    BackendAPI.saveUserBalance(newValue);
  },
  
  animateChange(oldValue, newValue, duration = 1000) {
    const currencyAmount = document.getElementById('currencyAmount');
    if (!currencyAmount) return;
    
    const start = performance.now();
    const difference = newValue - oldValue;

    const update = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(oldValue + (difference * easeOutCubic));
      
      currencyAmount.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        STATE.userStars = newValue;
        currencyAmount.textContent = newValue.toLocaleString();
        Leaderboard.updateData();
      }
    };
    
    requestAnimationFrame(update);
  },
  
  update() {
    const currencyAmount = document.getElementById('currencyAmount');
    if (currencyAmount) {
      currencyAmount.textContent = STATE.userStars.toLocaleString();
    }
  }
};
// ============================================
// INVENTORY SYSTEM
// ============================================

const Inventory = {
  add(prize) {
    const prizeWithId = {
      ...prize,
      prizeId: Utils.generatePrizeId(),
      claimedAt: Date.now()
    };
    
    STATE.inventoryItems.push(prizeWithId);
    this.updateDisplay();
    
    // Update full inventory modal if it's open
    const modal = document.getElementById('fullInventoryModal');
    if (modal && modal.classList.contains('show')) {
      FullInventoryModal.updateStats();
      FullInventoryModal.render(STATE.currentFilter);
    }
    
    console.log('✅ Prize added:', prizeWithId);
    return prizeWithId;
  },
  
  remove(prizeId) {
    const index = STATE.inventoryItems.findIndex(item => item.prizeId === prizeId);
    
    if (index !== -1) {
      const removed = STATE.inventoryItems.splice(index, 1)[0];
      this.updateDisplay();
      
      // Update full inventory modal if it's open
      const modal = document.getElementById('fullInventoryModal');
      if (modal && modal.classList.contains('show')) {
        FullInventoryModal.updateStats();
        FullInventoryModal.render(STATE.currentFilter);
      }
      
      console.log('🗑️ Prize removed:', removed);
      return removed;
    }
    
    return null;
  },
  
  updateDisplay() {
    const inventoryGrid = document.querySelector('.inventory-grid');
    if (!inventoryGrid) return;
    
    inventoryGrid.innerHTML = '';
    
    const displayItems = STATE.inventoryItems.slice(0, CONFIG.MAX_INVENTORY_DISPLAY);
    
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
      
      // FIXED: Open prize modal instead of full inventory
      itemDiv.addEventListener('click', () => PrizeModal.open(item));
      
      inventoryGrid.appendChild(itemDiv);
    });
    
    const emptySlots = CONFIG.MAX_INVENTORY_DISPLAY - displayItems.length;
    for (let i = 0; i < emptySlots; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'inventory-item empty';
      inventoryGrid.appendChild(emptyDiv);
    }
    
    Leaderboard.updateData();
  },
  
  getItems() {
    return STATE.inventoryItems.map(item => ({
      prizeId: item.prizeId,
      prizeName: item.value,
      prizeType: item.type,
      claimedAt: item.claimedAt
    }));
  },
  
  verify(prizeId) {
    return STATE.inventoryItems.some(item => item.prizeId === prizeId);
  }
};

// ============================================
// PRIZE MODAL
// ============================================

const PrizeModal = {
  open(prize) {
    STATE.currentModalPrize = prize;
    
    const modal = document.getElementById('prizeModal');
    const icon = document.getElementById('prizeModalIcon');
    const name = document.getElementById('prizeModalName');
    const id = document.getElementById('prizeModalId');
    const coinValue = document.getElementById('prizeModalCoinValue');
    
    if (!modal || !icon || !name || !id || !coinValue) return;
    
    icon.innerHTML = '';
    
    if (prize.lottie) {
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      icon.appendChild(container);
      
      lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: prize.lottie
      });
    }
    
    name.textContent = prize.value;
    id.textContent = `ID: ${prize.prizeId}`;
    
    const value = PRIZE_COIN_VALUES[prize.value] || 50;
    coinValue.innerHTML = `
      <img src="assets/TStars.svg" alt="Stars">
      <span>${value.toLocaleString()} Stars</span>
    `;
    
    modal.classList.add('show');
  },
  
  close() {
    const modal = document.getElementById('prizeModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        const icon = document.getElementById('prizeModalIcon');
        if (icon) icon.innerHTML = '';
        STATE.currentModalPrize = null;
      }, 300);
    }
  },
  
  convert() {
    if (!STATE.currentModalPrize) return;
    
    const coinValue = PRIZE_COIN_VALUES[STATE.currentModalPrize.value] || 50;
    Currency.add(coinValue);
    Inventory.remove(STATE.currentModalPrize.prizeId);
    this.close();
    
    console.log(`⭐ Converted ${STATE.currentModalPrize.value} to ${coinValue} stars`);
  },
  
  claim() {
    if (!STATE.currentModalPrize) {
      console.error('❌ No prize selected');
      return;
    }
    
    const prizeId = STATE.currentModalPrize.prizeId;
    const prizeName = STATE.currentModalPrize.value;
    
    console.log('🎁 Claiming prize:', prizeId, prizeName);
    
    const claimData = {
      action: 'claim_prize',
      prizeId: prizeId,
      prizeName: prizeName,
      timestamp: Date.now()
    };
    
    if (!STATE.tg) {
      alert(`Prize Claimed!\n\nPrize: ${prizeName}\nID: ${prizeId}\n\n(Browser mode - would send to bot)`);
      Inventory.remove(prizeId);
      this.close();
      return;
    }
    
    const success = TelegramApp.sendData(claimData);
    
    if (success) {
      alert(`Prize sent to bot!\n\nPrize: ${prizeName}\nID: ${prizeId}`);
      Inventory.remove(prizeId);
      this.close();
    } else {
      alert('Error sending to bot. Please try again.');
    }
  }
};

// ============================================
// NAVIGATION SYSTEM
// ============================================

const Navigation = {
  init() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = link.dataset.page;
        this.navigateTo(pageName);
        
        const navMenu = document.getElementById('navMenu');
        if (navMenu && navMenu.classList.contains('active')) {
          Menu.toggle();
        }
      });
    });
    
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'home';
      this.navigateTo(hash);
    });
    
    window.addEventListener('load', () => {
      const hash = window.location.hash.slice(1) || 'home';
      this.navigateTo(hash);
    });
  },
  
  navigateTo(pageName) {
    document.querySelectorAll('.page-content').forEach(page => {
      page.classList.remove('active');
    });
    
    const selectedPage = document.getElementById(`page-${pageName}`);
    if (selectedPage) {
      selectedPage.classList.add('active');
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === pageName) {
        link.classList.add('active');
      }
    });
    
    STATE.currentPage = pageName;
    history.pushState(null, null, `#${pageName}`);
    
    if (pageName === 'leaderboard') {
      Leaderboard.init();
    }
    
    if (pageName === 'deposit') {
      Deposit.init();
    }
  }
};

// ============================================
// MENU SYSTEM
// ============================================

const Menu = {
  init() {
    const hamburger = document.getElementById('hamburger');
    const navClose = document.getElementById('navClose');
    const overlay = document.getElementById('overlay');
    
    if (hamburger) hamburger.addEventListener('click', () => this.toggle());
    if (navClose) navClose.addEventListener('click', () => this.toggle());
    if (overlay) overlay.addEventListener('click', () => this.closeAll());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });
  },
  
  toggle() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('overlay');
    
    hamburger?.classList.toggle('active');
    navMenu?.classList.toggle('active');
    overlay?.classList.toggle('active');
    
    document.body.style.overflow = navMenu?.classList.contains('active') ? 'hidden' : '';
  },
  
  closeAll() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('overlay');
    const debugPanel = document.getElementById('debugPanel');
    
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
    overlay?.classList.remove('active');
    debugPanel?.classList.remove('active');
    
    document.body.style.overflow = '';
  }
};

// ============================================
// NOTIFICATIONS SYSTEM
// ============================================

const Notifications = {
  add() {
    if (STATE.notifications.length >= CONFIG.MAX_NOTIFICATIONS) {
      console.log('Max notifications reached');
      return;
    }

    const cube = document.createElement('div');
    cube.className = 'notification-cube';
    const id = Date.now() + Math.random();
    cube.dataset.id = id;

    const icon = Utils.createErrorIcon();
    cube.appendChild(icon);

    const closeBtn = document.createElement('div');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.remove(id);
    };
    cube.appendChild(closeBtn);

    const timeBar = document.createElement('div');
    timeBar.className = 'time-bar';
    const timeBarFill = document.createElement('div');
    timeBarFill.className = 'time-bar-fill';
    timeBar.appendChild(timeBarFill);
    cube.appendChild(timeBar);

    cube.onclick = () => alert('Notification clicked! ID: ' + id);

    const container = document.getElementById('notificationContainer');
    if (container) container.appendChild(cube);
    
    STATE.notifications.push(id);
    this.updateCount();

    setTimeout(() => this.remove(id), 20000);
  },

  remove(id) {
    const cube = document.querySelector(`[data-id="${id}"]`);
    if (cube) {
      cube.style.animation = 'none';
      cube.style.transform = 'translateX(100px)';
      cube.style.opacity = '0';
      setTimeout(() => {
        cube.remove();
        STATE.notifications = STATE.notifications.filter(n => n !== id);
        this.updateCount();
      }, 300);
    }
  },

  clearAll() {
    STATE.notifications.forEach(id => {
      const cube = document.querySelector(`[data-id="${id}"]`);
      if (cube) {
        cube.style.animation = 'none';
        cube.style.transform = 'translateX(100px)';
        cube.style.opacity = '0';
      }
    });
    
    setTimeout(() => {
      const container = document.getElementById('notificationContainer');
      if (container) container.innerHTML = '';
      STATE.notifications = [];
      this.updateCount();
    }, 300);
  },

  updateCount() {
    const count = document.getElementById('notificationCount');
    if (count) count.textContent = STATE.notifications.length;
  }
};

// ============================================
// LIVE GIFT NOTIFICATIONS
// ============================================

const LiveGiftNotifications = {
  add(prize) {
    if (STATE.liveGiftNotifications.length >= CONFIG.MAX_LIVE_NOTIFICATIONS) {
      this.remove(STATE.liveGiftNotifications[0]);
    }

    const id = Date.now() + Math.random();
    const isNFT = NFT_GIFTS.includes(prize.value);
    
    const cube = document.createElement('div');
    cube.className = `notification-cube ${isNFT ? 'nft-notification' : 'gift-notification'}`;
    cube.dataset.id = id;

    const lottieContainer = document.createElement('div');
    lottieContainer.className = 'gift-notification-lottie';
    cube.appendChild(lottieContainer);

    if (prize.lottie) {
      lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: prize.lottie
      });
    }

    const label = document.createElement('div');
    label.className = 'gift-notification-label';
    label.textContent = isNFT ? 'NFT' : prize.value;
    cube.appendChild(label);

    // REMOVED: Close button - these are announcements only, not user's items
    // REMOVED: Click handler - prevents users from trying to claim others' prizes

    const timeBar = document.createElement('div');
    timeBar.className = 'time-bar';
    const timeBarFill = document.createElement('div');
    timeBarFill.className = 'time-bar-fill';
    timeBarFill.style.animationDuration = `${CONFIG.NOTIFICATION_DURATION}ms`;
    timeBar.appendChild(timeBarFill);
    cube.appendChild(timeBar);

    const container = document.getElementById('notificationContainer');
    if (container) container.appendChild(cube);

    STATE.liveGiftNotifications.push(id);
    Notifications.updateCount();

    setTimeout(() => this.remove(id), CONFIG.NOTIFICATION_DURATION);
    
    console.log('🎁 Live gift notification:', prize.value, isNFT ? '(NFT)' : '(Gift)');
  },

  remove(id) {
    const cube = document.querySelector(`[data-id="${id}"]`);
    if (cube) {
      cube.style.animation = 'none';
      cube.style.transform = 'translateX(100px)';
      cube.style.opacity = '0';
      setTimeout(() => {
        cube.remove();
        STATE.liveGiftNotifications = STATE.liveGiftNotifications.filter(n => n !== id);
        Notifications.updateCount();
      }, 300);
    }
  }
};

// ============================================
// FULL INVENTORY MODAL
// ============================================

const FullInventoryModal = {
  open() {
    const modal = document.getElementById('fullInventoryModal');
    if (!modal) return;

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

    this.updateStats();
    this.render('all');
    modal.classList.add('show');
    
    console.log('📦 Full inventory opened');
  },

  close() {
    const modal = document.getElementById('fullInventoryModal');
    if (modal) modal.classList.remove('show');
  },

  updateStats() {
    const totalGifts = STATE.inventoryItems.length;
    const totalValue = STATE.inventoryItems.reduce((sum, item) => 
      sum + (PRIZE_COIN_VALUES[item.value] || 0), 0);
    const rareGifts = STATE.inventoryItems.filter(item => 
      RARE_GIFTS.includes(item.value)).length;

    const total = document.getElementById('totalGiftsCount');
    const value = document.getElementById('totalGiftValue');
    const rare = document.getElementById('rareGiftsCount');
    
    if (total) total.textContent = totalGifts;
    if (value) value.textContent = totalValue.toLocaleString();
    if (rare) rare.textContent = rareGifts;
  },

  render(filter) {
    const grid = document.getElementById('fullInventoryGrid');
    const empty = document.getElementById('emptyInventory');
    if (!grid) return;

    grid.innerHTML = '';
    let filtered = STATE.inventoryItems;

    if (filter === 'telegram') {
      filtered = STATE.inventoryItems.filter(item => !NFT_GIFTS.includes(item.value));
    } else if (filter === 'nft') {
      filtered = STATE.inventoryItems.filter(item => NFT_GIFTS.includes(item.value));
    } else if (filter === 'rare') {
      filtered = STATE.inventoryItems.filter(item => RARE_GIFTS.includes(item.value));
    }

    if (filtered.length === 0) {
      if (empty) {
        empty.style.display = 'flex';
        grid.style.display = 'none';
      }
    } else {
      if (empty) {
        empty.style.display = 'none';
        grid.style.display = 'grid';
      }

      filtered.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'full-inventory-item';
        if (NFT_GIFTS.includes(item.value)) itemDiv.classList.add('nft-item');

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

        const name = document.createElement('div');
        name.className = 'full-item-name';
        name.textContent = item.value;
        itemDiv.appendChild(name);

        const id = document.createElement('div');
        id.className = 'full-item-id';
        id.textContent = item.prizeId;
        itemDiv.appendChild(id);

        if (NFT_GIFTS.includes(item.value)) {
          const badge = document.createElement('div');
          badge.className = 'full-item-badge';
          badge.textContent = 'NFT';
          itemDiv.appendChild(badge);
        }

        itemDiv.onclick = () => {
          PrizeModal.open(item);
          this.close();
        };

        grid.appendChild(itemDiv);
      });
    }
  }
};

// ============================================
// LEADERBOARD
// ============================================

const Leaderboard = {
  init() {
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
        STATE.currentLeaderboardTab = tabType;
        
        document.querySelectorAll('.leaderboard-list').forEach(list => {
          list.classList.remove('active');
        });
        
        const list = document.getElementById(`leaderboard-${tabType}`);
        if (list) list.classList.add('active');
        
        this.render(tabType);
      });
    });
    
    this.render('stars');
  },

  render(type) {
    const data = type === 'stars' ? 
      STATE.leaderboardData.stars : 
      STATE.leaderboardData.gifts;
    
    const container = document.getElementById(`leaderboard-${type}`);
    if (!container) return;
    
    const podiumContainer = container.querySelector('.podium-container');
    const ranksList = container.querySelector('.ranks-list');
    
    if (podiumContainer) podiumContainer.innerHTML = '';
    if (ranksList) ranksList.innerHTML = '';
    
    data.slice(0, 3).forEach((player, index) => {
      const rank = index + 1;
      const card = this.createPodiumCard(player, rank, type);
      if (podiumContainer) podiumContainer.appendChild(card);
    });
    
    data.slice(3).forEach((player, index) => {
      const rank = index + 4;
      const card = this.createRankCard(player, rank, type);
      if (ranksList) ranksList.appendChild(card);
    });
    
    this.updateYourRank(type);
  },

  createPodiumCard(player, rank, type) {
    // ... (unchanged except score display)
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
    score.textContent = type === 'stars' ? 
      player.stars.toLocaleString() : 
      `${player.gifts} gifts`;
    
    card.appendChild(rankBadge);
    card.appendChild(avatar);
    card.appendChild(name);
    card.appendChild(score);
    
    return card;
  },

  createRankCard(player, rank, type) {
    // ... (similar update for score display)
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
    score.textContent = type === 'stars' ? 
      `${player.stars.toLocaleString()} stars` : 
      `${player.gifts} gifts`;
    
    info.appendChild(name);
    info.appendChild(score);
    
    card.appendChild(position);
    card.appendChild(avatar);
    card.appendChild(info);
    
    return card;
  },

  updateYourRank(type) {
    const yourRank = document.getElementById('yourRank');
    const yourRankName = document.getElementById('yourRankName');
    const yourRankScore = document.getElementById('yourRankScore');
    
    if (!yourRank || !yourRankName || !yourRankScore) return;
    
    const currentUser = STATE.userData || { first_name: 'You', username: 'you' };
    const userName = currentUser.last_name 
      ? `${currentUser.first_name} ${currentUser.last_name}` 
      : currentUser.first_name;
    
    yourRankName.textContent = userName;
    
    if (type === 'stars') {
      const data = STATE.leaderboardData.stars;
      let rank = data.filter(p => p.stars > STATE.userStars).length + 1;
      yourRank.textContent = rank;
      yourRankScore.textContent = `${STATE.userStars.toLocaleString()} stars`;
    } else {
      const giftCount = STATE.inventoryItems.length;
      const data = STATE.leaderboardData.gifts;
      let rank = data.filter(p => p.gifts > giftCount).length + 1;
      yourRank.textContent = rank;
      yourRankScore.textContent = `${giftCount} gifts`;
    }
  },

  updateData() {
    if (STATE.currentPage === 'leaderboard') {
      this.updateYourRank(STATE.currentLeaderboardTab);
    }
  }
};
// ============================================
// DEPOSIT SYSTEM
// ============================================

const Deposit = {
  init() {
    console.log('✅ Deposit initialized (Stars Only)');
    this.renderPackages('stars');
    this.initIcons();
    
    // No tab switching needed - stars only
    const tab = document.querySelector('.deposit-tab[data-tab="stars"]');
    if (tab) {
      tab.classList.add('active');
    }
    
    const list = document.getElementById('deposit-stars');
    if (list) {
      list.classList.add('active');
    }
  },

  renderPackages(type) {
    const grid = document.querySelector(`#deposit-${type} .packages-grid`);
    if (!grid) return;

    grid.innerHTML = '';
    const packages = DEPOSIT_PACKAGES[type];

    packages.forEach((pkg, index) => {
      const card = this.createPackageCard(pkg, type, index);
      grid.appendChild(card);
    });
  },

  createPackageCard(pkg, type, index) {
    const card = document.createElement('div');
    card.className = 'package-card';
    card.style.animationDelay = `${index * 0.05}s`;

    if (pkg.popular) {
      const badge = document.createElement('div');
      badge.className = 'popular-badge';
      badge.textContent = 'Popular';
      card.appendChild(badge);
    }

    const icon = document.createElement('div');
    icon.className = 'package-icon';
    icon.id = `pkg-${type}-${index}`;
    card.appendChild(icon);

    const amount = document.createElement('div');
    amount.className = 'package-amount';
    amount.textContent = pkg.amount.toLocaleString();
    card.appendChild(amount);

    const currency = document.createElement('div');
    currency.className = 'package-currency';
    currency.textContent = 'Stars';
    card.appendChild(currency);

    const divider = document.createElement('div');
    divider.className = 'package-divider';
    card.appendChild(divider);

    const stars = document.createElement('div');
    stars.className = 'package-coins';
    stars.innerHTML = `
      <img src="assets/TStars.svg" alt="Star">
      <span>${pkg.stars.toLocaleString()} Stars</span>
    `;
    card.appendChild(stars);

    const buyBtn = document.createElement('button');
    buyBtn.className = 'package-buy-btn';
    buyBtn.textContent = 'Purchase';
    buyBtn.addEventListener('click', () => this.purchasePackage(pkg, type));
    card.appendChild(buyBtn);

    return card;
  },

  async purchasePackage(pkg, type) {
    if (!STATE.tg) {
      Utils.showToast('❌ Telegram WebApp not available', 'error');
      console.error('Telegram WebApp not available');
      return;
    }
    
    console.log('⭐ Initiating purchase:', pkg.id);
    console.log('📦 Package:', pkg.title || `${pkg.stars} Stars`);
    console.log('⭐ Stars:', pkg.amount);
    
    try {
      Utils.showToast('Creating invoice...', 'success');
      
      const userId = STATE.tg.initDataUnsafe?.user?.id;
      
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      console.log('👤 User ID:', userId);
      
      // REPLACE THIS URL WITH YOUR BOT SERVER URL!
      const botServerUrl = 'https://vgservers-production.up.railway.app';
      
      console.log('📡 Requesting invoice from server...');
      
      const response = await fetch(`${botServerUrl}/create-invoice`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          productId: pkg.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }
      
      const data = await response.json();
      
      if (!data.invoiceLink) {
        throw new Error('No invoice link received from server');
      }
      
      console.log('✅ Invoice link received!');
      console.log('🔗 Opening invoice popup...');
      
      STATE.tg.openInvoice(data.invoiceLink, async (status) => {
        console.log('💳 Payment status:', status);
        
        if (status === 'paid') {
          console.log('🎉 Payment successful!');
          
          Utils.showToast(`🎉 Payment successful! Adding ${pkg.stars} stars...`, 'success');
          
          setTimeout(async () => {
            await BackendAPI.syncBalance();
            
            Utils.showToast(`✅ ${pkg.stars} stars added to your account!`, 'success');
            
            if (STATE.settings.confettiEffects && window.showConfetti) {
              window.showConfetti();
            }
          }, 1500);
          
        } else if (status === 'cancelled') {
          console.log('❌ Payment cancelled by user');
          Utils.showToast('Payment cancelled', 'error');
          
        } else if (status === 'failed') {
          console.log('❌ Payment failed');
          Utils.showToast('Payment failed. Please try again.', 'error');
          
        } else {
          console.log('⚠️ Unknown payment status:', status);
        }
      });
      
    } catch (error) {
      console.error('❌ Error initiating purchase:', error);
      Utils.showToast(`Error: ${error.message}`, 'error');
      
      if (error.message.includes('openInvoice')) {
        Utils.showToast('Please update your Telegram app to use payments', 'error');
      }
    }
  },
  
  initIcons() {
    setTimeout(() => {
      const headerIcon = document.getElementById('depositStarIcon');
      if (headerIcon && headerIcon.children.length === 0) {
        lottie.loadAnimation({
          container: headerIcon,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: 'assets/TStars.json'
        });
      }
      
      const starsTabIcon = document.getElementById('starsTabIcon');
      if (starsTabIcon && starsTabIcon.children.length === 0) {
        lottie.loadAnimation({
          container: starsTabIcon,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: 'assets/TStars.json'
        });
      }
      
      DEPOSIT_PACKAGES.stars.forEach((pkg, index) => {
        const pkgIcon = document.getElementById(`pkg-stars-${index}`);
        if (pkgIcon && pkgIcon.children.length === 0) {
          lottie.loadAnimation({
            container: pkgIcon,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'assets/TStars.json'
          });
        }
      });
    }, 500);
  }
};

// ============================================
// SPIN WHEEL
// ============================================

const SpinWheel = {
  init() {
    this.populateCubes();
    this.startAnimation();
    this.loadIcons();
  },

  populateCubes() {
    const cubes = document.querySelectorAll('.cube');
    cubes.forEach(cube => {
      const prize = this.selectPrize();
      this.renderCube(cube, prize);
    });
  },

  selectPrize() {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (let prize of SPIN_PRIZES) {
      cumulative += prize.chance;
      if (random <= cumulative) return prize;
    }
    
    return SPIN_PRIZES[0];
  },

  renderCube(cube, prize) {
    this.cleanupCubeLottie(cube);
    
    cube.dataset.prizeId = prize.id;
    cube.dataset.prizeType = prize.type;
    cube.dataset.prizeValue = prize.value;
    
    if (!cube.dataset.cubeId) {
      cube.dataset.cubeId = 'cube_' + Math.random().toString(36).substr(2, 9);
    }
    
    cube.innerHTML = '';
    
    if (prize.type === 'star') {
      const img = document.createElement('img');
      img.src = 'assets/TStars.svg';
      img.alt = 'Star';
      img.style.width = '70px';
      img.style.height = '70px';
      img.style.objectFit = 'contain';
      img.style.margin = 'auto';
      cube.appendChild(img);
      
      const valueText = document.createElement('div');
      valueText.textContent = prize.value;
      valueText.style.cssText = `
        position: absolute;
        top: 15%;
        left: 25%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        pointer-events: none;
      `;
      
      cube.appendChild(valueText);
    } else {
      const container = document.createElement('div');
      container.style.width = '80px';
      container.style.height = '80px';
      container.style.margin = 'auto';
      cube.appendChild(container);
      
      const instance = lottie.loadAnimation({
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
      
      STATE.lottieInstances.set(cube.dataset.cubeId, instance);
    }
    
    cube.style.cssText = 'position: relative; display: flex; align-items: center; justify-content: center;';
  },

  cleanupCubeLottie(cube) {
    const cubeId = cube.dataset.cubeId;
    if (cubeId && STATE.lottieInstances.has(cubeId)) {
      const instance = STATE.lottieInstances.get(cubeId);
      instance.destroy();
      STATE.lottieInstances.delete(cubeId);
    }
  },

  updateScales(cubes) {
    const now = Date.now();
    if (now - STATE.lastScaleUpdate < 16 && STATE.isSpinning) return;
    STATE.lastScaleUpdate = now;
    
    const wheelContainer = document.querySelector('.wheel-container');
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
  },

  startAnimation() {
    const wheel = document.getElementById('wheel');
    const wheelContainer = document.querySelector('.wheel-container');
    
    const animate = () => {
      if (!wheel || !wheelContainer) {
        STATE.animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      const cubes = Array.from(document.querySelectorAll('.cube'));
      if (cubes.length === 0) {
        STATE.animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      STATE.scrollPosition += STATE.scrollSpeed;
      
      const totalCubeWidth = CONFIG.CUBE_WIDTH + CONFIG.GAP_WIDTH;
      
      if (STATE.scrollPosition >= totalCubeWidth) {
        const firstCube = cubes[0];
        wheel.appendChild(firstCube);
        STATE.scrollPosition -= totalCubeWidth;
        
        if (!STATE.isSpinning) {
          const prize = this.selectPrize();
          this.renderCube(firstCube, prize);
        }
      }
      
      wheel.style.transform = `translateX(-${STATE.scrollPosition}px)`;
      this.updateScales(cubes);
      
      STATE.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  },

  spin() {
    if (STATE.isSpinning) return;
    
    STATE.isSpinning = true;
    const spinButton = document.getElementById('spinButton');
    if (spinButton) spinButton.disabled = true;
    
    console.log('🎰 Spin started');

    const winningPrize = this.selectPrize();
    console.log('🎯 Winning prize:', winningPrize);

    const cubes = Array.from(document.querySelectorAll('.cube'));
    
    if (cubes.length === 0) {
      console.error('❌ No cubes found');
      STATE.isSpinning = false;
      if (spinButton) spinButton.disabled = false;
      return;
    }
    
    // Clean up and repopulate
    cubes.forEach(cube => {
      this.cleanupCubeLottie(cube);
      const randomPrize = this.selectPrize();
      this.renderCube(cube, randomPrize);
    });
    
    const totalCubeWidth = CONFIG.CUBE_WIDTH + CONFIG.GAP_WIDTH;
    const minSpinDistance = 5000 + Math.random() * 600;
    const cubePositionsToScroll = Math.floor(minSpinDistance / totalCubeWidth);
    const winningCubeIndex = cubePositionsToScroll % cubes.length;
    
    this.renderCube(cubes[winningCubeIndex], winningPrize);
    
    console.log('🎲 Winning index:', winningCubeIndex, 'Distance:', minSpinDistance.toFixed(0));

    const startTime = Date.now();
    
    const animateSpin = () => {
      if (!STATE.isSpinning) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / CONFIG.SPIN_DURATION, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      STATE.scrollSpeed = CONFIG.SPIN_MAX_SPEED * (1 - easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        STATE.scrollSpeed = 0;
        console.log('🎯 Spin complete');
        setTimeout(() => this.snapToCenter(), 100);
      }
    };
    
    animateSpin();
  },

  snapToCenter() {
    const cubes = Array.from(document.querySelectorAll('.cube'));
    const wheelContainer = document.querySelector('.wheel-container');
    if (!wheelContainer) return;
    
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
    const startScrollPos = STATE.scrollPosition;
    
    const snap = () => {
      const snapElapsed = Date.now() - snapStartTime;
      const snapProgress = Math.min(snapElapsed / snapDuration, 1);
      const snapEase = 1 - Math.pow(1 - snapProgress, 3);
      
      STATE.scrollPosition = startScrollPos + (distanceToSnap * snapEase);
      
      if (snapProgress < 1) {
        requestAnimationFrame(snap);
      } else {
        if (centerCube) {
          centerCube.style.transition = 'all 0.3s ease';
          centerCube.style.borderColor = '#60a5fa';
          centerCube.style.boxShadow = '0 0 40px rgba(96, 165, 250, 0.8)';
          
          setTimeout(() => centerCube.style.transition = '', 300);
          
          const finalPrize = SPIN_PRIZES.find(p => p.id === centerCube.dataset.prizeId);
          console.log('✅ Final prize:', finalPrize);
          
          setTimeout(() => {
            if (finalPrize) this.showWin(finalPrize);
          }, 200);
        }
      }
    };
    
    snap();
  },

  showWin(prize) {
    STATE.currentWinningPrize = prize;
    
    const modal = document.getElementById('winModal');
    const icon = document.getElementById('modalPrizeIcon');
    const name = document.getElementById('modalPrizeName');
    
    if (!modal || !icon || !name) return;
    
    icon.innerHTML = '';
    
    if (prize.type === 'star') {
      const img = document.createElement('img');
      img.src = 'assets/TStars.svg';
      img.alt = 'Star';
      icon.appendChild(img);
      
      const valueText = document.createElement('div');
      valueText.className = 'win-modal-value';
      valueText.textContent = prize.value;
      valueText.style.cssText = `
        color: #ffffff;
        font-weight: 800;
        font-size: 1.4rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
        position: relative;
        z-index: 1;
        margin-top: -10px;
      `;
      
      name.textContent = `${prize.value} Stars`;
    } else {
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      icon.appendChild(container);
      
      lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: prize.lottie
      });
      
      name.textContent = `the ${prize.value}`;
    }
    
    modal.classList.add('show');
  },

  hideWin() {
  const modal = document.getElementById('winModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      const icon = document.getElementById('modalPrizeIcon');
      if (icon) icon.innerHTML = '';
    }, 300);
  }
},
  
  claimWin() {
    if (!STATE.currentWinningPrize) {
      console.error('❌ No winning prize to claim');
      return;
    }
    
    const prize = STATE.currentWinningPrize;
    
    if (prize.type === 'star') {
      const starValue = parseInt(prize.value);
      Currency.add(starValue);
      console.log(`⭐ Claimed ${starValue} stars`);
    } else {
      const addedPrize = Inventory.add(prize);
      console.log(`🎁 Claimed gift: ${prize.value} (ID: ${addedPrize.prizeId})`);
      
      LiveGiftNotifications.add(addedPrize);
    }
    
    this.hideWin();
    STATE.currentWinningPrize = null;
    
    const cubes = document.querySelectorAll('.cube');
    cubes.forEach(cube => this.cleanupCubeLottie(cube));
    this.populateCubes();
    
    STATE.scrollSpeed = 1;
    STATE.isSpinning = false;
    
    const spinButton = document.getElementById('spinButton');
    if (spinButton) spinButton.disabled = false;
    
    console.log('✅ Prize claimed! Ready for next spin');
  },
  
  loadIcons() {
    const starIds = ['star1', 'star5', 'star10', 'star25', 'star50', 'star100', 'star250', 'star500'];
    starIds.forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        const img = document.createElement('img');
        img.src = 'assets/TStars.svg';
        img.alt = 'Star';
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
  }
};

// ============================================
// SETTINGS SYSTEM
// ============================================

const Settings = {
  load() {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(STATE.settings, parsed);
        this.apply();
        this.applyEffects();
        this.applyTranslations();
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  },

  save() {
    try {
      localStorage.setItem('appSettings', JSON.stringify(STATE.settings));
      console.log('✅ Settings saved');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
    }
  },

  apply() {
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
      if (toggle) toggle.checked = STATE.settings[id];
    });
    
    const currentLanguage = document.getElementById('currentLanguage');
    if (currentLanguage) {
      currentLanguage.textContent = LANGUAGE_NAMES[STATE.settings.language] || 'English';
    }
  },

  applyEffects() {
    const html = document.documentElement;
    
    if (!STATE.settings.animationsEnabled) {
      html.classList.add('animations-disabled');
      
      const style = document.createElement('style');
      style.id = 'animation-override';
      style.textContent = `
        .animations-disabled * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
        .animations-disabled #mainContent,
        .animations-disabled #loadingScreen,
        .animations-disabled .page-content,
        .animations-disabled .modal,
        .animations-disabled .notification-cube,
        .animations-disabled .time-bar-fill {
          animation-duration: 0.3s !important;
          transition-duration: 0.3s !important;
        }
        .animations-disabled svg,
        .animations-disabled svg * {
          animation-duration: revert !important;
          transition-duration: revert !important;
        }
      `;
      
      const oldStyle = document.getElementById('animation-override');
      if (oldStyle) oldStyle.remove();
      
      document.head.appendChild(style);
    } else {
      html.classList.remove('animations-disabled');
      const style = document.getElementById('animation-override');
      if (style) style.remove();
    }
    
    window.soundEnabled = STATE.settings.soundEffects;
    window.confettiEnabled = STATE.settings.confettiEffects;
  },

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = Utils.t(key);
      
      if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
        el.placeholder = translation;
      } else if (el.tagName === 'BUTTON' || el.tagName === 'A') {
        const icon = el.querySelector('svg, img, .icon');
        if (icon) {
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
    
    console.log('✅ Translations applied:', STATE.settings.language);
  },

  init() {
    this.load();
    
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
          STATE.settings[id] = e.target.checked;
          this.save();
          this.applyEffects();
          Utils.showToast('✓ Setting saved');
        });
      }
    });
    
    const languageSetting = document.getElementById('languageSetting');
    if (languageSetting) {
      languageSetting.addEventListener('click', () => LanguageModal.open());
    }
    
    const termsBtn = document.getElementById('termsBtn');
    if (termsBtn) {
      termsBtn.addEventListener('click', () => window.location.href = 'tos.html');
    }
    
    const privacyBtn = document.getElementById('privacyBtn');
    if (privacyBtn) {
      privacyBtn.addEventListener('click', () => window.location.href = 'privacy.html');
    }
    
    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => this.resetData());
    }
    
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
    }
    
    Promocode.init();
  },

  resetData() {
    const confirmed = confirm(
      '⚠️ WARNING: Reset All Data?\n\n' +
      'This will delete:\n' +
      '• All your coins\n' +
      '• All your prizes\n' +
      '• All your inventory items\n' +
      '• All redeemed promocodes\n' +
      '• All settings\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you sure?'
    );
    
    if (!confirmed) return;
    
    const userInput = prompt('Type "RESET" to confirm:');
    
    if (userInput === 'RESET') {
      localStorage.clear();
      STATE.virtualCurrency = 0;
      STATE.inventoryItems = [];
      Currency.update();
      Inventory.updateDisplay();
      
      alert('✅ All data reset!\n\nReloading...');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      alert('Reset cancelled.');
    }
  },

  clearCache() {
    const confirmed = confirm('Clear cache?\n\nYour data will NOT be affected.');
    if (confirmed) {
      console.log('🗑️ Cache cleared');
      Utils.showToast('✅ Cache cleared');
    }
  }
};

// ============================================
// LANGUAGE MODAL
// ============================================

const LanguageModal = {
  open() {
    const modal = document.getElementById('languageModal');
    if (modal) {
      modal.classList.add('show');
      this.updateSelection();
    }
  },

  close() {
    const modal = document.getElementById('languageModal');
    if (modal) modal.classList.remove('show');
  },

  updateSelection() {
    const options = document.querySelectorAll('.language-option');
    options.forEach(option => {
      const lang = option.dataset.lang;
      if (lang === STATE.settings.language) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  },

  init() {
    const closeBtn = document.getElementById('languageModalClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const modal = document.getElementById('languageModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    }

    document.querySelectorAll('.language-option').forEach(option => {
      option.addEventListener('click', () => {
        const lang = option.dataset.lang;
        STATE.settings.language = lang;
        Settings.save();
        
        const currentLanguage = document.getElementById('currentLanguage');
        if (currentLanguage) {
          currentLanguage.textContent = LANGUAGE_NAMES[lang];
        }
        
        this.updateSelection();
        Settings.applyTranslations();
        
        setTimeout(() => {
          this.close();
          Utils.showToast('✓ Language changed');
        }, 300);
      });
    });
  }
};

// ============================================
// PROMOCODE SYSTEM
// ============================================

const Promocode = {
  init() {
    this.loadRedeemed();
    
    const submitBtn = document.getElementById('promocodeSubmitBtn');
    const input = document.getElementById('promocodeInput');
    
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submit());
    }
    
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.submit();
      });
      
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
      });
    }
  },

  loadRedeemed() {
    const saved = localStorage.getItem('redeemedCodes');
    if (saved) {
      try {
        STATE.redeemedCodes = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading redeemed codes:', error);
        STATE.redeemedCodes = [];
      }
    }
  },

  saveRedeemed(code) {
    if (!STATE.redeemedCodes.includes(code)) {
      STATE.redeemedCodes.push(code);
      localStorage.setItem('redeemedCodes', JSON.stringify(STATE.redeemedCodes));
    }
  },

  submit() {
    const input = document.getElementById('promocodeInput');
    if (!input) return;
    
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
      this.showStatus('Please enter a promocode', 'error');
      return;
    }
    
    if (STATE.redeemedCodes.includes(code)) {
      this.showStatus('Code already redeemed', 'error');
      return;
    }
    
    if (VALID_PROMOCODES[code]) {
      const promo = VALID_PROMOCODES[code];
      Currency.add(promo.coins);
      this.saveRedeemed(code);
      this.showStatus(`✓ ${promo.message} +${promo.coins} coins!`, 'success');
      input.value = '';
      
      const submitBtn = document.getElementById('promocodeSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        setTimeout(() => submitBtn.disabled = false, 2000);
      }
      
      console.log(`✅ Promocode: ${code} (+${promo.coins})`);
    } else {
      this.showStatus('Invalid promocode', 'error');
    }
  },

  showStatus(message, type) {
    const status = document.getElementById('promocodeStatus');
    if (!status) return;
    
    status.textContent = message;
    status.className = 'promocode-status show ' + type;
    
    setTimeout(() => status.classList.remove('show'), 3000);
  }
};

// ============================================
// PROMOCODE BOX - DECORATIVE ANIMATION & NAVIGATION
// ============================================

const PromoCodeBox = {
  init() {
    const promoBox = document.getElementById('promoCodeBox');
    const promoInput = document.getElementById('promoInput');
    const promoNumberAnim = document.getElementById('promoNumberAnim');
    
    if (!promoBox || !promoInput || !promoNumberAnim) {
      console.warn('⚠️ Promo code box elements not found');
      return;
    }
    
    // Click handler - navigates to settings page
    promoBox.addEventListener('click', () => {
      console.log('🎯 Promo box clicked - navigating to settings');
      
      // Trigger animation first
      this.playAnimation(promoInput, promoNumberAnim);
      
      // Navigate to settings page after animation starts
      setTimeout(() => {
        Navigation.navigateTo('settings');
      }, 500);
    });
    
    // Auto-play animation on page load (after delay)
    setTimeout(() => {
      this.playAnimation(promoInput, promoNumberAnim);
      
      // Loop animation every 10 seconds
      setInterval(() => {
        this.playAnimation(promoInput, promoNumberAnim);
      }, 10000);
    }, 3000); // Start 3 seconds after page load
    
    console.log('✅ Promo code box initialized');
  },
  
  playAnimation(inputElement, numberElement) {
    if (!inputElement || !numberElement) return;
    
    // Hide placeholder text
    inputElement.classList.add('hide-placeholder');
    
    // Show and animate number
    numberElement.classList.remove('active');
    void numberElement.offsetWidth; // Force reflow
    numberElement.classList.add('active');
    
    // Show placeholder again after animation
    setTimeout(() => {
      inputElement.classList.remove('hide-placeholder');
      numberElement.classList.remove('active');
    }, 4000); // Match animation duration
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  PromoCodeBox.init();
});

// Alternative initialization if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PromoCodeBox.init());
} else {
  PromoCodeBox.init();
}

console.log('✨ Promo Code Box Script Loaded');

// ============================================
// CONTENT BOX HANDLERS
// ============================================

const ContentBoxes = {
  init() {
    const dailyBag = document.querySelector('.content-box-left-1');
    if (dailyBag) {
      dailyBag.addEventListener('click', () => Navigation.navigateTo('dailyspin'));
    }

    const viewAllBtn = document.querySelector('.view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        FullInventoryModal.open();
      });
    }

    // Projects box - add your own functionality here if needed
    const projects = document.querySelector('.content-box-bottom-1');
    if (projects) {
      projects.addEventListener('click', () => {
        // Add your navigation or action here
        console.log('📦 Projects clicked');
      });
    }

    // Contact box - add your own functionality here if needed
    const contact = document.querySelector('.content-box-bottom-2');
    if (contact) {
      contact.addEventListener('click', () => {
        // Add your navigation or action here
        console.log('📞 Contact clicked');
      });
    }
  }
};

// ============================================
// LOTTIE ANIMATIONS
// ============================================

const LottieAnimations = {
  init() {
    setTimeout(() => {
      // Daily Gift
      let dailyGift = lottie.loadAnimation({
        container: document.getElementById('lottieAnimation'),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'assets/DailyGift.json'
      });

      dailyGift.addEventListener('complete', function() {
        setTimeout(() => dailyGift.goToAndPlay(0, true), 5000);
      });

      setTimeout(() => dailyGift.play(), 1000);

      // Inventory
      let inventory = lottie.loadAnimation({
        container: document.getElementById('inventoryLottieAnimation'),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'assets/CrystalForInv.json'
      });

      inventory.addEventListener('complete', function() {
        setTimeout(() => inventory.goToAndPlay(0, true), 5000);
      });

      setTimeout(() => inventory.play(), 1000);
    }, 2500);
  }
};

// ============================================
// EVENT LISTENERS
// ============================================

const EventListeners = {
  init() {
    // Prize Modal
    const prizeModalClose = document.getElementById('prizeModalClose');
    if (prizeModalClose) {
      prizeModalClose.addEventListener('click', () => PrizeModal.close());
    }

    const prizeModal = document.getElementById('prizeModal');
    if (prizeModal) {
      prizeModal.addEventListener('click', (e) => {
        if (e.target === prizeModal) PrizeModal.close();
      });
    }

    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
      convertBtn.addEventListener('click', () => PrizeModal.convert());
    }

    const claimPrizeBtn = document.getElementById('claimPrizeBtn');
    if (claimPrizeBtn) {
      claimPrizeBtn.addEventListener('click', () => PrizeModal.claim());
    }

    // Spin Button
    const spinButton = document.getElementById('spinButton');
    if (spinButton) {
      spinButton.addEventListener('click', () => SpinWheel.spin());
    }

    // Claim Win Button
    const claimButton = document.getElementById('claimButton');
    if (claimButton) {
      claimButton.addEventListener('click', () => SpinWheel.claimWin());
    }

    // Full Inventory Modal
    const fullInventoryClose = document.getElementById('fullInventoryClose');
    if (fullInventoryClose) {
      fullInventoryClose.addEventListener('click', () => FullInventoryModal.close());
    }

    const fullInventoryModal = document.getElementById('fullInventoryModal');
    if (fullInventoryModal) {
      fullInventoryModal.addEventListener('click', (e) => {
        if (e.target === fullInventoryModal) FullInventoryModal.close();
      });
    }

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.currentFilter = btn.dataset.filter;
        FullInventoryModal.render(STATE.currentFilter);
      });
    });

    // Debug Panel
    const imitateWinBtn = document.getElementById('imitateWinBtn');
    if (imitateWinBtn) {
      imitateWinBtn.addEventListener('click', () => {
        Notifications.add();
        const amount = Math.floor(Math.random() * 151) + 50;
        Currency.add(amount);
      });
    }

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => Notifications.clearAll());
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape
      if (e.key === 'Escape') {
        PrizeModal.close();
        FullInventoryModal.close();
        LanguageModal.close();
        Menu.closeAll();
      }
      
      // Ctrl/Cmd + D (Debug)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) debugPanel.classList.toggle('active');
      }
      
      // Ctrl/Cmd + I (Inventory)
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        FullInventoryModal.open();
      }
    });

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      STATE.lottieInstances.forEach(instance => instance.destroy());
      STATE.lottieInstances.clear();
    });
  }
};

// ============================================
// ENHANCED INVENTORY MANAGEMENT
// ============================================

// Note: Live gift notifications are now handled in SpinWheel.claimWin()
// to avoid duplicate notifications

// ============================================
// GLOBAL API
// ============================================

window.TelegramGame = {
  // Core
  state: STATE,
  config: CONFIG,
  
  // Functions
  generatePrizeId: Utils.generatePrizeId,
  addPrizeToInventory: Inventory.add,
  removePrizeFromInventory: Inventory.remove,
  getInventoryItems: Inventory.getItems,
  verifyPrizeExists: Inventory.verify,
  addCurrency: Currency.add,
  sendDataToBot: TelegramApp.sendData,
  // REMOVED: addStars (security issue)
  
  // Translation
  t: Utils.t,
  applyTranslations: Settings.applyTranslations,
  
  // Modules
  Currency,
  Inventory,
  Navigation,
  Settings,
  SpinWheel,
  Leaderboard,
  Notifications,
  PrizeModal,
  FullInventoryModal,
  Deposit
};
// ============================================
// INITIALIZATION
// ============================================

function initializeApp() {
  console.log('🚀 Initializing Telegram Game App...');
  
  // ============================================
  // CHECK FOR PAYMENT SUCCESS (First Priority)
  // ============================================
  checkForPaymentSuccess();
  
  // ============================================
  // Initialize Core Systems
  // ============================================
  TelegramApp.init();
  LoadingScreen.init();
  Navigation.init();
  Menu.init();
  Settings.init();
  LanguageModal.init();
  ContentBoxes.init();
  EventListeners.init();
  
  // ============================================
  // Load Balance from Cloud Storage
  // ============================================
  BackendAPI.syncBalance().then(() => {
    Currency.update();
    console.log('✅ Initial balance loaded:', STATE.virtualCurrency);
  }).catch(error => {
    console.error('❌ Error loading balance:', error);
    Currency.update();
  });
  
  // ============================================
  // Update Displays
  // ============================================
  Inventory.updateDisplay();
  
  // ============================================
  // Initialize Animations on Page Load
  // ============================================
  window.addEventListener('load', () => {
    SpinWheel.init();
    LottieAnimations.init();
  });
  
  console.log('✅ App initialized successfully');
}

// ============================================
// PAYMENT SUCCESS DETECTION FUNCTION
// ============================================
function checkForPaymentSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const starsToAdd = urlParams.get('stars');
  const userId = urlParams.get('uid');
  const timestamp = urlParams.get('t');
  
  if (starsToAdd) {
    const amount = parseInt(starsToAdd);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⭐ PAYMENT SUCCESS DETECTED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⭐ Stars to add: ${amount}`);
    console.log(`👤 User ID: ${userId || 'Not provided'}`);
    console.log(`🕐 Timestamp: ${timestamp ? new Date(parseInt(timestamp)).toLocaleString() : 'Not provided'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (isNaN(amount) || amount <= 0) {
      console.error('❌ Invalid star amount:', starsToAdd);
      cleanupURLParams();
      return;
    }
    
    Utils.showToast(`🎉 Payment successful! Adding ${amount} stars...`, 'success');
    
    setTimeout(async () => {
      try {
        await BackendAPI.syncBalance();
        
        Utils.showToast(`✅ ${amount} stars added to your account!`, 'success');
        
        if (STATE.settings.soundEffects && window.playSuccessSound) {
          window.playSuccessSound();
        }
        
        if (STATE.settings.confettiEffects && window.showConfetti) {
          window.showConfetti();
        }
        
        console.log('✅ Payment processed successfully!');
        console.log(`⭐ New balance: ${STATE.userStars}`);
        
      } catch (error) {
        console.error('❌ Error processing payment:', error);
        Utils.showToast('⚠️ Error syncing balance. Please refresh.', 'error');
      } finally {
        cleanupURLParams();
      }
    }, 2000);
  }
}

// ============================================
// CLEANUP URL PARAMETERS
// ============================================
function cleanupURLParams() {
  try {
    // Get current URL without query parameters
    const newUrl = window.location.pathname + window.location.hash;
    
    // Replace URL without reloading page
    window.history.replaceState({}, document.title, newUrl);
    
    console.log('🧹 URL parameters cleaned');
  } catch (error) {
    console.error('❌ Error cleaning URL:', error);
  }
}

// ============================================
// START THE APP
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

console.log('✨ Telegram Game Complete System Loaded!');
console.log('💳 Payment System: Mobile-Optimized');
console.log('📱 Deep Link Flow: Enabled');
console.log('☁️ Cloud Storage Sync: Active');
