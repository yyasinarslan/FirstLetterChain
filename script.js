/**
 * Zincirleme Kelime Oyunu Mantığı
 */

// --- DOM Elementleri ---
const menuScreen = document.getElementById('menu-screen');
const nameEntryScreen = document.getElementById('name-entry-screen');
const p1NameInput = document.getElementById('p1-name-input');
const p2NameInput = document.getElementById('p2-name-input');
const p2NameInputGroup = document.getElementById('p2-name-input-group');
const p1NameLabel = document.getElementById('p1-name-label');
const nameSubmitBtn = document.getElementById('name-submit-btn');
const onlineLobbyScreen = document.getElementById('online-lobby-screen');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');
const roomCodeInput = document.getElementById('room-code-input');
const settingsScreen = document.getElementById('settings-screen');
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const setupInputsContainer = document.getElementById('setup-inputs');
const setupTitle = document.getElementById('setup-title');
const setupDesc = document.getElementById('setup-desc');
const setupActionBtn = document.getElementById('setup-action-btn');
const setupRandomBtn = document.getElementById('setup-random-btn');
const wordChainContainer = document.getElementById('word-chain');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const passBtn = document.getElementById('pass-btn');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');
const chatContainer = document.getElementById('chat-container');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const p1Card = document.getElementById('p1-card');
const p2Card = document.getElementById('p2-card');
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');
const turnIndicator = document.getElementById('turn-indicator');
const btnPvC = document.getElementById('btn-pvc');
const btnPvP = document.getElementById('btn-pvp');
const btnOnline = document.getElementById('btn-online');
const hintToggle = document.getElementById('hint-toggle');
const btnSettings = document.getElementById('btn-settings');
const btnSettingsBack = document.getElementById('btn-settings-back');
const timerToggle = document.getElementById('timer-toggle');
const timerDurationInput = document.getElementById('timer-duration');
const timerSettingsDetail = document.getElementById('timer-settings-detail');
const timerBox = document.getElementById('timer-box');
const wordCountInput = document.getElementById('word-count-input');
const scoreCorrectInput = document.getElementById('score-correct-input');
const scoreWrongInput = document.getElementById('score-wrong-input');
const scoreTimeoutInput = document.getElementById('score-timeout-input');
const scorePassInput = document.getElementById('score-pass-input');
const passLimitInput = document.getElementById('pass-limit-input');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// --- Oyun Durumu (State) ---
let gameMode = 'pvc'; // 'pvc' (Player vs Computer) veya 'pvp' (Player vs Player)
let p1Chain = []; // 1. Oyuncunun hazırladığı (2. Oyuncunun tahmin edeceği)
let p2Chain = []; // 2. Oyuncunun hazırladığı (1. Oyuncunun tahmin edeceği)
let computerChain = []; // Bilgisayar modu için
let p1Name = "";
let p2Name = "";

// Online Değişkenleri
let peer = null;
let conn = null;
let myPlayerId = 0; // 0: Offline, 1: Host (P1), 2: Guest (P2)

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
let scoreCorrect = 10;
let scoreWrong = 3;
let scoreTimeout = 5;
let scorePass = 20;
let passLimit = 2;
let passesUsed = { 1: 0, 2: 0 };
const TOTAL_WORDS = 7;

// Bilgisayar Modu İçin Hazır Listeler
// --- Başlangıç ---
function init() {
    console.log("Oyun başlatılıyor...");

    // Enter tuşu ile tahmin yapabilme
    if (guessInput) {
        guessInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleGuess();
        });
    }

    // Dark Mode Başlangıç Kontrolü
    try {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            if(darkModeToggle) darkModeToggle.checked = true;
        }
    } catch (e) {
        console.warn("LocalStorage erişimi kısıtlı:", e);
    }

    if(darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            try { localStorage.setItem('darkMode', darkModeToggle.checked); } catch(e) {}
        });
    }

    if(btnPvC) btnPvC.addEventListener('click', () => initGame('pvc'));
    if(btnPvP) btnPvP.addEventListener('click', () => initGame('pvp'));
    if(btnOnline) btnOnline.addEventListener('click', () => initGame('online'));

    // Ayarlar Menüsü Geçişleri
    if(btnSettings) {
        btnSettings.addEventListener('click', () => {
            menuScreen.classList.add('hidden');
            settingsScreen.classList.remove('hidden');
        });
    }
    if(btnSettingsBack) {
        btnSettingsBack.addEventListener('click', () => {
            settingsScreen.classList.add('hidden');
            menuScreen.classList.remove('hidden');
        });
    }

    // Timer Ayarı Görünürlüğü
    if(timerToggle) {
        timerToggle.addEventListener('change', () => {
            if(timerToggle.checked) timerSettingsDetail.classList.remove('hidden');
            else timerSettingsDetail.classList.add('hidden');
        });
    }
    
    if(setupActionBtn) setupActionBtn.addEventListener('click', handleSetupAction);
    if(setupRandomBtn) setupRandomBtn.addEventListener('click', fillRandomSetup);
    if(nameSubmitBtn) nameSubmitBtn.addEventListener('click', handleNameSubmit);
    if(btnCreateRoom) btnCreateRoom.addEventListener('click', createRoom);
    if(btnJoinRoom) btnJoinRoom.addEventListener('click', joinRoom);
    if(guessBtn) guessBtn.addEventListener('click', () => handleGuess(false));
    if(passBtn) passBtn.addEventListener('click', () => handlePass(false));
    if(restartBtn) restartBtn.addEventListener('click', resetGame);
    if(chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
    if(chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
}

// Oyun Modu Seçimi ve Başlatma
function initGame(mode) {
    gameMode = mode;
    menuScreen.classList.add('hidden');
    nameEntryScreen.classList.remove('hidden');

    // İsim ekranını sıfırla ve moda göre ayarla
    p1NameInput.value = '';
    p2NameInput.value = '';

    if (mode === 'pvc' || mode === 'online') {
        p2NameInputGroup.classList.add('hidden');
        p1NameLabel.innerText = "Oyuncu Adı";
        p1NameInput.placeholder = "Adınızı giriniz...";
        if (mode === 'online') {
            // Online modda isim girdikten sonra lobiye gideceğiz
            nameSubmitBtn.innerText = "Lobiye Git";
        }
    } else {
        p2NameInputGroup.classList.remove('hidden');
        p1NameLabel.innerText = "1. Oyuncu Adı";
        p1NameInput.placeholder = "1. Oyuncu ismi...";
        p2NameInput.placeholder = "2. Oyuncu ismi...";
    }
}

function handleNameSubmit() {
    // Ayarları Oku
    isHintEnabled = hintToggle.checked; // Ayarı oku
    isTimerEnabled = timerToggle.checked;
    timerDuration = parseInt(timerDurationInput.value) || 30;
    scoreCorrect = parseInt(scoreCorrectInput.value) || 10;
    scoreWrong = parseInt(scoreWrongInput.value) || 3;
    scoreTimeout = parseInt(scoreTimeoutInput.value) || 5;
    scorePass = parseInt(scorePassInput.value) || 20;
    passLimit = parseInt(passLimitInput.value) || 2;
    totalWords = parseInt(wordCountInput.value) || 7;

    // İsimleri Kaydet
    p1Name = p1NameInput.value.trim() || (gameMode === 'pvc' ? 'Oyuncu' : '1. Oyuncu');
    p2Name = p2NameInput.value.trim() || '2. Oyuncu';
    
    if (gameMode === 'online') {
        // Online modda isim P1 veya P2 olarak atanacak, şimdilik geçici tutuyoruz
        nameEntryScreen.classList.add('hidden');
        initOnlineLobby();
        return;
    }

    nameEntryScreen.classList.add('hidden');

    if (gameMode === 'pvc') {
        // Bilgisayar Modu: Rastgele liste seç ve başlat
        
        // Seçilen kelime sayısına (totalWords) uygun olan listeleri filtrele
        // Örneğin: totalWords 7 ise, sadece uzunluğu 7 ve üzeri olanları al.
        // totalWords 6 ise, uzunluğu 6 ve üzeri olanları al.
        const validLists = computerLists.filter(list => list.length >= totalWords);

        if (validLists.length === 0) {
            alert(`Bu uzunlukta (${totalWords}) yeterli kelime zinciri bulunamadı!`);
            return;
        }

        const randomIndex = Math.floor(Math.random() * validLists.length);
        // Seçilen kelime sayısına göre listeyi kes
        computerChain = validLists[randomIndex].slice(0, totalWords);
        startGameplay();
    } else {
        // PvP Modu: Kurulum ekranına git
        setupStep = 1;
        createSetupInputs();
        setupScreen.classList.remove('hidden');
        updateSetupUI();
    }
}

// --- ONLINE MANTIK ---
function initOnlineLobby() {
    onlineLobbyScreen.classList.remove('hidden');
    
    if (typeof Peer === 'undefined') {
        alert("PeerJS kütüphanesi yüklenemedi. Lütfen reklam engelleyiciyi kapatın veya sayfayı yenileyin.");
        return;
    }

    // PeerJS Başlat
    peer = new Peer(null, { debug: 2 });
    
    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
    });

    peer.on('connection', (c) => {
        // Host tarafı: Birisi bağlandı
        conn = c;
        setupConnectionHandlers();
    });
    
    peer.on('error', (err) => {
        alert("Bağlantı hatası: " + err);
    });
}

function createRoom() {
    const lobbyActions = document.getElementById('lobby-actions');
    lobbyActions.innerHTML = `
        <div style="text-align:center;">
            <p>Oda Kodunuz:</p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 10px 0;">
                <h1 style="font-size: 1.2rem; letter-spacing: 1px; color: var(--primary); margin: 0; word-break: break-all;">${peer.id}</h1>
                <button id="btn-copy-code" class="secondary-btn" style="width: auto; padding: 5px 10px; margin: 0; cursor: pointer;" title="Kopyala">📋</button>
            </div>
            <p id="copy-feedback" style="height: 20px; margin: 0; font-size: 0.9rem; color: var(--success); font-weight: bold;"></p>
            <p class="info-text">Arkadaşınla bu kodu paylaş ve bekle...</p>
            <div class="loader" style="margin: 20px auto;"></div>
        </div>
    `;

    document.getElementById('btn-copy-code').addEventListener('click', () => {
        navigator.clipboard.writeText(peer.id).then(() => {
            const feedback = document.getElementById('copy-feedback');
            feedback.innerText = "Kopyalandı!";
            setTimeout(() => feedback.innerText = "", 2000);
        });
    });

    myPlayerId = 1; // Host her zaman P1
}

function joinRoom() {
    const code = roomCodeInput.value.trim();
    if (!code) return;
    
    conn = peer.connect(code);
    myPlayerId = 2; // Katılan her zaman P2
    
    conn.on('open', () => {
        setupConnectionHandlers();
        // Bağlandık, ismimizi gönderelim
        conn.send({ type: 'JOIN', name: p1Name }); // p1Name değişkeninde kendi ismimiz var şu an
        document.getElementById('lobby-actions').innerHTML = `<p>Bağlanıldı! Oyun başlatılıyor...</p>`;
    });
}

function setupConnectionHandlers() {
    conn.on('data', (data) => {
        handleRemoteData(data);
    });

    // Eğer Host isek ve bağlantı sağlandıysa oyunu kur
    if (myPlayerId === 1) {
        // Bekle, karşı taraf ismini göndersin ('JOIN' mesajı)
    }
}

function handleRemoteData(data) {
    if (data.type === 'JOIN') {
        // Host: Misafir ismini aldı, oyunu başlatıyor
        p2Name = data.name; // Misafirin ismi P2 olur
        // Kurulumu başlat
        conn.send({ 
            type: 'SETUP_INIT', 
            p1Name: p1Name,
            settings: {
                totalWords,
                scoreCorrect,
                scoreWrong,
                scoreTimeout,
                scorePass,
                passLimit,
                isHintEnabled,
                isTimerEnabled,
                timerDuration
            }
        });
        startOnlineSetup();
        
    } else if (data.type === 'SETUP_INIT') {
        // Guest: Kurulum emri aldı
        // İsim Düzeltmesi: Şu an p1Name'de kendi ismimiz var.
        // Bunu p2Name'e alalım, çünkü p1Name Host olacak.
        p2Name = p1Name;
        p1Name = data.p1Name;
        
        // Host ayarlarını uygula (Senkronizasyon)
        if (data.settings) {
            totalWords = data.settings.totalWords;
            scoreCorrect = data.settings.scoreCorrect;
            scoreWrong = data.settings.scoreWrong;
            scoreTimeout = data.settings.scoreTimeout;
            scorePass = data.settings.scorePass;
            passLimit = data.settings.passLimit;
            isHintEnabled = data.settings.isHintEnabled;
            isTimerEnabled = data.settings.isTimerEnabled;
            timerDuration = data.settings.timerDuration;
        }
        
        startOnlineSetup();

    } else if (data.type === 'SETUP_DONE') {
        // Karşı taraf kelimelerini hazırladı
        if (myPlayerId === 1) p2Chain = data.chain; // Host, P2'nin hazırladığını aldı
        else p1Chain = data.chain; // Guest, P1'in hazırladığını aldı
        
        checkOnlineStart();
        
    } else if (data.type === 'GUESS') {
        guessInput.value = data.value;
        handleGuess(true); // true = remote
        
    } else if (data.type === 'RESTART') {
        performRestart();
        
    } else if (data.type === 'PASS') {
        handlePass(true); // true = remote
        
    } else if (data.type === 'CHAT') {
        appendChatMessage(data.message, false);
    }
}

function startOnlineSetup() {
    onlineLobbyScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    createSetupInputs();
    
    // Zincirleri sıfırla
    p1Chain = [];
    p2Chain = [];

    // UI Hazırlığı
    const inputs = document.querySelectorAll('.setup-input');
    inputs.forEach(input => input.value = '');
    setupInputsContainer.classList.remove('hidden');
    setupRandomBtn.classList.remove('hidden');
    setupActionBtn.disabled = false;

    if (myPlayerId === 1) {
        setupTitle.innerText = `${p1Name} Hazırlığı`;
        setupDesc.innerText = `${p2Name} için kelimeleri giriniz.`;
    } else {
        setupTitle.innerText = `${p2Name} Hazırlığı`;
        setupDesc.innerText = `${p1Name} için kelimeleri giriniz.`;
    }
    setupActionBtn.innerText = "Hazır ve Gönder";
}

function checkOnlineStart() {
    if (p1Chain.length > 0 && p2Chain.length > 0) {
        setupScreen.classList.add('hidden');
        startGameplay();
    }
}

// Kurulum ekranındaki inputları oluştur
function createSetupInputs() {
    setupInputsContainer.innerHTML = '';
    for (let i = 0; i < totalWords; i++) {
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
        setupTitle.innerText = `${p1Name} Hazırlığı`;
        setupDesc.innerText = `${p2Name} ekrana bakmasın! ${p2Name} tahmin edecek.`;
        setupActionBtn.innerText = `Devam Et (Sıra ${p2Name} geçecek)`;
        setupTitle.style.color = "#4f46e5";
    } else {
        setupTitle.innerText = `${p2Name} Hazırlığı`;
        setupDesc.innerText = `${p1Name} ekrana bakmasın! ${p1Name} tahmin edecek.`;
        setupActionBtn.innerText = "Oyunu Başlat";
        setupTitle.style.color = "#ef4444"; // Farklı renk
    }
}

function fillRandomSetup() {
    // Seçilen kelime sayısına uygun listeleri bul
    const validLists = computerLists.filter(list => list.length >= totalWords);
    
    if (validLists.length === 0) {
        alert(`Bu uzunlukta (${totalWords}) uygun liste bulunamadı.`);
        return;
    }

    // Rastgele birini seç
    const randomList = validLists[Math.floor(Math.random() * validLists.length)];
    const inputs = document.querySelectorAll('.setup-input');

    // Inputları doldur
    inputs.forEach((input, index) => {
        if (randomList[index]) {
            input.value = randomList[index];
        }
    });
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

    if (gameMode === 'online') {
        if (myPlayerId === 1) {
            p1Chain = currentWords; // Host kendi hazırladığını kaydetti
            conn.send({ type: 'SETUP_DONE', chain: p1Chain });
        } else {
            p2Chain = currentWords; // Guest kendi hazırladığını kaydetti
            conn.send({ type: 'SETUP_DONE', chain: p2Chain });
        }
        
        // Bekleme Moduna Geç
        setupInputsContainer.classList.add('hidden');
        setupRandomBtn.classList.add('hidden');
        setupActionBtn.disabled = true;
        setupDesc.innerText = "Rakibin kelimeleri hazırlaması bekleniyor...";
        
        checkOnlineStart();
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
    onlineLobbyScreen.classList.add('hidden');
    
    // Sıfırlama
    progress = { 1: 1, 2: 1 };
    revealedCounts = { 1: 1, 2: 1 };
    currentPlayer = 1;
    scores = { 1: 0, 2: 0 };
    passesUsed = { 1: 0, 2: 0 };

    // Chat Görünürlüğü
    if (gameMode === 'online') {
        chatContainer.classList.remove('hidden');
        chatMessages.innerHTML = ''; // Önceki mesajları temizle
    } else {
        chatContainer.classList.add('hidden');
    }
    
    // Arayüz Ayarları
    if (gameMode === 'pvc') {
        p2Card.classList.add('hidden'); // Bilgisayar kartını gizle veya "Bilgisayar" yap
        p1Card.querySelector('.p-name').innerText = p1Name;
        turnIndicator.innerText = "Bilgisayara Karşı Oynuyorsun";
    } else {
        p2Card.classList.remove('hidden');
        p1Card.querySelector('.p-name').innerText = p1Name;
        p2Card.querySelector('.p-name').innerText = p2Name;
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
function handleGuess(isRemote = false) {
    const userGuess = guessInput.value.trim();
    
    // Online Kontrolü: Sıra bende değilse işlem yapma (Local ise)
    if (gameMode === 'online' && !isRemote && currentPlayer !== myPlayerId) return;
    
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

    // Online: Hamleyi gönder (Eğer biz yaptıysak)
    if (gameMode === 'online' && !isRemote) {
        conn.send({ type: 'GUESS', value: userGuess });
    }

    // Karşılaştırma
    if (userGuess.toLocaleLowerCase('tr-TR') === correctWord.toLocaleLowerCase('tr-TR')) {
        // DOĞRU
        scores[currentPlayer] += scoreCorrect;
        messageEl.innerText = "Doğru!";
        messageEl.className = "message success";
        
        // İlerlemeyi artır
        progress[currentPlayer]++;
        revealedCounts[currentPlayer] = 1; // Yeni kelimeye geçince ipucunu sıfırla
        
        // Oyun Bitti mi?
        if (progress[currentPlayer] >= totalWords) {
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
        scores[currentPlayer] -= scoreWrong;
        messageEl.innerText = `Yanlış! (-${scoreWrong} Puan)`;
        messageEl.className = "message error";
        guessInput.classList.add('shake');
        setTimeout(() => guessInput.classList.remove('shake'), 500);
        
        guessInput.value = '';
        
        if (gameMode === 'pvp' || gameMode === 'online') {
            if (isHintEnabled) {
                messageEl.innerText = `Yanlış! -${scoreWrong} Puan. Sıra geçti. (Sonraki turda ipucu)`;
                revealedCounts[currentPlayer]++; // Bilemediği için bir harf daha açılacak
            } else {
                messageEl.innerText = `Yanlış! -${scoreWrong} Puan. Sıra diğer oyuncuya geçiyor.`;
            }
            switchTurn();
        } else {
            if (isHintEnabled) {
                messageEl.innerText = `Yanlış! -${scoreWrong} Puan. İpucu açıldı (+1 harf).`;
                revealedCounts[currentPlayer]++;
                renderBoard();
            }
        }
    }
    updatePlayerUI();
}

function handlePass(isRemote = false) {
    // Online Kontrolü
    if (gameMode === 'online' && !isRemote && currentPlayer !== myPlayerId) return;
    
    // Pas Hakkı Kontrolü
    if (passesUsed[currentPlayer] >= passLimit) {
        if (!isRemote) {
            messageEl.innerText = "Pas hakkınız kalmadı!";
            messageEl.className = "message error";
        }
        return;
    }

    passesUsed[currentPlayer]++;

    if (gameMode === 'online' && !isRemote) conn.send({ type: 'PASS' });

    if (gameMode === 'pvc') {
        // PvC: Kelimeyi atla (Pes et)
        scores[currentPlayer] -= scorePass; // Ceza uygula
        messageEl.innerText = `Pas geçildi! -${scorePass} Puan. Kelime açıldı.`;
        messageEl.className = "message error";

        progress[currentPlayer]++;
        revealedCounts[currentPlayer] = 1;

        if (progress[currentPlayer] >= totalWords) {
            finishGame();
            return;
        }

        guessInput.value = '';
        renderBoard();
        startTimer();
    } else {
        // PvP: Sırayı devret
        // Pas geçildiğinde puan düş, kelimeyi atla ve sırayı devret
        scores[currentPlayer] -= scorePass;
        progress[currentPlayer]++;
        revealedCounts[currentPlayer] = 1;

        if (progress[currentPlayer] >= totalWords) {
            finishGame();
            return;
        }

        let msg = `Pas geçildi (-${scorePass} Puan). Sıra diğer oyuncuda.`;
        if (gameMode === 'online') {
            if (isRemote) {
                msg = `Rakip pas geçti (-${scorePass} Puan). Sıra sende!`;
            } else {
                msg = `Pas geçildi (-${scorePass} Puan). Sıra rakipte.`;
            }
        }
        
        messageEl.innerText = msg;
        messageEl.className = "message error";
        guessInput.value = '';
        switchTurn();
    }
}

function switchTurn() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    renderBoard(); // Tahtayı yeni oyuncunun hedef zincirine göre güncelle
    startTimer(); // Sıra değişince süre başa döner
    updatePlayerUI(); // UI'ı güncelle (Pas geçildiğinde butonları kilitlemek/açmak için şart)
}

function updatePlayerUI() {
    p1ScoreEl.innerText = scores[1];
    p2ScoreEl.innerText = scores[2];
    
    // Pas Butonu Metni ve Durumu
    const remainingPass = Math.max(0, passLimit - passesUsed[currentPlayer]);
    passBtn.innerText = `Pas Geç (${remainingPass})`;

    // Online Modda Input Kilitleme
    if (gameMode === 'online') {
        const isMyTurn = currentPlayer === myPlayerId;
        guessInput.disabled = !isMyTurn;
        guessBtn.disabled = !isMyTurn;
        passBtn.disabled = !isMyTurn || remainingPass === 0;
        
        if (!isMyTurn) {
            guessInput.placeholder = `Sıra ${currentPlayer === 1 ? p1Name : p2Name} oyuncusunda...`;
        }
    }

    if (gameMode === 'pvc') {
        passBtn.disabled = remainingPass === 0;
        return;
    }
    
    // PvP Modu Pas Butonu Kontrolü
    passBtn.disabled = remainingPass === 0;

    if (currentPlayer === 1) {
        p1Card.classList.add('active');
        p2Card.classList.remove('active');
        guessInput.placeholder = `${p1Name} tahmini...`;
        turnIndicator.innerText = `Sıra: ${p1Name} (${p2Name} kelimelerini çözüyor)`;
        turnIndicator.style.color = "#4f46e5";
    } else {
        p1Card.classList.remove('active');
        p2Card.classList.add('active');
        guessInput.placeholder = `${p2Name} tahmini...`;
        turnIndicator.innerText = `Sıra: ${p2Name} (${p1Name} kelimelerini çözüyor)`;
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
        // İlk bitiren kazanır (Puanı düşük olsa bile)
        const winner = progress[1] >= totalWords ? p1Name : p2Name;
        resultText = `Oyun Bitti! Kazanan: ${winner} 🏆`;
    }
    
    messageEl.innerText = resultText;
    guessInput.disabled = true;
    guessBtn.disabled = true;
    passBtn.disabled = true;
    restartBtn.classList.remove('hidden');
    renderBoard();
}

function resetGame() {
    if (gameMode === 'online') {
        // Online modda sayfayı yenileme, sinyal gönder
        conn.send({ type: 'RESTART' });
        performRestart();
    } else {
        // Diğer modlarda sayfayı yenile
        location.reload();
    }
}

function performRestart() {
    // Skorları ve durumu sıfırla
    scores = { 1: 0, 2: 0 };
    progress = { 1: 1, 2: 1 };
    revealedCounts = { 1: 1, 2: 1 };
    currentPlayer = 1;
    passesUsed = { 1: 0, 2: 0 };
    
    // Bitiş ekranı elemanlarını gizle/aktif et
    restartBtn.classList.add('hidden');
    guessInput.disabled = false;
    guessBtn.disabled = false;
    passBtn.disabled = false;
    messageEl.innerText = '';
    messageEl.className = 'message';
    
    // Kurulum ekranına geri dön
    startOnlineSetup();
}

// --- Chat Fonksiyonları ---
function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Kendimizde göster
    appendChatMessage(text, true);
    
    // Gönder
    if (gameMode === 'online' && conn) {
        conn.send({ type: 'CHAT', message: text });
    }
    
    chatInput.value = '';
}

function appendChatMessage(text, isSelf) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isSelf ? 'self' : 'remote'}`;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // En alta kaydır
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
    scores[currentPlayer] -= scoreTimeout; 
    progress[currentPlayer]++;
    revealedCounts[currentPlayer] = 1;

    // Oyun bitti mi?
    if (progress[currentPlayer] >= totalWords) {
        finishGame();
        return;
    }

    if (gameMode === 'pvc') {
        messageEl.innerText = `Süre doldu! -${scoreTimeout} Puan. Kelime açıldı.`;
        messageEl.className = "message error";
        guessInput.value = '';
        updatePlayerUI();
        renderBoard();
        startTimer();
    } else {
        messageEl.innerText = `Süre doldu! -${scoreTimeout} Puan. Kelime açıldı, sıra geçti.`;
        messageEl.className = "message error";
        guessInput.value = '';
        switchTurn();
        updatePlayerUI();
    }
}

// Başlat
init();
