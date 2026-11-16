# GlotKids — gizlilik incelemesi ve uygulama planı

**İnceleme tarihi:** 16 Kasım 2026
**Kapsam:** web sitesi (`glotkids-web`), mobil uygulama (`loplop`), sunucu (`loplop-server`), yönetim paneli (`loplop-admin`).
**Yöntem:**
- Mobil, sunucu ve panel **yalnızca okundu**; o depolarda hiçbir dosya değişmedi.
- Gerçek kullanıcı verisine dokunulmadı.
- Web sitesi düzeltildi.

Bu belge bir hukuki görüş değildir. Kodda doğrulanan davranışı, önerilen yaklaşımı ve uzman kararı gereken noktaları ayrı ayrı yazar.

Durum etiketleri:

| Etiket | Anlamı |
|---|---|
| **KOD** | Koddan doğrulandı |
| **CANLI** | Canlı ayardan ya da sözleşmeden doğrulanmalı |
| **KARAR** | İşletme kararı |
| **HUKUK** | Hukuk değerlendirmesi |

---

## 1. Öncelik sırasıyla sorunlar

### P0 — yayını ya da mağaza onayını doğrudan etkiler

1. **Hesapsız ilk açılışta da veri gidiyor.** Eski metin "ilerleme telefonda kalır, biz görmeyiz" diyordu ve ağ trafiğinden hiç söz etmiyordu. Gerçekte: **KOD**
   - Uygulama her açılışta sunucumuza iki istek gönderir:
     - `GET /api/app/auth` (`loplop/src/platform/account.ts:174`);
     - `GET /api/app/manifest?build=…&schema=…&channel=…` (`src/platform/remote.ts:193`).
   - Sunucu bu isteklerin IP adresini ve istek satırını günlüğe yazar (`loplop-server/src/app.ts:44`).
   - Expo güncelleme hizmetine (`u.expo.dev`, `app.json` → `updates.checkAutomatically: ON_LOAD`) IP adresiyle birlikte **kuruluma özgü kalıcı bir kimlik** gider: `EAS-Client-ID`, `node_modules/expo-updates/ios/EXUpdates/AppLoader/FileDownloader.swift:464`.
2. **Ebeveyn hesabı açılınca çocuğun ilerleme belgesi hesaba bağlanarak sunucuya gidiyor.** Belgede profil kimliği, tanışılan kelimeler ve zamanları, duraklar, diziler ve haritadaki yer var. **KOD**
   - Eşitleme girişte ve her kayıttan 4 sn sonra çalışıyor (`account.ts:187`, `:194`, `:258`).
   - Sunucu belgeyi `progress_backups.data` alanına `user_id` ile yazıyor (`loplop-server/src/modules/accounts.ts:150`, `src/storage/sql.ts:601`).
   - Bu veri çocuğa ilişkindir; eski metin onu yalnızca "ebeveyn hesabı verisi" gibi anlatıyordu.
3. **Silme ve sıfırlama kalıcı değil.** **KOD**
   - (a) Sunucudaki yedek silinirse (panel: `DELETE /users/:id/progress`, `accounts.ts:323`) hesaba bağlı telefon 404 alır ve **kendi kopyasını yeniden yükler** (`account.ts:317` ve ardından `PUT`).
   - (b) Hesap açıkken "Başa dön" (`src/app/progress.ts:41` → `resetProfile`) aynı profil kimliğiyle boş profil yazar. Birleştirme yalnız ekleyen bir yapıdır: kelimeleri en büyük değerle, durakları birleşimle alır (`src/core/progress.ts:176-191`). Bu yüzden sunucudaki eski ilerleme **geri gelir**.
   - (c) Hesap silindikten sonra sunucu, isteklerde yalnız token imzasına ve süresine bakar (`loplop-server/src/modules/auth.ts:134`, `verifyToken`). Hesabın hâlâ var olup olmadığını denetlemez. Süresi dolmamış oturumu olan başka bir telefon `seen()` ile hesap kaydını ve yedeği **yeniden oluşturabilir** (`accounts.ts:83`, `:150`). Supabase'in token süresi varsayılanı 1 saattir. **CANLI**
4. **Kanıtsız taahhütler yayımlanmıştı.**
   - "Yedekler şifreli tutulur": şifreleme yalnız `BACKUP_PASSPHRASE` verilirse yapılıyor. Eksik setler hiç şifrelenmiyor (`loplop-server/tools/backup.ts:16`, `:25`, `:63`). Kodda yedek döndürme ya da silme yok.
   - "Standart sözleşmeleri imzalar ve bildiririz", "Frankfurt", "hemen silinir", "sağlayıcılar talimatımızla çalışır" cümlelerinin hiçbirinin kanıtı yoktu. **CANLI / KARAR**
5. **Uygulamada gizlilik politikası bağlantısı yok.** Apple 5.1.1(i) ve Google User Data politikası bunu uygulamanın içinde istiyor. Arandı, bulunamadı: `src/content/locales/tr.ts` içinde "gizlilik" geçmiyor. **KOD**
6. **Apple Kids kategorisi riski.** Kural 1.3: "Kids Category apps may not send personally identifiable information or device information to third parties."
   - Expo'ya giden IP ve `EAS-Client-ID` bu kapsamda değerlendirilebilir.
   - Google ve Apple ile giriş de üçüncü taraftır (yetişkin bölümünde, ebeveyn kapısının arkasında olsa da).
   - **HUKUK / KARAR**
7. **COPPA ve GDPR anlatımı yanlıştı.** Eski metin "çocuktan kişisel veri toplanmadığı için GDPR/COPPA kapsamında onay gerektiren işlem yok" diyordu.
   - COPPA kalıcı tanımlayıcıları da kişisel bilgi sayar (FTC, Mayıs 2026 sayfası).
   - GDPR m.8 yalnız rızaya dayanan işlemler için bir yaş eşiği koyar.
   - **HUKUK**
8. **Web sitesindeki yayın kontrolü işe yaramıyordu.** Yalnız `RELEASE=1` verilirse duruyordu; normal `build` her durumda geçiyordu. **KOD (düzeltildi)**

### P1 — doğruluk ve güven

9. **Silme kaydında e-posta kalıyor.** Silme kaydı (`audit`) silinmiş hesabın e-postasını tutuyor:
   - uygulamadan silmede `actor` alanında (`accounts.ts:177`);
   - panelden silmede `detail` alanında (`:318`).

   Saklama süresi yok. **KOD**
10. **Sunucu günlükleri:** IP adresi ve istek satırı tutuluyor; saklama süresi tanımlı değil (systemd/journald). **KOD + CANLI**
11. **Telefonun kendi yedekleri:** ilerleme dosyası `Paths.document` altında (`loplop/src/platform/progress.ts:19`). iCloud ve cihaz yedeğine, Android'de varsayılan otomatik yedeğe girebilir. `app.json`'da `allowBackup` ayarı yok. **KOD + KARAR**
12. **Panel erişimi:** yöneticiler hesap e-postasını ve yedeğin özetini görüyor; özet profil etiketi, kelime, durak ve dizi sayıları ile haritadaki yeri içeriyor (`accounts.ts:255`, `summarize`). Metinde anlatılmamıştı. **KOD**
13. **İnternet iddiası:** "internetsiz çalışır" iddiası ürün kararıyla çelişiyordu. Yalnız ilk dünyalar pakette geliyor; sonrakiler indirilecek. **KARAR (düzeltildi)**
14. **"Tesadüfen geçemez" iddiası:** Ebeveyn kapısı yazıyla sorulan bir çarpma ve üç sayı seçeneği. Rastgele dokunan çocuk 1/3 olasılıkla geçebilir (`src/ui/PackOffer.tsx:105`). Site metni bu yüzden "zorlaştırır, yasal onay değildir" diye düzeltildi. **KOD**

### P2 — iyileştirme

15. Erişilebilirlik sayfasında bağımsız denetim yapılmadığı belirtilmemişti. Öğrenme sonucuna dair dolaylı vaatler vardı ("Okumayı bilmeden İngilizce"). **Düzeltildi**
16. Gelecekteki "gelişim ekranı" bugün çalışıyormuş gibi okunabiliyordu. **Düzeltildi:** "planlanıyor, bugünkü uygulamada yok".

---

## 2. Gerçek veri haritası

| # | Veri | Kime ait | Ne zaman / amaç | Nereye gider | Bağlı olduğu kimlik | Kim erişir | Saklama | Silme ve yedekler | Kanıt | Durum |
|---|---|---|---|---|---|---|---|---|---|---|
| D1 | İlerleme belgesi: rastgele profil kimliği ve etiketi; kelimeler (`met`, `firstAt`, `lastAt`); duraklar; `open` / `at`; diziler (`completedAt`, `times`) | Çocuk | Oyun oynandıkça; devam etmek ve tekrar | Telefon (`Paths.document/progress/progress.json`) | Yerel profil kimliği | Telefon; işletim sisteminin yedekleri | Uygulama silinene ya da "Başa dön"e kadar | Uygulamayı silmek ya da "Başa dön". iCloud/Google yedeğinde kalabilir | `loplop/src/core/progress.ts`, `src/platform/progress.ts:19` | KOD; işletim sistemi yedeği için KARAR |
| D2 | D1'in sunucu kopyası, artı `rev`, `bytes`, `device` (iOS/Android), `updated_at` | Çocuk (ebeveyn hesabına bağlı) | Girişte ve her kayıttan 4 sn sonra; yedek ve cihazlar arası taşıma | Sunucu, `progress_backups` | Supabase `user_id` (ebeveyn e-postasıyla eşleşir) | Ebeveyn (uygulamada); yöneticiler (özet) | Hesap silinene kadar; kullanılmayan hesap süresi yok | Hesap silinince canlıdan silinir. Altyapı yedeğinde kalır. Geri yüklemede geri gelir | `account.ts:292-330`, `accounts.ts:150`, `sql.ts:601` | KOD |
| D3 | Hesap kaydı: `user_id`, e-posta, giriş yöntemi, `created_at`, `last_seen_at` | Ebeveyn | Her `/api/me` isteğinde (`seen()`) | Sunucu, `accounts` | `user_id` | Yöneticiler | Hesap silinene kadar | Uygulamadan ya da panelden silinir. Süresi dolmamış token ile yeniden oluşabilir | `accounts.ts:83`, `sql.ts:592` | KOD |
| D4 | Kimlik doğrulama: e-posta, giriş yöntemi, Apple gizli e-postası, giriş zamanları, sağlayıcının güvenlik kayıtları (IP olabilir), yenileme tokenları | Ebeveyn | Giriş | Supabase | Supabase kullanıcısı | Supabase, yöneticiler (panel) | Supabase'in süreleri | `deleteUser` (`storage/supabase.ts:181`). Supabase'in kendi kayıtları ayrı | `platform/account.ts`, `storage/supabase.ts` | KOD + CANLI (bölge, süre) |
| D5 | Oturum anahtarı | Ebeveyn | Girişten sonra | Telefonun güvenli deposu | — | Telefon | Çıkışa kadar | Çıkış ya da silme ile `deleteItemAsync` | `account.ts:124-129` | KOD |
| D6 | İçerik ve hesap ayarı istekleri: IP, istek satırı (`build`, `schema`, `channel`), zaman, istemci bilgisi | Hesapsız kullanan dahil herkes | Her açılışta; içerik indirilirken | Sunucu, günlük (stdout → journald) | IP | Sunucu yöneticisi | Tanımsız | Günlük süresine bağlı | `remote.ts:193`, `account.ts:174`, `app.ts:44` | KOD + CANLI |
| D7 | Güncelleme denetimi: IP, `EAS-Client-ID` (kuruluma özgü, kalıcı UUID), platform, `runtimeVersion`, kanal | Herkes | Her açılışta | Expo (EAS Update) | `EAS-Client-ID` | Expo | Expo'nun süresi | Uygulamayı silince kimlik değişir. Expo'daki kayıt Expo'nun kuralına bağlı | `app.json` → `updates`; `expo-updates/.../FileDownloader.swift:464` | KOD + CANLI |
| D8 | İndirilen içerik dosyaları ve yayın kayıtları | — (kişisel değil) | Arka planda (yayın), paket ebeveyn kapısından sonra | Telefon (`Paths.document/content`) | — | Telefon | Yeni yayına geçince eski silinir | Uygulamayı silmek | `remote.ts:86-89`, `ui/PackOffer.tsx` | KOD |
| D9 | Cihaz ses seviyesi | — | Oyun ekranındayken saniyede bir | Yalnız telefon | — | — | Tutulmaz | — | `platform/deviceVolume.ts` | KOD |
| D10 | Silme ve yönetim kaydı (`audit`): `actor` (e-posta), işlem, `target` (`user_id`), `detail` (e-posta olabilir) | Ebeveyn, yönetici | Her hesap ve yönetici işleminde | Sunucu, `audit` | E-posta ve `user_id` | Yöneticiler | **Süresiz** | Silinmiyor; altyapı yedeğinde | `accounts.ts:77`, `:177`, `:318` | KOD |
| D11 | Altyapı yedekleri (bütün tablolar dahil: `accounts`, `progress_backups`, `audit`) | Hepsi | Her gece 03:30 ve riskli işlemlerden önce | Sunucu diski (`/var/backups/loplop`); uzak kopya operatörün işi | — | Yedeğe erişen | **Döndürme yok** | Silinen hesaplar yedekte kalır; geri yükleme onları **geri getirir** | `tools/backup.ts`, `deploy/loplop-backup.timer`, `docs/URETIM-KURULUMU.md` | KOD + CANLI |
| D12 | Destek ve KVKK e-postaları | Yazan kişi | Bize yazıldığında | E-posta sağlayıcısı | E-posta | Destek ekibi | Tanımsız | Talep üzerine | — | KARAR |
| D13 | Web sitesi erişimi | Ziyaretçi | Sayfa açıldığında | Barındırma sağlayıcısı | IP | Sağlayıcı | Sağlayıcıya bağlı | — | `dist` taraması: çerez, depolama ya da dış adres yok | KOD (site kodu), CANLI (sağlayıcı) |

**Toplanmadığı doğrulananlar (KOD):**
- Ad, doğum tarihi, fotoğraf, ses, konum.
- Mikrofon: `app.json` içinde expo-audio eklentisi için `microphonePermission: false`.
- Kamera izni: istenmiyor.
- Reklam SDK'sı ve reklam kimliği.
- Üçüncü taraf analitik ya da çökme raporlama (`package.json` bağımlılıklarında yok).
- Push bildirimi.
- Sohbet.

**Onboarding'de sorulan cevaplar:** Onboarding önizlemesindeki ad, yaş ve kişilik cevapları kaydedilmiyor (`ui/Onboarding.tsx` içinde kayıt ya da istek yok). Ancak bu ekran bugün yalnız önizleme sekmesinde var; yayın akışına girerse yeniden değerlendirilmeli. **KOD + KARAR**

---

## 3. Silme ve geri yükleme senaryoları (bugünkü davranış)

| Senaryo | Bugün ne olur | Kanıt | Gereken |
|---|---|---|---|
| Hesabı tamamen silme (uygulamadan) | Supabase kullanıcısı silinir. `accounts` satırı silinir, `progress_backups` da `CASCADE` ile silinir. Silme kaydında e-posta kalır. Telefondaki ilerleme kalır | `accounts.ts:171-178`, `sql.ts:602` | Silme kaydını takma adla tutmak ve süre koymak |
| Yalnız sunucudaki yedeği silme | Yalnız panelden yapılabiliyor. Bağlı telefon 404 alır ve **yeniden yükler** | `accounts.ts:323`, `account.ts:317` | Sunucu "silindi" işareti dönmeli (404 değil); telefon yeniden yüklemeden önce ebeveyne sormalı; uygulamada "Yedeği sil" düğmesi |
| Telefondaki ilerlemeyi sıfırlama | Hesapsız: kalıcı. Hesaplı: bir sonraki eşitleme **geri getirir** | `core/progress.ts:122`, `:176-191` | Profile bir "sıfırlama kuşağı" (generation) eklemek; birleştirme eski kuşağı atmalı |
| Çevrimdışı ikinci cihazın sonradan bağlanması | Hesap duruyorsa: telefonun ilerlemesi birleştirilir (beklenen). Hesap silindiyse ve token hâlâ geçerliyse: hesap ve yedek **yeniden oluşur** | `auth.ts:134`, `accounts.ts:83` | Silme işaretlerini tutan tablo (tombstone) ve her yazımda kontrol; ya da kısa token süresi ile yazımda hesabın varlığını denetlemek |
| Silmeden sonra aynı e-postayla yeniden giriş | Yeni Supabase `user_id` alınır; telefondaki ilerleme yeni hesaba yüklenir | Akış | Beklenen davranış; açıklandı. Silme ekranında "telefondaki ilerleme kalır" uyarısı var |
| Altyapı yedeğinden geri yükleme | Yedekten sonra silinmiş hesaplar ve yedekleri **geri gelir** | `tools/restore.ts` | Geri yüklemeden sonra silme günlüğünü yeniden uygulamak; günlük yedekten ayrı ve kalıcı tutulmalı |
| Ebeveynin aktarımı durdurması | Yalnız bütün telefonlarda çıkış yaparak. Uygulamada "yedeklemeyi durdur" yok | — | Ayar olarak "Yedekleme açık/kapalı"; kapatınca sunucudaki kopyayı silme seçeneği |
| Apple'ın e-posta gizleme seçeneği | Bize Apple'ın yönlendirme adresi gelir. Web üzerinden silme talebi o adresten gönderilemeyebilir | — | Web silme yolunda hesap bilgisiyle makul doğrulama (sitede anlatıldı) |

---

## 4. Mobil, sunucu ve panel için uygulama planı (bu incelemede uygulanmadı)

Proje kuralı 28'e göre her madde dört katmanda düşünülmeli: uygulama, panel, sunucu ve veritabanı.

**P0**

1. **Silme işareti (tombstone).**
   - Veritabanı: yeni bir göçle `deleted_accounts(user_id_hash, deleted_at)` tablosu.
   - Sunucu: `/api/me*` yazımları ve `seen()` silinmiş kimliği reddeder (410 `ACCOUNT_DELETED`).
   - Uygulama: 410 alınca oturumu kapatır ve ilerlemeyi göndermez.
   - Panel: silinen hesabın durumunu gösterir.
   - Testler: sunucuda `test:accounts`, uygulamada `accountcases`.
2. **Yedek silme işareti.**
   - Sunucu yedeği silince `progress_backups` satırı yerine `{ deleted_at }` işareti bırakır; `GET` 404 yerine 410 döner.
   - Uygulama 410'da otomatik `PUT` yapmaz. Ebeveyn kapısının arkasında "Bu telefondaki ilerleme yeniden yedeklensin mi?" diye sorar.
   - Uygulamaya "Yedeği sil" ve "Yedeklemeyi durdur" seçenekleri eklenir.
3. **Kalıcı sıfırlama.**
   - `Profile`'a `generation` (ve `resetAt`) alanı eklenir.
   - `mergeProgress` daha yeni kuşağı kazandırır ve eski kuşağın kelime ve duraklarını atar.
   - Şema sürümü artar: `PROGRESS_SCHEMA = 2`.
   - Sunucunun zod şeması ve panelin `summarize` fonksiyonu yeni alanı tanır.
   - Eski telefonlar daha yeni şemanın üstüne yazmaz; `readProgress` zaten "newer" sonucunu döndürüyor.
4. **Geri yüklemede silmeleri yeniden uygulama.**
   - `restore.ts`, geri yüklemeden sonra `deleted_accounts` ve yedekten ayrı tutulan silme günlüğünü yeniden uygular.
   - `restore-check` bunu doğrular.
5. **Uygulama içinde gizlilik bağlantısı.** Ebeveyn bölümünde, ebeveyn kapısının arkasında, gizlilik politikası ve hesap silme sayfasına bağlantı (Apple 1.3 ve 5.1.1(i), Google). Bağlantı adresi alan adı belli olunca girilir.
6. **Bilgilendirme ve onay akışı.** Hesap açılmadan önce, ebeveyn kapısının arkasında, şunu söyleyen kısa bir ekran: "Bu hesap açılırsa çocuğun ilerlemesinin bir kopyası … saklanır".
   - Hukukçu açık rıza gerektiğine karar verirse:
     - Veritabanına yeni göçle `consents(user_id, scope, notice_version, given_at, withdrawn_at, channel)` tablosu.
     - Onay **eşitleme başlamadan önce** alınır.
     - Onay geri çekilince eşitleme durur ve isteğe bağlı olarak sunucudaki kopya silinir.
     - Panel onay durumunu gösterir.
   - Çocuktan ya da ebeveynden kimlik belgesi toplanmaz.
   - AB veya ABD yayını varsa, "doğrulanabilir ebeveyn onayı" yöntemi hukukçuyla seçilir; yalnız e-posta onayı ve ebeveyn kapısı yetmez.
7. **Expo güncellemeleri ve Kids kategorisi.** Seçenekler:
   - (a) Expo ile sözleşme (DPA) ve rol doğrulaması, ardından Apple'a açıklama;
   - (b) güncelleme sunucusunu kendi altyapımıza taşımak (expo-updates özel sunucu destekliyor);
   - (c) mağaza sürümünde OTA güncellemesini kapatmak.

   **KARAR + HUKUK**
8. **Yedekler.**
   - Üretimde `BACKUP_PASSPHRASE` yoksa `backup.ts` çalışmayı reddetmeli.
   - Eksik set de şifrelenmeli ya da kişisel tabloları içermemeli.
   - Yedek döndürme (ör. 30 gün) zamanlayıcıya eklenmeli.
   - Anahtar yönetimi yazılı olmalı.

**P1**

9. **Silme kaydında e-posta tutmamak.** `actor` ve `detail` alanlarına e-posta yerine `user_id` ya da onun özeti yazılsın. Yeni bir göçle eski satırlar anonimleştirilsin; saklama süresi işiyle temizlensin.
10. **Sunucu günlükleri.**
    - journald saklama süresi (`SystemMaxRetentionSec`) belirlenmeli.
    - İstenirse IP adresi kısaltılmalı (son okteti sıfırlamak).
    - Caddy erişim günlüğü kapalı kalmalı ya da süresi yazılmalı.
11. **Kullanılmayan hesaplar.** Süre kararından sonra, önceden e-postayla haber vererek silen bir iş.
12. **İşletim sistemi yedekleri.** İlerleme dosyası iCloud ve Google yedeğinde kalsın mı?
    - Kalırsa yararı: yeni telefona geçince ilerleme gelir.
    - Kalmazsa: iOS'ta `isExcludedFromBackup`, Android'de `allowBackup: false` ya da veri çıkarma kuralları.
    - **KARAR**; metin buna göre güncellenir.
13. **Ebeveyn kapısı.** Üç seçenekli soru rastgele dokunuşla 1/3 olasılıkla geçiliyor. Daha güçlü bir kapı düşünülmeli: örneğin rakamları yazmak ya da birden fazla adım.

**P2**

14. Gelecekteki "gelişim ekranı": veri minimizasyonu, ekranın yalnız telefonda mı yoksa sunucuda mı hesaplanacağı ve gizlilik metninin güncellenmesi bu özellikten **önce** yapılır.

---

## 5. İşletme sahibinden gereken bilgiler ve kararlar

Hepsi `src/site.ts` içinde. Boş kaldıkça üretim derlemesi durur.

**Kimlik ve yayın bilgileri**
- Veri sorumlusunun gerçek hukuki yapısı (şirket mi, şahıs mı), kayıtlı adı, adresi. Şirketse MERSİS ve KEP; şahıs işletmesinde neyin zorunlu olduğu hukukçuyla belirlenir.
- Gizlilik ve destek e-posta adresleri; alan adı ve doğrulaması.
- Yayın ülkeleri (yalnız Türkiye mi, AB ya da ABD de mi).

**Sağlayıcılar ve aktarım**
- Uygulama sunucusunun ve web sitesinin barındırma sağlayıcısı, ülkesi, günlük süresi.
- E-posta gönderim hizmeti: Supabase'in kendi gönderimi mi, kendi SMTP'niz mi?
- Supabase bölgesinin canlı ayardan doğrulanması (proje ekranında Frankfurt görünmüştü); veri işleme sözleşmesi (DPA).
- Expo ile ilişki ve rolü.
- Yurt dışı aktarım mekanizması. KVKK standart sözleşmesi imzalandıysa imza ve bildirim tarihleri. AB standart sözleşme maddeleri KVKK standart sözleşmesinin yerine geçmez.

**Saklama ve güvenlik**
- Saklama süreleri: kullanılmayan hesap, silme kaydı, sunucu günlükleri, destek yazışmaları, altyapı yedekleri.
- Yedek şifrelemesi ve anahtarı kimin tuttuğu.

**Ürün kararları**
- Fiyatlandırma.
- İşletim sistemi yedeklerinin (iCloud, Google) dahil edilip edilmeyeceği.
- Expo güncellemeleri için seçenek (4.7).
- Apple yaş bandı: "5 ve altı" ya da "6–8"; tek bant seçilebiliyor.
- Google hedef yaş grupları.

---

## 6. Hukuk uzmanının değerlendirmesi gereken konular

1. **Çocuğun ilerlemesinin ebeveyn hesabına yedeklenmesinin KVKK'daki dayanağı:** m.5/2-c (sözleşme) mi yeterli, yoksa açık rıza mı gerekir? Rıza gerekirse bunu kim verir ve nasıl kayda geçer?
2. **Hesapsız kullanımda IP adresi ve Expo kurulum kimliği:** meşru menfaat ve sözleşmenin ifası dayanağı uygun mu?
3. **Yurt dışı aktarım (KVKK m.9):** Supabase (AB, şirket ABD), Expo (ABD), Google ve Apple için mekanizma; 5 iş günü içinde bildirim yükümlülüğü.
4. **AB ya da ABD yayınlanırsa:**
   - GDPR m.8 kapsamı ve ülkelere göre yaş eşikleri.
   - Çocuk verisi için hukuki sebep ve şeffaflık.
   - COPPA kapsamında doğrulanabilir ebeveyn onayı yöntemi.
   - Kalıcı tanımlayıcıların iç operasyon istisnasının sınırı.
   - Yazılı saklama politikası ve yazılı güvenlik programı (FTC'nin 2025 değişiklikleri; uyum tarihi eCFR'den teyit edilmeli).
5. **Apple Kids 1.3:** Expo'ya giden kurulum kimliği ve IP "device information to third parties" sayılır mı?
6. **Google Families:** Google ve Apple ile girişin (OAuth) çocuklara yönelik uygulamada kullanılabilirliği.
7. **Şahıs işletmesi:** künye bilgileri (6563 sayılı Kanun, TTK 1524) ve VERBİS muafiyeti.
8. **Kullanım Koşulları:** tamamı; özellikle fiyat, cayma hakkı ve yetkili mahkeme.
9. **Mevzuata göre günlük saklama yükümlülüğü:** 5651 sayılı Kanun'un uygulanıp uygulanmadığı.

---

## 7. Yayını engelleyen açık maddeler

- `npm run build` → `scripts/check.mjs pre`: `src/site.ts` içindeki **38 eksik** madde (16 Kasım 2026).
- Sitede taslak işareti kalırsa → `check.mjs post` durdurur.
- Uygulama tarafı: P0 maddeleri 1–6 (silme, sıfırlama, geri yükleme, uygulama içi bağlantı, bilgilendirme ve onay). Bunlar yapılmadan "silinir" cümleleri ancak bugünkü sınırlarıyla yazılabiliyor. Site bu sınırları şu an açıkça yazıyor.
- Hukukçu onayı (`DECISIONS.legalReview`, `legalBasesReviewed`).

---

## 8. Mağaza beyanları için karşılaştırma listesi

Mağaza formlarındaki her cevap Gizlilik Politikası'yla ve yukarıdaki veri haritasıyla aynı olmalı.

**App Store gizlilik etiketi**

| Veri türü | Ne zaman | Kullanıcıya bağlı mı | Amaç | Takip |
|---|---|---|---|---|
| E-posta | Yalnız hesap açılırsa | Evet | Uygulama işlevi | Hayır |
| User ID | Hesap varsa | Evet | Uygulama işlevi | Hayır |
| Ürün etkileşimi (ilerleme) | Hesap varsa | Evet | Uygulama işlevi | Hayır |
| Cihaz kimliği (`EAS-Client-ID`, Expo) | Her kullanımda | — | **Hukukçuyla netleştirilecek** | — |

- Kids kategorisi: yaş bandı seçilecek; ebeveyn kapısı var. 1.3 riski: madde 4.7.

**Google Play Veri güvenliği**

| Kategori | Ne |
|---|---|
| Kişisel bilgiler | E-posta (isteğe bağlı) |
| Uygulama etkinliği | İlerleme (isteğe bağlı) |
| Cihaz veya diğer kimlikler | `EAS-Client-ID`: değerlendirilecek |

- Aktarımda şifreleme: evet. Üretim adresi HTTPS; uygulamanın `release-check`'i bunu zorunlu tutuyor.
- Silme talebi: evet. Uygulama içi yol ve web sayfası (`/hesap-silme`).
- Families: hedef yaş 5 ve altı / 6–8.
  - Reklam kimliği ve konum yok.
  - SDK'lar (expo modülleri, expo-updates) Families şartlarına göre gözden geçirilecek.
  - Google ile giriş (OAuth) değerlendirilecek.

**Ortak**
- Gizlilik politikasının adresi mağaza formunda ve uygulamanın içinde olmalı (madde 4.5).
- Politika herkese açık, ülke kısıtlamasız ve HTML olmalı. Site statik HTML.

---

## 9. Kaynaklar (16 Kasım 2026'da açıldı)

| Kaynak | Not |
|---|---|
| FTC, COPPA six-step compliance plan | Sayfa tarihi Mayıs 2026. Kalıcı tanımlayıcılar kişisel bilgi sayılıyor. Doğrudan bildirim ve çevrimiçi bildirim içerikleri, onay yöntemleri, yazılı saklama politikası ve yazılı güvenlik programı. Sayfa 2025 değişikliklerinin tarihlerini **göstermiyor**; tarihler eCFR ya da Federal Register'dan teyit edilmeli. |
| Apple Kids (developer.apple.com/kids) | Ebeveyn kapısı; "kids apps should not transmit personally identifiable information or device information to third parties … unless the parent explicitly consents"; yaş bantları 5 ve altı, 6–8, 9–11. |
| App Store Review Guidelines | 1.3; 5.1.1(i) ve (v); 5.1.4. "The parental gate requirement … is generally not the same as securing parental consent." |
| Google Play Families (9893335) | Toplanan çocuk verilerinin açıklanması; kimlik doğrulama bilgisi hassas veri sayılıyor; reklam kimliği ve konum yasağı; onaylı SDK; doğru hedef kitle beyanı. |
| Google Play User Data (10144311) | Politika içeriği, uygulama içi ve web üzerinden hesap silme, Veri güvenliği bölümünün doğruluğu. |
| Lingokids privacy policy (son güncelleme 18 Eylül 2026) | Bilgi mimarisi örnek alındı: özet, çocuk ve ebeveyn ayrımı, kalıcı tanımlayıcı tablosu, saklama süreleri, yedeklerde "beyond use". Metni kopyalanmadı; sertifikaları bize atfedilmedi. |
| Khan Academy Kids privacy policy (28 Aralık 2023) | Ebeveyn, çocuk ve okul ayrımı; çocuk için takma ad önerisi. |
| KVKK (kvkk.gov.tr) | Aydınlatma ve açık rıza rehberleri; standart sözleşme bildirim modülü (5 iş günü, Karar 2024/1793); KVKK Çocuk yayınları. |
| EUR-Lex GDPR | **İki adres de araçla boş döndü; madde 8 metni bu incelemede kaynaktan okunamadı.** Sitedeki özet bilinen resmî metne dayanıyor ve hukukçuyla teyit edilmeli. |

Rakiplerin sertifikaları (kidSAFE, PRIVO) ya da hukuki dayanakları GlotKids'e atfedilmedi.

---

## 10. Yapılan ve yapılamayan kontroller

**Yapılanlar**
- Mobil, sunucu ve panel kodunun salt okunur incelemesi; kanıtlar yukarıda.
- `npm run build:draft`: 13 sayfa derlendi, taslak işaretleri raporlandı.
- `npm run build` (üretim): **durdu** (çıkış kodu 1, 38 eksik madde). Eski `dist/` klasörü silindi.
- Kilit mantığı: alanlar örnek değerlerle doldurulunca eksik sayısı 0'a indi. `gizlilik@alanadi` ve `destek@example.com` reddedildi.
- Derlenen sitede `localStorage`, `sessionStorage`, `indexedDB` ve `document.cookie` geçmiyor; dışarıya istek giden bir adres yok.
- 13 sayfada iç bağlantılar ve çapalar: kırık yok.
- Telefon genişliğinde (390 px) dört sayfada taşma: yok. Ekran görüntüleriyle bakıldı; tarayıcı hatası yok.

**Yapılamayanlar**
- Canlı Supabase bölgesi, token süresi ve kayıt süreleri: canlı panele bakılmadı.
- Canlı sunucu, journald, yedek klasörü: üretim sunucusu henüz yok.
- Gerçek bir telefonda ağ trafiği kaydı (proxy): yapılmadı. Hesapsız akış koddan çıkarıldı.
- `EAS-Client-ID`'nin Android yolu yalnız dosya adıyla doğrulandı (`FileDownloader.kt`).
- Mobil ve sunucu testleri (`screentest`, `npm test`) çalıştırılmadı; o depolarda kod değişmedi.
- Bağımsız bir erişilebilirlik denetimi yapılmadı.
- EUR-Lex'ten GDPR madde 8 metni okunamadı.

---

## 11. Güncelleme (16 Kasım 2026, ikinci tur): iki dil, mağaza incelemecisi odaklı

- Site artık **İngilizce varsayılan**, Türkçesi `/tr/` altında. Her sayfanın karşılığı var; KVKK Aydınlatma Metni ve KVKK başvurusu yalnız Türkçe (Türk hukukuna özgü). `hreflang` bağlantıları alan adı girilince basılır.
- Metinler kısaltıldı: iç tablo adları, başlık adları (`EAS-Client-ID`), panel ayrıntıları ve "bilinen sınırlar" listeleri kamuya açık sayfalardan çıktı; bu ayrıntılar bu belgede.
- **Kamuya açık sayfalar uygulamanın yayın davranışını anlatır.** Bu davranışın bir kısmı henüz kodda yok; o yüzden `src/site.ts` → `APP` bayrakları yayın kilidine bağlandı. Her biri "yapıldı" olmadan `npm run build` durur:
  - `deletionSticks`, `backupDeletionInApp` (yedeği sil + yedeklemeyi durdur), `resetSticks`, `restoreReplaysDeletions`, `auditWithoutEmail`, `backupsEncryptedAndRotated`, `privacyLinkInApp`, `noticeBeforeAccount`, `updatesDecision`;
  - **yeni:** `reviewerUi` — yayın sürümünde şu an "Main", "Tek dersler", "Kategoriler" ve **"Onboarding"** sekmeleri görünüyor (`App.tsx` ~10319–10323, `__DEV__` koşulu yok). Onboarding çocuğa adını, yaşını ve kişiliğini soruyor (kaydetmeden). Apple 5.1.4 "apps may ask for birthdate and parental contact information only for the purpose of complying with these statutes" ve incelemecinin göreceği ilk ekranlar bakımından bu sekmeler yayından önce kaldırılmalı ya da yetişkin bölümüne alınmalı, onboarding soruları yeniden düşünülmeli. **KARAR**
- Erişilebilirlik ve ayrı çerez sayfaları kaldırıldı: erişilebilirlik ölçülmemiş iddialar taşıyordu; çerez bilgisi Gizlilik Politikası'nın "Bu web sitesi" bölümünde.
- Uygulamanın etiketleri sitede Türkçe asıllarıyla geçiyor ("Ebeveyn" → "Hesabı sil" → "Evet, sil"), İngilizce sayfada çevirisiyle; incelemeci uygulamayı Türkçe görecek.
- Kontrol: taslak 19 sayfa; iç bağlantı ve çapalar tam; her sayfanın `lang` etiketi doğru; İngilizce ve Türkçe Gizlilik, Hesap silme, Koşullar ve Ebeveynler sayfalarının bölüm kimlikleri birebir aynı; telefon genişliğinde taşma yok; üretim derlemesi duruyor.

---

## 12. Rakiplere göre doldurulan alanlar (16 Kasım 2026, üçüncü tur)

Kaynaklar 16 Kasım 2026'da açıldı: Lingokids, Sago Mini ve Toca Boca gizlilik politikaları.

| Alan | Rakipler | GlotKids (`src/site.ts`) |
|---|---|---|
| Kullanılmayan hesap | Lingokids 24 ay; Sago Mini 24 ay; Toca Boca son kullanımdan 2 yıl | 24 ay giriş ya da eşitleme yoksa; silmeden 30 gün önce e-posta |
| Sunucu ve hata kayıtları | Lingokids: hata kayıtları 90 gün, izler 30 gün | 30 gün |
| Giriş hizmetinin kayıtları | — | 30 gün (Supabase `auth.audit_log_entries` temizliği) |
| Destek yazışmaları | Toca Boca 1 yıl; Sago Mini 3 yıl | Talep kapandıktan sonra 1 yıl |
| Silme kaydı | Sago Mini: ayrılışın ardından 3 yıl (e-posta ve geçmiş için) | 3 yıl, e-posta adresi olmadan |
| Altyapı yedekleri | Lingokids: "beyond use", sırayla üzerine yazılır | 30 gün döngü |
| Silme talebi | Lingokids 30 gün | 30 gün (KVKK ile aynı) |
| Yurt dışı aktarım | Toca Boca ve Sago Mini: AB standart sözleşme maddeleri ve AB-ABD Veri Gizliliği Çerçevesi | KVKK m.9 standart sözleşmesi ve 5 iş günü içinde bildirim (AB maddeleri Türkiye için yerine geçmez) |
| Sağlayıcı rolü | Toca Boca ve Sago Mini: "yalnız talimatımızla işleyen"; giriş ve iş ortakları "kendi adına" | Supabase, Expo, barındırma ve e-posta hizmeti "bizim adımıza"; Google ve Apple "kendi adına da" |

**Bunlar taahhüttür.** Yayın kilidine iki madde eklendi:
- `APP.retentionJobs`: 24 aylık hesap işi ve e-posta, 30 günlük kayıt döngüsü, giriş kaydı temizliği, 3 yıllık silme kaydı temizliği, destek kutusu kuralı.
- `APP.transferContractsSigned`: sözleşmeler imzalandı ve bildirildi.

**Hâlâ işletme sahibinden gelecekler:**
- unvan, hukuki yapı, adres, MERSİS ve KEP, e-posta adresleri;
- alan adı;
- sunucu ve web sitesi barındırma sağlayıcısı ve ülkesi;
- e-posta gönderim hizmeti;
- yayın ülkeleri;
- fiyatlandırma;
- Supabase ve Expo'nun bölge ve sözleşme (DPA) kontrolü.

Hukukçu onayı ve uygulama düzeltmeleri de bekliyor.

---

## 13. Ebeveyn alanı ve oyun kayıtları (16 Kasım 2026)

Veri haritasına iki yeni satır ekleniyor:

| # | Veri | Kime ait | Ne zaman / amaç | Nereye gider | Saklama ve silme | Kanıt |
|---|---|---|---|---|---|---|
| D14 | Oyun oturumları: profil kimliği, kategori, oyun, durak, tür, başlangıç, bitiş şekli | Çocuk | Kategori içindeki her oyun ve şarkı; ebeveyn alanı için | **Yalnız telefon** (`Documents/progress/evidence.json`). Hesap yedeğine girmez | En çok 2500 oturum. Sıfırlama ("Başa dön" ya da ebeveyn alanı) o profilinkileri siler; uygulamayı silmek hepsini siler | `loplop/src/core/evidence.ts`, `src/platform/evidence.ts` |
| D15 | Cevaplanan sorular: kelime, ilk seçim doğru mu, yardım kullanıldı mı, cevap gösterildi mi, ses açık mıydı, kanıt türü | Çocuk | Ustalık oyunlarında, Piknik'te, Bul bakalım'da, Saklambaç'ta, Bavul'da ve Renkli toplar'da cevap verilince | Yalnız telefon | En çok 6000 cevap; silme D14 ile aynı | `loplop/src/ui/playScope.tsx` |

Sunucuda, panelde ve veritabanında değişiklik yok: kayıtlar hesap yedeğine eklenmedi. Bu yüzden sitedeki "hesap yedeği yalnız ilerleme belgesini içerir" cümlesi hâlâ doğru.

Gizlilik Politikası'nın "Cihazda" bölümü (İngilizce ve Türkçe) bu iki kaydı anlatıyor. Ana sayfadaki "Planlanıyor" bölümü artık uygulamadaki ebeveyn alanını anlatıyor.
