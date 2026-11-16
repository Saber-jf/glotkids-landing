# GlotKids web sitesi

GlotKids uygulamasının tanıtım sitesi ve yasal sayfaları. Astro ile derlenen
**statik** bir site: sunucu kodu, çerez, analitik ya da dışarıdan yüklenen
hiçbir şey yok (yazı tipleri dahil). `dist/` klasörü herhangi bir statik
barındırmaya (Cloudflare Pages, Netlify, kendi Caddy'niz…) olduğu gibi konur.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build        # ÜRETİM: src/site.ts eksik/doğrulanmamışsa DURUR, eski dist/ silinir
npm run build:draft  # TASLAK önizleme: dist-taslak/, her sayfada "TASLAK" bandı + noindex; yayımlanmaz
npm run assets     # uygulamanın görsellerini ../loplop'tan yeniden kopyalar
```

## Sayfalar (varsayılan İngilizce, Türkçesi /tr/ altında)

| İngilizce | Türkçe | Sayfa |
|---|---|---|
| `/` | `/tr/` | Ana sayfa |
| `/parents` | `/tr/ebeveynler` | Ebeveyn rehberi |
| `/faq` | `/tr/sss` | SSS |
| `/privacy` | `/tr/gizlilik` | Gizlilik Politikası |
| `/delete-account` | `/tr/hesap-silme` | Hesap ve veri silme (Google Play'in web silme sayfası) |
| `/terms` | `/tr/kullanim-kosullari` | Kullanım Koşulları |
| `/contact` | `/tr/iletisim` | İletişim |
| `/licenses` | `/tr/lisanslar` | Lisanslar |
| — | `/tr/kvkk-aydinlatma` | KVKK Aydınlatma Metni (yalnız Türkçe) |
| — | `/tr/basvuru` | KVKK veri sahibi başvurusu (yalnız Türkçe) |

Adresler ve dil seçici: `src/i18n.ts`. İki dilin metni aynı dosyada ya da aynı bileşende
durur (`home-text.ts`, `content.ts`, `*Body.astro`); Gizlilik ve Hesap silme iki ayrı dosyadır
ve bölüm bölüm aynı tutulur (bölüm kimlikleri aynı).

## Görseller nereden geliyor?

Hepsi uygulamanın kendisinden (`npm run assets`):

- Lili ve Kuki: uygulamanın Lottie dosyaları (`public/lottie/`). Sayfa onları
  uygulamadaki gibi **tek saatle** sürer; yürürken kare ve konum aynı andan
  okunur (`src/walk_gait.json`, `src/scripts/mascot.ts`), ayak kaymaz.
- Oyun ekranları: uygulamanın onboarding şeridi (`public/img/games/`).
- Film kareleri: Main filminden (`scripts/frames.swift`), kısa film onboarding'in filmi.
- Yazı tipleri: Fredoka TR + Nunito (OFL).

Uygulamanın içeriği değişince `src/content.ts` (dünyalar, kelimeler, SSS)
uygulamayla birlikte güncellenir; sitede uygulamada olmayan bir şey yazılmaz.

## Yayından önce doldurulacaklar

Tek kaynak `src/site.ts` (`SITE`, `CONTROLLER`, `PROVIDERS`, `DECISIONS`); `null` = bilinmiyor.
Sayfalar her boşluk için görünür bir "[Doldurulacak: …]" işareti basar, `npm run build`
eksikleri listeler ve durur. Bir sayfadan kelimeyi silmek bir bilgiyi doğrulamaz: kontrol
`src/site.ts`'i okur. Gizlilik incelemesi, veri haritası, mobil/sunucu planı ve mağaza
kontrol listesi: **`docs/GIZLILIK-INCELEMESI.md`**.

Eski özet liste:

- Şirket unvanı, açık adres, MERSİS, KEP, gizlilik ve destek e-postası, alan adı
- Sunucunun barındırma sağlayıcısı ve ülkesi; e-posta gönderim hizmeti
- Yurt dışı aktarım: Supabase (ve diğerleri) ile KVKK standart sözleşmesi, Kurum'a bildirim tarihi
- Saklama süreleri: kullanılmayan hesap, silme kaydı, sunucu kayıtları, destek yazışmaları
- Fiyatlandırma (Kullanım Koşulları §7)
- Geliştirici adının App Store / Google Play'dekiyle birebir aynı olması
- Kullanım Koşulları'nın hukukçu tarafından gözden geçirilmesi
