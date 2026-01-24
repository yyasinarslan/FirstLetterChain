/**
 * Zincirleme Kelime Oyunu Mantığı
 */

// --- DOM Elementleri ---
const menuScreen = document.getElementById('menu-screen');
const settingsScreen = document.getElementById('settings-screen');
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const setupInputsContainer = document.getElementById('setup-inputs');
const setupTitle = document.getElementById('setup-title');
const setupDesc = document.getElementById('setup-desc');
const setupActionBtn = document.getElementById('setup-action-btn');
const wordChainContainer = document.getElementById('word-chain');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');
const p1Card = document.getElementById('p1-card');
const p2Card = document.getElementById('p2-card');
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');
const turnIndicator = document.getElementById('turn-indicator');
const btnPvC = document.getElementById('btn-pvc');
const btnPvP = document.getElementById('btn-pvp');
const hintToggle = document.getElementById('hint-toggle');
const btnSettings = document.getElementById('btn-settings');
const btnSettingsBack = document.getElementById('btn-settings-back');
const timerToggle = document.getElementById('timer-toggle');
const timerDurationInput = document.getElementById('timer-duration');
const timerSettingsDetail = document.getElementById('timer-settings-detail');
const timerBox = document.getElementById('timer-box');

// --- Oyun Durumu (State) ---
let gameMode = 'pvc'; // 'pvc' (Player vs Computer) veya 'pvp' (Player vs Player)
let p1Chain = []; // 1. Oyuncunun hazırladığı (2. Oyuncunun tahmin edeceği)
let p2Chain = []; // 2. Oyuncunun hazırladığı (1. Oyuncunun tahmin edeceği)
let computerChain = []; // Bilgisayar modu için

// İlerleme Durumları (Hangi kelimedeler)
let progress = { 1: 1, 2: 1 }; 
let revealedCounts = { 1: 1, 2: 1 }; // Her oyuncu için o anki kelimede kaç harf açık
let currentPlayer = 1; // 1 veya 2
let scores = { 1: 0, 2: 0 };
let setupStep = 1; // PvP kurulum aşaması (1: P1 giriyor, 2: P2 giriyor)
let isHintEnabled = true; // Ayar: Yanlış tahminde ipucu verilsin mi?
let isTimerEnabled = false;
let timerDuration = 30;
let currentTime = 0;
let timerInterval = null;
const TOTAL_WORDS = 7;

// Bilgisayar Modu İçin Hazır Listeler
const computerLists = [
    ["Telefon", "Şarjı", "Aleti", "Çantası", "Askısı", "İpi", "Kopuk"],
    ["Kahve", "Fincanı", "Tabağı", "Kenarı", "Kırık", "Cam", "Parçası"],
    ["Okul", "Çantası", "Fermuarı", "Bozuk", "Para", "Üstü", "Kalsın"],
    ["Yazılım", "Dili", "Yapısı", "Karmaşık", "Sayılar", "Teorisi", "Kitabı"],
    ["Yağmur", "Damlası", "Çikolata", "Şelalesi", "Suyu", "Şişesi", "Buruşması"],
    ["Yaz", "Tatili", "Köyü", "Kahvesi", "Falı", "Bakmak", "Görmek"],
    ["Hamburger", "Ekmeği", "Parası", "Kasası", "Şifresi", "Kırmak", "Dökmek"],
    ["Deniz", "Sörfü", "Tahtası", "Kurusu", "Fasulye", "Fiyatı", "Etiketi"],
    ["Kalp", "Krizi", "Masası", "Ayağı", "Parmağı", "Çıtlaması", "Kırıldı"],
    ["Uğur", "Böceği", "İlacı", "Kutusu", "Oyunu", "Konsolu", "Aynası"]
];

// --- Başlangıç ---
function init() {
    // Enter tuşu ile tahmin yapabilme
    guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleGuess();
    });

    btnPvC.addEventListener('click', () => initGame('pvc'));
    btnPvP.addEventListener('click', () => initGame('pvp'));

    // Ayarlar Menüsü Geçişleri
    btnSettings.addEventListener('click', () => {
        menuScreen.classList.add('hidden');
        settingsScreen.classList.remove('hidden');
    });
    btnSettingsBack.addEventListener('click', () => {
        settingsScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
    });

    // Timer Ayarı Görünürlüğü
    timerToggle.addEventListener('change', () => {
        if(timerToggle.checked) timerSettingsDetail.classList.remove('hidden');
        else timerSettingsDetail.classList.add('hidden');
    });
    
    setupActionBtn.addEventListener('click', handleSetupAction);
    guessBtn.addEventListener('click', handleGuess);
    restartBtn.addEventListener('click', resetGame);
}

// Oyun Modu Seçimi ve Başlatma
function initGame(mode) {
    gameMode = mode;
    menuScreen.classList.add('hidden');
    isHintEnabled = hintToggle.checked; // Ayarı oku
    isTimerEnabled = timerToggle.checked;
    timerDuration = parseInt(timerDurationInput.value) || 30;

    if (mode === 'pvc') {
        // Bilgisayar Modu: Rastgele liste seç ve başlat
        const randomIndex = Math.floor(Math.random() * computerLists.length);
        computerChain = computerLists[randomIndex];
        startGameplay();
    } else {
        // PvP Modu: Kurulum ekranına git
        setupStep = 1;
        createSetupInputs();
        setupScreen.classList.remove('hidden');
        updateSetupUI();
    }
}

// Kurulum ekranındaki inputları oluştur
function createSetupInputs() {
    setupInputsContainer.innerHTML = '';
    for (let i = 0; i < TOTAL_WORDS; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `${i + 1}. Kelime`;
        input.className = 'setup-input';
        input.autocomplete = 'off';
        setupInputsContainer.appendChild(input);
    }
}

// PvP Kurulum Aşamaları
function updateSetupUI() {
    const inputs = document.querySelectorAll('.setup-input');
    inputs.forEach(input => input.value = ''); // Temizle

    if (setupStep === 1) {
        setupTitle.innerText = "1. Oyuncu Hazırlığı";
        setupDesc.innerText = "2. Oyuncu ekrana bakmasın! 2. Oyuncunun tahmin edeceği kelimeleri gir.";
        setupActionBtn.innerText = "Devam Et (Sıra 2. Oyuncuda)";
        setupTitle.style.color = "#4f46e5";
    } else {
        setupTitle.innerText = "2. Oyuncu Hazırlığı";
        setupDesc.innerText = "1. Oyuncu ekrana bakmasın! 1. Oyuncunun tahmin edeceği kelimeleri gir.";
        setupActionBtn.innerText = "Oyunu Başlat";
        setupTitle.style.color = "#ef4444"; // Farklı renk
    }
}

function handleSetupAction() {
    const inputs = document.querySelectorAll('.setup-input');
    let currentWords = [];
    let isValid = true;

    inputs.forEach(input => {
        const val = input.value.trim();
        if (!val) isValid = false;
        currentWords.push(val);
    });

    if (!isValid) {
        alert("Lütfen tüm kelimeleri giriniz!");
        return;
    }

    if (setupStep === 1) {
        p1Chain = currentWords; // P1'in girdiği (P2'nin tahmin edeceği)
        setupStep = 2;
        updateSetupUI();
    } else {
        p2Chain = currentWords; // P2'nin girdiği (P1'in tahmin edeceği)
        setupScreen.classList.add('hidden');
        startGameplay();
    }
}

function startGameplay() {
    gameScreen.classList.remove('hidden');
    
    // Sıfırlama
    progress = { 1: 1, 2: 1 };
    revealedCounts = { 1: 1, 2: 1 };
    currentPlayer = 1;
    scores = { 1: 0, 2: 0 };
    
    // Arayüz Ayarları
    if (gameMode === 'pvc') {
        p2Card.classList.add('hidden'); // Bilgisayar kartını gizle veya "Bilgisayar" yap
        p1Card.querySelector('.p-name').innerText = "Oyuncu";
        turnIndicator.innerText = "Bilgisayara Karşı Oynuyorsun";
    } else {
        p2Card.classList.remove('hidden');
        p1Card.querySelector('.p-name').innerText = "1. Oyuncu";
        p2Card.querySelector('.p-name').innerText = "2. Oyuncu";
    }
    
    updatePlayerUI();
    renderBoard();
    guessInput.focus();
    startTimer();
}

// Oyun Tahtasını Çiz
function renderBoard() {
    wordChainContainer.innerHTML = '';

    // Hangi zinciri göstereceğiz?
    // PvP'de: 1. Oyuncu sırasındaysa, 2. Oyuncunun hazırladığı zinciri (p2Chain) görmeli.
    // PvC'de: Computer zinciri.
    let targetChain = [];
    let currentProg = 0;

    if (gameMode === 'pvc') {
        targetChain = computerChain;
        currentProg = progress[1];
    } else {
        // PvP Mantığı:
        // P1 oynuyorsa -> Hedef p2Chain
        // P2 oynuyorsa -> Hedef p1Chain
        if (currentPlayer === 1) {
            targetChain = p2Chain;
            currentProg = progress[1];
        } else {
            targetChain = p1Chain;
            currentProg = progress[2];
        }
    }

    targetChain.forEach((word, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'word-item';

        const indexSpan = document.createElement('span');
        indexSpan.className = 'word-index';
        indexSpan.innerText = index + 1;

        const textSpan = document.createElement('span');

        if (index < currentProg) {
            // Bilinmiş veya ilk kelime (Açık)
            itemDiv.classList.add('solved');
            textSpan.innerText = word;
        } else {
            // Henüz bilinmemiş (Maskeli)
            let showCount = 1;
            
            if (index === currentProg) {
                itemDiv.classList.add('active');
                // Sıra kimdeyse onun ipucu seviyesini kullan
                showCount = revealedCounts[currentPlayer];
            }
            
            // Kelime uzunluğunu aşmaması için kontrol
            if (showCount > word.length) showCount = word.length;
            const visiblePart = word.substring(0, showCount);
            const mask = "_".repeat(word.length - showCount);
            textSpan.innerText = `${visiblePart}${mask}`;
        }

        itemDiv.appendChild(indexSpan);
        itemDiv.appendChild(textSpan);
        wordChainContainer.appendChild(itemDiv);
    });
}

// Tahmin Kontrolü
function handleGuess() {
    const userGuess = guessInput.value.trim();
    if (!userGuess) return;

    // Hedef kelimeyi bul
    let correctWord = "";
    if (gameMode === 'pvc') {
        correctWord = computerChain[progress[1]];
    } else {
        // PvP: P1 oynuyorsa hedef p2Chain'deki sıradaki kelime
        if (currentPlayer === 1) correctWord = p2Chain[progress[1]];
        else correctWord = p1Chain[progress[2]];
    }

    // Karşılaştırma
    if (userGuess.toLocaleLowerCase('tr-TR') === correctWord.toLocaleLowerCase('tr-TR')) {
        // DOĞRU
        scores[currentPlayer] += 10;
        messageEl.innerText = "Doğru!";
        messageEl.className = "message success";
        
        // İlerlemeyi artır
        progress[currentPlayer]++;
        revealedCounts[currentPlayer] = 1; // Yeni kelimeye geçince ipucunu sıfırla
        
        // Oyun Bitti mi?
        if (progress[currentPlayer] >= TOTAL_WORDS) {
            finishGame();
            return;
        }

        // PvP'de doğru bilirse sıra onda kalır (ödül), PvC'de zaten tek kişi.
        // Ancak kullanıcı "sırayla" dediği için PvP'de her tahminde sıra değişsin mi?
        // Genelde doğru bilince devam edilir. Ama rekabet için "sırayla" dediyse:
        // Kullanıcı isteği: "sırayla tahmin etmeye çalışacaklar".
        // Biz doğru bilince devam ettirelim, yanlışta sıra geçsin. (Daha akıcı)
        // VEYA: Her türlü sıra geçsin.
        // İki kişilik modda genelde sıra tabanlı oyunlarda doğru bilen devam eder.
        // Ama burada karışıklık olmaması için her doğru tahminde de sırayı değiştirebiliriz.
        // Şimdilik: Doğru bilen devam etsin (Bonus).
        
        guessInput.value = '';
        renderBoard();
        startTimer(); // Yeni kelime için süreyi sıfırla
    } else {
        // YANLIŞ
        scores[currentPlayer] -= 3;
        messageEl.innerText = "Yanlış! (-3 Puan)";
        messageEl.className = "message error";
        guessInput.classList.add('shake');
        setTimeout(() => guessInput.classList.remove('shake'), 500);
        
        guessInput.value = '';
        
        if (gameMode === 'pvp') {
            if (isHintEnabled) {
                messageEl.innerText = "Yanlış! -3 Puan. Sıra geçti. (Sonraki turda ipucu)";
                revealedCounts[currentPlayer]++; // Bilemediği için bir harf daha açılacak
            } else {
                messageEl.innerText = "Yanlış! -3 Puan. Sıra diğer oyuncuya geçiyor.";
            }
            switchTurn();
        } else {
            if (isHintEnabled) {
                messageEl.innerText = "Yanlış! -3 Puan. İpucu açıldı (+1 harf).";
                revealedCounts[currentPlayer]++;
                renderBoard();
            }
        }
    }
    updatePlayerUI();
}

function switchTurn() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    renderBoard(); // Tahtayı yeni oyuncunun hedef zincirine göre güncelle
    startTimer(); // Sıra değişince süre başa döner
}

function updatePlayerUI() {
    p1ScoreEl.innerText = scores[1];
    p2ScoreEl.innerText = scores[2];

    if (gameMode === 'pvc') return;

    if (currentPlayer === 1) {
        p1Card.classList.add('active');
        p2Card.classList.remove('active');
        guessInput.placeholder = "1. Oyuncu tahmini...";
        turnIndicator.innerText = "Sıra: 1. Oyuncu (2. Oyuncunun kelimelerini çözüyor)";
        turnIndicator.style.color = "#4f46e5";
    } else {
        p1Card.classList.remove('active');
        p2Card.classList.add('active');
        guessInput.placeholder = "2. Oyuncu tahmini...";
        turnIndicator.innerText = "Sıra: 2. Oyuncu (1. Oyuncunun kelimelerini çözüyor)";
        turnIndicator.style.color = "#ef4444";
    }
}

function finishGame(customMessage = null) {
    stopTimer();
    updatePlayerUI();
    let resultText = "";
    if (customMessage) {
        resultText = customMessage;
    } else if (gameMode === 'pvc') {
        resultText = `Tebrikler! Zinciri tamamladın. Puanın: ${scores[1]} 🏆`;
    } else {
        // PvP Bitiş
        const winner = scores[1] > scores[2] ? "1. Oyuncu" : (scores[2] > scores[1] ? "2. Oyuncu" : "Dostluk");
        resultText = `Oyun Bitti! Kazanan: ${winner} 🏆`;
    }
    
    messageEl.innerText = resultText;
    guessInput.disabled = true;
    guessBtn.disabled = true;
    restartBtn.classList.remove('hidden');
    renderBoard();
}

function resetGame() {
    location.reload();
}

// --- Timer Fonksiyonları ---
function startTimer() {
    stopTimer(); // Öncekini temizle
    if (!isTimerEnabled) {
        timerBox.classList.add('hidden');
        return;
    }

    currentTime = timerDuration;
    timerBox.classList.remove('hidden');
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        currentTime--;
        updateTimerDisplay();
        if (currentTime <= 0) {
            handleTimeOut();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerBox.classList.remove('warning');
}

function updateTimerDisplay() {
    timerBox.innerText = currentTime;
    if (currentTime <= 5) timerBox.classList.add('warning');
    else timerBox.classList.remove('warning');
}

function handleTimeOut() {
    stopTimer();
    
    // Puan cezası ve kelimeyi geçme
    scores[currentPlayer] -= 5; 
    progress[currentPlayer]++;
    revealedCounts[currentPlayer] = 1;

    // Oyun bitti mi?
    if (progress[currentPlayer] >= TOTAL_WORDS) {
        finishGame();
        return;
    }

    if (gameMode === 'pvc') {
        messageEl.innerText = "Süre doldu! -5 Puan. Kelime açıldı.";
        messageEl.className = "message error";
        guessInput.value = '';
        updatePlayerUI();
        renderBoard();
        startTimer();
    } else {
        messageEl.innerText = "Süre doldu! -5 Puan. Kelime açıldı, sıra geçti.";
        messageEl.className = "message error";
        guessInput.value = '';
        switchTurn();
        updatePlayerUI();
    }
}

// Başlat
init();
