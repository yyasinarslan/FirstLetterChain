# 🔗 Zincirleme Kelime Oyunu (FirstLetterChain)

**Zincirleme Kelime Oyunu**, oyuncuların bir önceki kelimeyle anlamsal veya tamlama ilişkisi olan bir sonraki kelimeyi tahmin etmeye çalıştıkları, web tabanlı, eğlenceli bir zeka oyunudur.

Bu proje; tek kişilik, aynı cihazda iki kişilik ve **internet üzerinden online (P2P)** oynama seçenekleri sunar.

![Version](https://img.shields.io/badge/version-v3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Özellikler

*   **3 Farklı Oyun Modu:** Bilgisayara Karşı, Yerel PvP ve Online PvP.
*   **🌐 Online Oynanış:** PeerJS teknolojisi ile sunucusuz, doğrudan tarayıcılar arası (P2P) bağlantı.
*   **💬 Oyun İçi Sohbet:** Online modda rakipler arası anlık mesajlaşma ve "yazıyor..." animasyonu.
*   **🎨 Modern Arayüz:** Responsive (Mobil uyumlu) tasarım ve **Karanlık Mod (Dark Mode)** desteği.
*   **⚙️ Gelişmiş Ayarlar:** Puanlama, süre, kelime sayısı ve ipucu ayarlarını özelleştirebilme.
*   **⏱️ Süre Sınırı:** İsteğe bağlı olarak her tur için geri sayım sayacı.

## 🎮 Nasıl Oynanır?

Oyunun temel amacı, gizli olan kelime zincirini tahmin etmektir. Kelimeler genellikle bir tamlama oluşturur (Örn: `Telefon` -> `Şarjı` -> `Aleti`).

### Oyun Modları

1.  **🤖 Bilgisayara Karşı (PvC):**
    *   Sistem rastgele bir kelime zinciri seçer.
    *   Oyuncu sırayla kelimeleri tahmin etmeye çalışır.
    *   Yanlış tahminlerde puan kaybedilir ve ipucu açılır.

2.  **👥 İki Kişilik (PvP - Aynı Cihaz):**
    *   **Kurulum:** 1. Oyuncu, 2. Oyuncunun tahmin etmesi için kelimeleri girer. Ardından 2. Oyuncu, 1. Oyuncu için kelimeleri girer.
    *   **Oyun:** Sırayla birbirlerinin hazırladığı kelimeleri tahmin ederler.

3.  **🌐 Online (P2P - Uzaktan):**
    *   Bir oyuncu **"Oda Oluştur"** diyerek bir kod alır.
    *   Diğer oyuncu bu kodu girerek odaya **"Katıl"**ır.
    *   Kurulum ve oyun aşamaları PvP ile aynıdır ancak her oyuncu kendi ekranını görür.
    *   Oyun ayarları (süre, puan vb.) odayı kuran kişi (Host) tarafından belirlenir ve senkronize edilir.

## 📜 Kurallar ve Puanlama

Varsayılan puanlama sistemi şöyledir (Ayarlardan değiştirilebilir):

| Durum | Puan Etkisi | Açıklama |
| :--- | :--- | :--- |
| **Doğru Tahmin** | `+10 Puan` | Kelimeyi tam olarak doğru bildiğinizde kazanılır. |
| **Yanlış Tahmin** | `-3 Puan` | Yanlış tahminde puan düşer. Ayar açıksa bir harf ipucu verilir. |
| **Süre Dolumu** | `-5 Puan` | Süre biterse puan düşer ve sıra diğer oyuncuya geçer. |
| **Pas Geçme** | `-20 Puan` | Kelimeyi bilemeyip pas geçerseniz uygulanır. |

*   **Sıra Geçişi:** Yanlış tahminde, süre dolduğunda veya pas geçildiğinde sıra rakibe geçer.
*   **Kazanma:** Puanı ne olursa olsun, kelime zincirini **ilk tamamlayan** oyuncu oyunu kazanır.

## ⚙️ Ayarlar Menüsü

Ana menüden "Ayarlar" butonuna tıklayarak şunları değiştirebilirsiniz:

*   **Görünüm:** Karanlık Mod aç/kapa.
*   **Oynanış:**
    *   Sohbet özelliği (Açık/Kapalı).
    *   Yanlış tahminde ipucu (Açık/Kapalı).
    *   Süre sınırı (Aktif/Pasif ve Saniye ayarı).
    *   Kelime Sayısı (4 ile 7 arası).
*   **Puanlama:** Doğru, Yanlış, Süre ve Pas puanlarını özelleştirme.
*   **Pas Hakkı:** Oyuncuların kaç kez pas geçebileceğini belirleme.

## 🛠️ Kurulum ve Çalıştırma

Bu proje tamamen **istemci taraflı (client-side)** çalışır. Herhangi bir sunucu kurulumu gerektirmez (Online mod için PeerJS'in public sunucularını kullanır).

### Yerel Olarak Çalıştırma
1.  Projeyi indirin veya kopyalayın.
2.  Klasör içindeki `index.html` dosyasına çift tıklayarak tarayıcınızda açın.
3.  İyi eğlenceler!

### GitHub Pages ile Yayınlama
1.  Projeyi GitHub reponuza yükleyin.
2.  Repo ayarlarından **Pages** bölümüne gidin.
3.  Branch olarak `main` (veya `master`) seçin ve kaydedin.
4.  Verilen link üzerinden arkadaşlarınızla online oynayabilirsiniz.

## 📂 Proje Yapısı

```text
FirstLetterChain/
├── index.html      # Ana HTML yapısı (Menüler, Oyun Alanı, Chat)
├── style.css       # Tüm stiller, animasyonlar ve responsive kurallar
├── script.js       # Oyun mantığı, P2P bağlantı, DOM manipülasyonu
├── words.js        # Bilgisayar modu için hazır kelime listeleri
└── README.md       # Proje dokümantasyonu
```

## 💻 Teknolojiler

*   **HTML5 & CSS3:** Modern ve responsive arayüz.
*   **JavaScript (ES6+):** Oyun mantığı.
*   **PeerJS:** WebRTC tabanlı online bağlantı kütüphanesi.

## 🐛 Bilinen Sorunlar ve İpuçları

*   **Online Bağlantı:** Bazı kurumsal ağlarda veya sıkı güvenlik duvarlarında (Firewall) P2P bağlantı engellenebilir. Mobil veri veya ev interneti ile sorunsuz çalışır.
*   **Tarayıcı:** En iyi deneyim için güncel Chrome, Firefox veya Safari kullanın.

---

*Geliştirici: Yasin Arslan*
*Sürüm: v3.0*