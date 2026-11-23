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

Adresler ve dil seçici: `src/i18n.ts`. İki dilin metni aynı dosyada ya da aynı bileşende
durur (`home-text.ts`, `content.ts`, `*Body.astro`); Hesap silme iki ayrı dosyadır ve bölüm bölüm aynı tutulur.

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

## Yasal sayfalar

Koşullar ve gizlilik, şirketin öbür uygulaması GlotCast'in sayfalarının yapısındadır
(glotcast.com/terms, /privacy; kullanıcı, 2026-11-20): global bir uygulama için on beş sade,
numaralı bölüm, sağlayıcılar kategoriyle, tek iletişim adresi (`src/site.ts` → `SITE.email`).
Ülkeye özel ek (KVKK aydınlatma, başvuru formu), "[Doldurulacak]" işaretleri ve yayını
durduran bilgi listesi kaldırıldı. Metinler GlotKids'in yaptığını söyler: çocuklar için,
reklamsız, analitiksiz, hesapsız çalışır. Uygulamaya satın alma, analitik ya da onboarding
cevaplarının kaydı eklenirse önce bu sayfalar değişir. `docs/GIZLILIK-INCELEMESI.md` eski
yaklaşımın araştırmasıdır; sayfalar artık ona bağlı değil.

