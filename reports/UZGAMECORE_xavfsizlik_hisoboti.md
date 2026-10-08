# Xavfsizlik Tekshiruvi Hisoboti — uzgamecore.uz

**Sana:** 2026-09-11 (1-bosqich: web sayt) / **2026-10-07 (2-bosqich: UZCore launcher ekotizimi — qo'shildi)**
**Maqsad:** https://uzgamecore.uz (IP: 216.24.57.1 / origin: 185.196.212.52) + UZCore launcher paketi (core-1.0.25.zip, UZLauncher.dll, UZCore.Shared.dll, UZRuntime.dll)
**Tekshiruv turi:** Tashqi (black-box) xavfsizlik auditi + launcher binar tahlili
**Umumiy baho:** O'rta-yuqori xavf darajasi — 1-bosqich: 1 HIGH, 2 MEDIUM; 2-bosqich: 2 HIGH, 2 MEDIUM, 2 LOW/INFO (batafsil: 6-bo'lim)

---

## 1. Arxitektura xulosasi

| Komponent | Topilgan qiymat |
|---|---|
| CDN/proksi | Cloudflare (CF-RAY, Server: cloudflare) |
| Xosting platforma | Render.com (`x-render-origin-server: Render`) |
| Backend | Node.js / Express (`x-powered-by: Express`) |
| Frontend | React SPA (minifikatsiyalangan JS, `/assets/index-*.js`) |
| DNS xizmati | ahost.uz (rdns1-3.ahost.uz) |
| Eski/hosting server | 185.196.212.52 — nginx, Exim 4.99.5, Dovecot, cPanel (2082–2087) |
| To'lov tizimlari | Payme, Paylov, Uzum (Click o'chirilgan) |
| SSL/TLS | TLS 1.3, Google Trust Services sertifikati (amal qiladi) |

**Ochiq portlar (origin 185.196.212.52):** 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 2082, 2083, 2086, 2087, 8443
**Ochiq portlar (Cloudflare 216.24.57.1):** 80, 443, 2082, 2083, 2086, 2087, 8080, 8443

---

## 2. Topilmalar (Xavf darajasi bo'yicha)

### 🔴 HIGH — /api/orders endpoint'i himoyasiz — PII (shaxsiy ma'lumot) oqishi

**Manzil:** `GET https://uzgamecore.uz/api/orders`
**Xavf:** Yuqori (CVSS ~7.5 — maxfiylik buzilishi)

**Tavsif:** Saytning "Taklif/buyurtma" shaklidan tushgan barcha yozuvlar autentifikatsiyasiz o'qiladi. Javob 43 ta yozuvni o'z ichiga oladi, har birida:
- `user_name` — real ism-familiya
- `user_phone` — haqiqiy telefon raqamlar (29 ta unikal raqam, masalan `+998944005565`, `+99820025057`, `+79650461825`)
- `details` — foydalanuvchining shaxsiy xabari
- `user_id`, `created_at`, `order_type`, `status` — ichki ma'lumotlar

**Dalil (takrorlash):**
```bash
curl -s https://uzgamecore.uz/api/orders | jq '.[0]'
# => {"id":1693, "user_name":"Sherzodbek", "user_phone":"910477744", "details":"...", ...}
```

**Nimasi xavfli:** Har qanday tashrif buyuruvchi saytdagi barcha foydalanuvchilarning ismi, telefon raqami va shaxsiy xabarlarini ko'ra oladi. Bu O'zbekiston Respublikasining "Shaxsiy ma'lumotlar to'g'risida"gi qonuniga (O'RQ-547) va GDPR tamoyillariga zid. Bundan tashqari `user_id` qiymatlari (12, 19, 43, 46, 72...209) orqali foydalanuvchi bazasi hajmini aniqlash mumkin (hujum qiluvchiga palet).

**Tavsiya:**
- `GET /api/orders` uchun autentifikatsiya + foydalanuvchi rolini tekshirish (faqat admin yoki o'z yozuvlari)
- "Taklif" shaklida telefon raqamini ixtiyoriy qilish yoki faqat admin/telegram orqali ko'rsatish
- Javobda PII maydonlarini minimallashtirish

---

### 🟠 MEDIUM — Origin server IP oshkor bo'lishi (Cloudflare bypass)

**Manzil:** SPF TXT yozuvi: `v=spf1 +a +mx +ip4:185.196.212.52 ~all`
**Xavf:** O'rta

**Tavsif:** DNS SPF yozuvi saytning haqiqiy origin manzilini (185.196.212.52) ochiq ko'rsatadi. Bu IP to'g'ridan-to'g'ri internetdan so'rovlarni qabul qiladi (Cloudflare himoyasidan tashqarida):
- Port 80/443 → nginx (uzgamecore.uz uchun 502 — eski vhost qoldig'i)
- Port 25/465/587 → Exim 4.99.5 SMTP (banner orqali versiya oshkor bo'ladi)
- Port 110/143/993/995 → Dovecot IMAP/POP3
- Port 2082–2087 → cPanel/WHM boshqaruv panellari
- Port 8443 → Apache

**Nimasi xavfli:** Hujum qiluvchi Cloudflare'ni chetlab o'tib, origin serverni to'g'ridan-to'g'ri hujum qilishi mumkin (brute-force, DoS, xizmat versiyalarini ekspluatatsiya qilish). Bundan tashqari `x-render-origin-server: Render` sarlavhasi infrastruktura haqida qo'shimcha ma'lumot beradi.

**Tavsiya:**
- SPF yozuvidan keraksiz `+ip4` ni olib tashlash, faqat hozirgi ishlatilayotgan serverlarni qoldirish
- Origin serverda faqat kerakli portlarni o'chirish (cPanel/WHM portlarini tarmoq darajasida cheklash)
- Cloudflare'da origin serverga faqat Cloudflare IP'laridan kirishga ruxsat berish
- `x-powered-by: Express` sarlavhasini o'chirish (`app.disable('x-powered-by')`)

---

### 🟠 MEDIUM — Login endpoint'ida rate-limiting yo'q (brute-force xavfi)

**Manzil:** `POST https://uzgamecore.uz/api/auth/login`
**Xavf:** O'rta

**Tavsif:** 6 ta ketma-ket noto'g'ri login urinishi amalga oshirildi — barchasi 401 qaytardi, lekin **hech qanday** 429 (Too Many Requests), `Retry-After`, `RateLimit-*` sarlavhasi yoki vaqt kechikishi bo'lmadi. Taqqoslash uchun: registratsiya endpoint'ida 4-5 urinishdan keyin 120 daqiqalik blokirovka ishlaydi.

**Nimasi xavfli:** JWT asosidagi autentifikatsiya + kuchli parol siyosatisiz foydalanuvchi hisoblarini brute-force bilan buzish mumkin.

**Tavsiya:**
- Login uchun IP va email asosidagi rate-limiting (masalan, 5 urinishdan keyin blok)
- `express-rate-limit` kabi kutubxona yoki Cloudflare Rate Limiting qoidasi
- 2FA/Telegram login imkoniyatini tavsiya qilish

---

### 🟡 LOW — Xavfsizlik sarlavhalari (Security Headers) yetishmovchiligi

**Manzil:** Barcha sahifalar
**Xavf:** Past

**Mavjud (yaxshi):** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`
**Yo'q:**
- `Content-Security-Policy` (CSP) — yo'q
- `X-Frame-Options` / `frame-ancestors` — bosh sahifada yo'q (clickjacking xavfi ochiq)
- `Permissions-Policy` — yo'q

**Tavsiya:** CSP sarlavhasini qo'shish (`default-src 'self'`), `X-Frame-Options: DENY` (agar iframe kerak bo'lmasa) va `Permissions-Policy` o'rnatish.

---

### 🟡 LOW — MX/DNS sozlamalari mos kelmasligi

**Tavsif:** `MX preference = 0, mail exchanger = uzgamecore.uz` — MX yozuvi Cloudflare proxysi ortidagi A yozuvga ishora qiladi (216.24.57.1). Cloudflare HTTP portlarini proksi qiladi, 25/587 portlarini emas — natijada pochta yetkazib berish buzilgan yoki SPF/MX mos kelmasligi yuzaga kelgan. SPF `~all` (softfail) bilan tugaydi.

**Tavsiya:** Pochta xizmati aynan qayerda joylashganini aniqlab, MX'ni to'g'rilash (masalan, `mail.uzgamecore.uz` alohida A yozuv bilan), DMARC yozuvini qo'shish.

---

### 🟡 LOW/INFO — Boshqa kuzatuvlar

| № | Topilma | Tavsif |
|---|---|---|
| 1 | `/api/health` ochiq | `{"service":"uzgamecore-server","db":"ok","uptimeSeconds":...}` — uptime xizmat restarti chastotasini oshkor qiladi (free Render sleep rejimi) |
| 2 | `/api/stats/visitors` ochiq | Tashriflar soni (12 256) — kichik ma'lumot oqishi |
| 3 | `/api/payment-methods` ochiq | To'lov providerlar holati — past xavf |
| 4 | Google site-verification token | HTML'da oshkor, past xavf |
| 5 | Telefon demo raqami `998901234567` | JS'da hardcode qilingan (ehtimol namuna) |

---

## 3. Ijobiy natijalar (topilmagan zaifliklar)

Tekshiruv davomida quyidagi yo'nalishlar **xavfsiz** ekani tasdiqlandi:

| Tekshiruv | Natija |
|---|---|
| SQL-injection | Cloudflare WAF aniq payload'larni 403 bilan bloklaydi (`OR 1=1`, `SLEEP(5)`); parametrlar xavfsiz ishlanadi |
| Path traversal (`../etc/passwd`) | Cloudflare 400 — bloklanadi |
| Reflected XSS | SPA sababli server tomonida aks etish yo'q |
| Yuklab olish endpoint'lariga ruxsatsiz kirish | `POST /api/games/{id}/download-file` tokensiz 401 qaytaradi |
| Admin API | `/api/admin/*`, `/api/db/backup`, `/api/settings` — barchasi 401 |
| Buyurtma yaratish | `POST /api/orders` — 401 (auth talab qilinadi) |
| Telefon registratsiya spami | 429 blokirovka ishlaydi (120 daqiqa) |
| Hardcode kalitlar (API key, JWT secret) | JS faylida topilmadi |
| TLS konfiguratsiyasi | TLS 1.3, to'g'ri sertifikat, HSTS o'rnatilgan |
| HTTP → HTTPS | To'g'ri 301 redirect |

---

## 4. Umumiy tavsiyalar (Xavf kamaytirish rejasi)

1. **Zudlik bilan:** `/api/orders` GET endpoint'ini yopish yoki faqat admin + o'z yozuvlariga cheklash (yuqori xavf).
2. **Tez orada:** Login rate-limiting o'rnatish; SPF yozuvini tozalash; origin serverda cPanel/mail portlarini cheklash.
3. **Rejada:** CSP, X-Frame-Options qo'shish; `x-powered-by` ni o'chirish; MX/DMARC sozlamalarini tuzatish; muntazam to'liq pentest (ichki kod tahlili bilan).

---

## 5. Texnik ma'lumot (Tavsif uchun)

```
TARGET: uzgamecore.uz
A:      216.24.57.1 (Cloudflare)
NS:     rdns1.ahost.uz / rdns2.ahost.uz / rdns3.ahost.uz
MX:     uzgamecore.uz (0)
SPF:    v=spf1 +a +mx +ip4:185.196.212.52 ~all
Origin: 185.196.212.52 (ahost.uz — nginx/Exim 4.99.5/Dovecot/cPanel)
Render: uzgamecore.onrender.com / uzgamecore-server.onrender.com (Cloudflare CDN ortida)
```

*Ushbu hisobot avtorizatsiya qilingan xavfsizlik tekshiruvi doirasida tayyorlandi. Topilmalarni takrorlash faqat sayt egasining ruxsati bilan amalga oshirilishi kerak.*

---

# 6-bosqich (2026-10-07): UZCore Launcher Ekotizimi — OAuth va DRM tekshiruvi

**Qamrov:** core-1.0.25.zip launcher paketi, UZLauncher.dll / UZCore.Shared.dll / UZRuntime.dll dekompilyatsiya tahlili, `/api/v1/*` launcher API endpoint'lari, test hisobi (id 292, `secprobe.tg1@example.com`) orqali autentifikatsiyalangan testlar.

## 6.1 Launcher autentifikatsiya arxitekturasi (aniqlangan)

| Qadam | Endpoint | Natija |
|---|---|---|
| 1 | `POST /api/v1/oauth/authorize` (web JWT + PKCE S256 + device_id GUID) | `redirect_to` ichida bir martalik `code` |
| 2 | `POST /api/v1/oauth/token` (grant_type=authorization_code + code_verifier + device_fingerprint) | ES256 runtime token (10 daqiqa, aud=`uzcore-runtime`, scope: `licenses:read runtime:key runtime:report`) |
| 3 | `GET /api/v1/metadata/{pid}` | Build metadata (container_id, ciphertext_sha256) |
| 4 | `POST /api/v1/runtime/key` (RSA-3072 public key) | RSA-OAEP-256 bilan shifrlangan `encrypted_content_key` |
| 5 | Lokal decrypt | 64-bayt content key (konteyner shifriga kalit) |

Binar tahlil (UZRuntime.dll) tasdiqladi: `runtime_public_key` — **RSA-3072 SPKI PEM** (EC kalitlar 400 INVALID_KEY_REQUEST beradi); javob `RSA-OAEP-256` bilan shifrlanadi; content key 64 bayt (AES-256 kalit + HMAC/ikkinchi kalit juftligi).

## 6.2 🔴 HIGH — Runtime token zanjiri launcher'siz to'liq takrorlanadi; device_fingerprint server tomonida tekshirilmaydi

**Manzil:** `POST /api/v1/oauth/token` → `device_fingerprint` maydoni
**Xavf:** Yuqori (DRM himoyasining butun ishonch zanjiri buziladi)

**Tavsif:** Launcher'da `device_fingerprint = SHA256("UZCORE-DEVICE-V1\0" + MachineGuid + "\0" + InstallSecret)` (DeviceIdentity.cs). Biroq server bu qiymatni **tekshirmaydi**: ixtiyoriy 64-hex satr (masalan `SHA256(random)`) 200 OK bilan qabul qilinadi va token beradi. Qurilma bog'lash faqat **client tomonidan tanlangan** `device_id` GUID orqali amalga oshadi (boshqa GUID → 409 `DEVICE_OWNERSHIP_CONFLICT`).

**Dalil (uzc_oauth_out.txt, uzc_map_out.txt):**
```http
POST /api/v1/oauth/token
{"grant_type":"authorization_code","code":"...","code_verifier":"...",
 "client_id":"uzlauncher","redirect_uri":"http://127.0.0.1:53472/callback",
 "device_fingerprint":"<ixtiyoriy-64-hex>"}   → 200 + access_token
```

**Nimasi xavfli:** Web JWT olgan har qanday foydalanuvchi (brauzer sessiyasi) launcher bo'lmagan muhitda (Linux, VM, skript) runtime token olib, key-release zanjirini to'liq o'ynatishi mumkin. Qurilma cheklovi (device binding) faqat sharmoni — server tomonida kriptografik bog'lanish yo'q.

**Tavsiya:** `device_fingerprint` ni server tomonida `device_id` bilan bog'lab saqlash va keyingi so'rovlarda tekshirish; InstallSecret ni serverga ro'yxatdan o'tkazish (enrollment) modeliga o'tish; runtime token ichiga `device_id` claim kiritib, `/api/v1/runtime/key` da tekshirish.

## 6.3 🔴 HIGH — Bepul mahsulotlar uchun content-key release zanjiri launcher'siz to'liq isbotlandi

**Manzil:** `POST /api/v1/runtime/key`
**Xavf:** Yuqori (DRM modelining server-side sirlari client nazoratiga o'tadi)

**Tavsif:** Test hisobi uchun ruxsat etilgan (free_login) 3 ta mahsulot uchun konteyner shifr kaliti **launcher dasturisiz, toza HTTP so'rovlari bilan** olindi va RSA-OAEP-256 orqali muvaffaqiyatli decrypt qilindi:

| pid | O'yin | container_id | content key (sha256) |
|---|---|---|---|
| 2 | Mount & Blade 2 Bannerlord | `7fe2ed64-2d10-4a52-b814-d8c33d2339fa` | `88c0292c...02757ee` |
| 19 | Creepy Tale | `277c447b-94bb-4757-8ce9-f32eecdb5629` | `2fe5f7ab...fffe7b3` |
| 23 | Creepy Tale 2 | `e4599ed9-254f-4bb5-8e29-0e654049aa89` | `ecb48ce2...3cb45e` |

**Dalil (uzc_key_success_2/19/23.json, uzc_key2_out.txt):**
```http
POST /api/v1/runtime/key
{"container_id":"7fe2ed64-...","product_id":2,"source_game_id":null,
 "ciphertext_sha256":"970653769717d9afddb0c805361b1faec516cc7ecfdaf0f466e1ab9d7c72841a",
 "runtime_public_key":"-----BEGIN PUBLIC KEY-----\nMIIBojAN..."}
→ 200 {"algorithm":"RSA-OAEP-256","encrypted_content_key":"...","expires_in":60}
```
Decrypt: `RSA-OAEP(SHA-256)` bilan → 64 baytlik content key.

**Nimasi xavfli:** DRM'ning "server-only" qismi (kalit berish) oddiy HTTP kliyenti bilan to'liq takrorlanadi. Hozircha faqat hisobga ruxsat etilgan (free_login) mahsulotlar — lekin zanjir arxitekturasi to'langan mahsulotlarga ham qo'llaniladi (pastda gating mustahkamligi tasdiqlandi). Konteyner fayllari `t.me/uz_filtr_fayl_bot` Telegram boti orqali tarqatiladi — bot orqali konteyner olib, kalit bilan ochish imkoniyati mavjud (bu yakuniy qadam test muhitida Telegram hisobi yo'qligi sababli bajarilmadi).

**Tavsiya:** Konteyner kalitlarini kontentga bog'lab (per-container unikal), runtime/key ni faqat haqiqiy launcher runtime jarayonidan (masalan, attestation) kutish; `expires_in:60` qiymatini server tomonida bir martalik qilib, qayta so'rovni limitlash; kalit berish loglarini anomal tahlil qilish.

## 6.4 🟠 MEDIUM — Launcher katalogi + ichki ma'lumotlar oqishi (`/api/v1/launcher/games`)

**Manzil:** `GET /api/v1/launcher/games` (runtime token bilan)
**Xavf:** O'rta

**Tavsif:** Endpoint 59 ta o'yinning to'liq katalogini qaytaradi, jumladan **to'langan** o'yinlar uchun ham:
- `product_id` (license namespace mapping: Outlast→pid 6, RE Village→pid 9, KC:D2→pid 277754)
- ichki yo'llar (`..\\..\\Game.exe`, `container_path: ..\\..\\game-4.uzcore`), engine/adapter nomlari
- tarqatish linklari: 58 ta yozuv → `https://t.me/uz_filtr_fayl_bot?start=<slug>` (Outlast→`outlast`, RE8→`re8`, RDR2→`rdr2`...)
- `has_active_build: true` — qaysi o'yinlarga build mavjudligi

**Nimasi xavfli:** Tokenga ega har qanday foydalanuvchi biznes-ma'lumotlarni (build xaritasi, tarqatish kanali, ichki pid namespace) oladi; Telegram bot start-slug'lari orqali konteyner tarqatish tizimi xaritasi oshkor bo'ladi.

**Tavsiya:** Katalogda faqat litsenziya egaligi tasdiqlangan yozuvlarni qaytarish yoki paid yozuvlardan `product_id`/`download_url` maydonlarini yashirish.

## 6.5 🟠 MEDIUM — Registratsiya rate-limit X-Forwarded-For bypass

**Manzil:** `POST /api/auth/register`
**Xavf:** O'rta

**Tavsif:** Registratsiyadagi 120-daqiqalik 429 blokirovka IP asosida, lekin server **X-Forwarded-For sarlavhasiga ishonadi**: har so'rovda yangi soxta XFF qiymat yuborib blokirovka chetlab o'tiladi (dalil: 2026-09-11 sessiyasi, `regtest_out.txt`). Bu bulk hisob yaratish, SMS/telegram spam va resurs xarajatiga olib keladi. Login endpoint'ida umuman rate-limit yo'q (2.3-bo'lim).

**Tavsiya:** Express `trust proxy` ni faqat haqiqiy proksi IP'lariga sozlash; XFF'ni faqat Cloudflare IP'laridan qabul qilish; Cloudflare Rate Limiting qoidasini qo'shish.

## 6.6 🟡 LOW/INFO — Qo'shimcha kuzatuvlar

| № | Topilma | Tavsif |
|---|---|---|
| 1 | `GET /api/v1/metadata/{pid}` build metadata oqishi | Tokenga ega har kim bepul mahsulotlar uchun `container_id` + `ciphertext_sha256` oladi (bu qiymatlar runtime/key uchun "sir" vazifasini bajaradi lekin metadata'dan o'qiladi) |
| 2 | Qurilma boshqaruvi endpoint'lari | `GET /api/v1/account/devices` + `DELETE /api/v1/account/devices/{id}` — web JWT bilan ishlaydi (o'z sessiyalarini o'chirish; funksiya to'g'ri, lekin rate-limit tekshirilmagan) |
| 3 | `POST /api/games/{id}/download-file` | Bepul o'yin uchun ham 403 `TELEGRAM_MEMBERSHIP_REQUIRED` (@UZGAMECORE kanal a'zoligi talabi — zaif biznes-qoida, lekin himoya sifatida samarali emas) |
| 4 | UZRuntime `DangerousAcceptAnyServerCertificateValidator` | UZRuntime.dll TLS sertifikat validatsiyasini o'chirib qo'ygani dekompilyatsiyada ko'rindi — MITM pozitsiyasidagi hujumchiga runtime token va kalitlarni ushlash imkonini beradi |
| 5 | OAuth code bir martalik | Replay → 400 `INVALID_GRANT` (musbat) |

## 6.7 Ijobiy natijalar (2-bosqich — gating mustahkam)

| Tekshiruv | Natija |
|---|---|
| To'langan mahsulot litsenziya tekshiruvi | pid 6/9/277754 → `licenses/verify` 403 `LICENSE_REQUIRED` ("Bu mahsulot sotib olinmagan") |
| To'langan mahsulot metadata | `metadata/6` (± `source_game_id`) → 403 `LICENSE_REQUIRED` |
| runtime/key litsenziyadan tashqari | to'langan pid + har qanday container_id → 403 `LICENSE_REQUIRED` (litsenziya tekshiruvi container qidiruvidan OLDIN bajariladi) |
| ciphertext hash bog'lanishi | to'g'ri pid+container, xato hash → 403 `BUILD_NOT_AUTHORIZED` |
| `tools/authorize` | web va runtime tokenlar bilan → 401 `TOOL_TOKEN_INVALID` (ichki UZPack credential bilan ajratilgan) |
| Web JWT bilan /api/v1/* | 401 `INVALID_ACCESS_TOKEN` — runtime token alohida tur (aud=`uzcore-runtime`) |
| container_id GUID | taxmin qilib topib bo'lmaydi (to'langan mahsulotlar metadata 403 sababli GUID oshkor emas) |

## 6.8 Tavsiyalar (2-bosqich)

1. **Zudlik bilan:** `device_fingerprint` server-side validatsiyasi (6.2); runtime/key uchun bir-martalik/limit qo'shish va anomal monitor (6.3).
2. **Tez orada:** `/api/v1/launcher/games` javobini litsenziya bo'yicha filtrlash (6.4); XFF trust proxy tuzatish (6.5); UZRuntime'da TLS pinning (6.6-4).
3. **Rejada:** Runtime jarayon attestatsiyasi (masalan, konteyner kalitini runtime'dan so'rovda imzolash), runtime/key logging + anomaly detection, Telegram bot tarqatish zanjirida konteyner hash'ini saytda tekshiriladigan qilib e'lon qilish.

---

**Texnik dalil fayllari (2-bosqich):** `uzc_oauth_exploit.py`, `uzc_runtime_key2.py`, `uzc_paid_gate.py`, `uzc_key_success_2/19/23.json`, `uzc_key2_out.txt`, `uzc_paid_gate_out.txt`, `uzc_map_out.txt`, `v1_games_full.json`, `uzc_metadata.json`
---

# 7-bosqich (2026-10-07): Chuqur test — OAuth lifecycle, runtime/key, runtime/report, device boshqaruvi, updates kanallari

**Metod:** 3 ta avtonom Python probe: `uzc_deep3_probe.py` (S0–SE, ~320 so'rov, 92s), `uzc_deep3b_probe.py` (updates tashxis + XSS rename + device revokatsiya, 1.1s), `uzc_final_probe.py` (fp-gipoteza + paket tasdiqlash, 8s). Barchasi test hisobi (user 292) va device1 (BOUND) orqali; DEEP-3b o'zgarishlari qaytarilgan (device nomi "HP" ga tiklandi, binding qayta authorize bilan tiklandi).

## 7.1 🔴 HIGH — `runtime/key` statik kalit: bir marta extract = abadiy offline decrypt; rate-limit YO'Q

2-bosqichda (6.3) content-key release zanjiri launcher'siz isbotlangan edi. Chuqur test qo'shimcha zaifliklarni tasdiqladi:

| Test | Natija |
|---|---|
| pid2 kalit qayta so'ralganda (replay x3, har safida yangi ephemeral RSA) | **Xuddi shu kalit** qaytadi — `sha256=88c0292c003da8b1…` (64 bayt) |
| Boshqa ephemeral RSA-2048 kalit bilan so'rov | Xuddi shu content kalit → kalit **statik** (pid+container bog'langan, sessiyaga bog'liq emas) |
| RSA-1024 public key | 400 (faqat RSA-2048 qabul) |
| container(2) + product_id=19 | 403 `BUILD_NOT_AUTHORIZED` (pid↔container hash bog'lanishi ishlaydi) |
| source_game_id=3 (boshqa o'yin) | 403 `LICENSE_REQUIRED` (binding ishlaydi) |
| Burst x10 ketma-ket so'rov | **Hammasi 200, 429 yo'q** — rate-limit yo'q |

**Impact:** Attacker bir marta litsenziya bilan kalit olgach, uni doimiy saqlaydi — konteyner offline decrypt uchun kalit hech qachon eskirmaydi (rotatsiya yo'q). Rate-limit yo'qligi kalitni cheksiz extract qilish va API'dan foydalanish uchun bepul. Bu 6.3 dagi zanjirni yanada osonlashtiradi: launcher'siz to'liq DRM bypass uchun bitta so'rov yetarli bo'lgach, kalit abadiy qo'lida qoladi.

## 7.2 🟠 MEDIUM — `runtime/report` validatsiya yo'q: har qanday ma'lumot qabul qilinadi

| Payload | Natija |
|---|---|
| Baseline to'g'ri report | 202 `accepted:true` |
| **To'langan** mahsulot (pid6) reporti (litsenziya yo'q) | 202 — litsenziya tekshiruvi umuman yo'q |
| SQLi string (`'; DROP TABLE--`) barcha string maydonlarda | 202 |
| `adapter_id` = `../../etc/passwd` | 202 |
| `runtime_version` = 5KB string | 202 |
| `status` = integer (string o'rniga) | 202 (type validation yo'q) |
| `status` = `\x00` | **500 INTERNAL_ERROR** |
| `product_id` = -1 / 999999 | **500** |
| Spam x5 | hammasi 202, rate-limit yo'q |
| Empty body | 400 `INVALID_RUNTIME_REPORT` (faqat bu ishlaydi) |

**Impact:** Telemetriya ma'lumotlarini ifloslantirish (data poisoning), backend xatolar (500) provokatsiyasi, cheksiz spam. `202 accepted` har qanday kiruvchi uchun — server-side schema/sanitizatsiya yo'qligi katta ehtimol bilan injectable storage'ga olib boradi (SQLi stringlar 202 bilan "qabul" qilinadi, saqlanish holati tekshirilmadi).

## 7.3 🟠 MEDIUM — Eski core paketlar ommaviy: authsiz downgrade yuklab olish

`/uzcore-updates/*` statik xizmat litsenziya/auth tekshiruvisiz:

| Fayl | HEAD | Hajm |
|---|---|---|
| `/uzcore-updates/stable/packages/core-1.0.23.zip` | 200 | 94,402,494 B |
| `/uzcore-updates/stable/packages/core-1.0.24.zip` | 200 | 94,402,497 B |
| `/uzcore-updates/stable/packages/core-1.0.25.zip` (control — hozirgi) | 200 | 94,402,886 B |
| `core-1.0.26.zip`, `beta/...` | 200 lekin text/html 3259 B (SPA fallback — fayl yo'q) | — |
| `/uzcore-updates/stable/manifest.json` | 200, application/json, 420 B (public) | — |
| Path traversal (`../`) | SPA fallback (bloklangan) | — |

Ranged GET bilan tasdiqlandi: `core-1.0.23.zip` → **206 Partial Content, magic `PK\x03\x04`** — haqiqiy ZIP, authsiz to'liq (94.4 MB) yuklanadi.

**Impact:** (1) Eski versiyalar arxivda saqlanadi — eski (zaif) runtime versiyasini yuklab reveres-engineering qilish va hozirgi versiyadagi tuzatilgan zaifliklarni qayta tiklash (patch-diff) imkoniyati; (2) downgrade hujumi: launcher'ni eski versiyaga tushirish; (3) bandwidth suiiste'qollik. `manifest.json` public bo'lgani uchun attacker to'liq versiya xaritasini oladi.

## 7.4 🟡 LOW — `device_name` stored XSS: payload xom saqlanadi va qaytadi

`authorize` so'rovida `device_name="<img src=x onerror=alert(1)>-DEEP3"` yuborilganda:

- `GET /api/v1/account/devices` javobida payload **xom (escaped emas)** qaytadi: `"name":"<img src=x onerror=alert(1)>-DEEP3"` — server-side saqlashda ham, chiqarishda ham encode yo'q.
- Bir qurilma-politika tufayli yangi qurilma bilan test qilib bo'lmadi (409 `DEVICE_OWNERSHIP_CONFLICT`), shuning uchun rename orqali sinovdan o'tkazildi va darhol "HP" ga tiklandi (qaytarildi).

**Impact:** API o'zida HTML kontekst yo'q; exploitable bo'lishi uchun payload'ni xom render qiladigan sirt kerak (launcher ichki web view, admin panel, dashboard). Render sirti aniqlanmagan — shuning uchun LOW; agar bunday sirt topilsa, MEDIUM/HIGH ga ko'tariladi. Har holda input validation yo'qligi mustahkam.

## 7.5 ℹ️ INFO — `/api/v1/updates` anomaliya: 401 "Runtime avtorizatsiyasi yaroqsiz" (server tomon o'zgarish gumonlanadi)

2-bosqichda xuddi shunday runtime token bilan `/api/v1/updates?channel=stable` **200** qaytargan (versiya 1.0.25, sha256, ECDSA signature — `uzc_oauth_out.txt` [6]). Hozirda esa:

| Variant | Natija |
|---|---|
| Yangi authorize-derived AT | 401 |
| refresh-derived AT | 401 |
| Device DELETE'dan keyin tiklangan zanjir | 401 |
| Launcher'ning haqiqiy device_fingerprint bilan yaratilgan sessiya | 401 |
| Tasodifiy fp sessiya (control) | 401 |
| WEB token | 401 (xuddi shu xabar) |
| `X-UZCore-Runtime-Version` sarlavha / `current_version` param | 401 |
| Control: `licenses/verify` xuddi shu token bilan | **200** (token valid) |
| Control: `products/purchased` | 401 (updates bilan birgalikda bloklangan) |

Dekompilyatsiya qilingan runtime/launcher kodida maxsus `User-Agent` yoki `X-UZ*` sarlavhasi topilmadi; ikkala probe ham bir xil urllib UA ishlatgan. **Xulosa:** token turini, fp'ni, freshness'ni, sarlavhalarni inkor etamiz — 401 server-side o'zgarish yoki biz kuzatolmaydigan qo'shimcha talab (masalan, client attestation/HMAC) bilan izohlanadi. Verifikatsiya endpointi bir xil tokenni 200 bilan qabul qilgani uchun bu endpoint-specific. Kuzatuv sifatida qayd etildi; dev bilan tekshirish tavsiya etiladi.

**Qo'shimcha kuzatuv (A7):** refresh qaytargan AT ning `iat/exp` original AT bilan **bir xil** (faqat `jti` yangilanadi) — sessiya qat'iy 600 soniyalik oyna, refresh umrini uzaytirmaydi. Bu ijobiy qattiqlik (token replay oynasi cheklangan).

## 7.6 ℹ️ INFO — `redirect_uri` porti tekshirilmaydi (RFC 8252 nuqtai nazaridan)

- `http://127.0.0.1:9999/callback` (ro'yxatda yo'q port) → authorize **200** + token exchange **200** — token berildi.
- Trailing slash, `https://`, boshqa host (`evil.example`) → 400 `INVALID_AUTHORIZATION_REQUEST`.

Qat'iy RFC 6749 exact-match talab qilinsa bu og'ish; ammo RFC 8252 (OAuth for Native Apps) §7.3 loopback redirect'larda o'zgaruvchan portni **ataylab ruxsat etadi**. Native app'lar uchun moslashuvchan loopback port standart amaliyot. Qolgan qat'iylik (host/scheme) to'g'ri. Xavf: past — faqat loopback; local port-binding race uchun PKCE verifier ham kerak.

## 7.7 Ijobiy natijalar (3-bosqich — himoyalar ishlaydi)

| Tekshiruv | Natija |
|---|---|
| Refresh token rotatsiyasi/revokatsiyasi | Eski R1, R2 qayta ishlatish → 400 `INVALID_GRANT` (RT qisqa TTL yoki rotatsiya-revokatsiya ishlaydi) |
| Scope in'eksiya (`refresh` + `scope=admin:all offline_access`) | 200, lekin scope o'zgarmaydi — server scope'ni sessiyadan oladi |
| Device DELETE → token revokatsiya | AT darhol o'lgan: `verify` → 401 `SESSION_REVOKED`; RT refresh → 400 `INVALID_GRANT`; device yozuvi soft-delete (`revoked_at`, `is_active:false`) |
| Device DELETE'dan keyin tiklash | `authorize` bilan binding darhol tiklanadi, yangi zanjir verify 200 (operatsion davomiylik OK) |
| DELETE IDOR | Tasodifiy UUID → 400 `INVALID_DEVICE_ID` (boshqa foydalanuvchi device'ini o'chirib bo'lmaydi) |
| PKCE | `plain` method → 400; `code_challenge` yo'q → 400 (faqat S256) |
| `client_id` whitelist | Barcha fuzz qiymatlar → 400 |
| Authsiz authorize | 401 `WEBSITE_AUTH_REQUIRED` (WEB JWT majburiy) |
| Bir qurilma-politika | Ikkinchi device → 409 `DEVICE_OWNERSHIP_CONFLICT` |
| `tools/authorize` izolyatsiyasi | 8 xil token variant (Bearer AT, tool_token/token body, X-UZPack-Token, UZPack scheme, WEB JWT) → hammasi 401 `TOOL_TOKEN_INVALID` |
| License sweep 43..300 | 403 ×258 — 42 dan keyin hech qanday free/licensed pid yo'q (free pids: 1,2,3,5,7,19,21,23,24,26,36,38,40,42; konteynerli: 2,19,23) |
| `account/devices` API | GET faqat o'z device'larini qaytaradi; tokenlar valid bo'lsa 200 |

## 7.8 Tavsiyalar (3-bosqich)

1. **Zudlik bilan:**
   - `runtime/key` uchun kalit rotatsiyasi (pid+container per-version) va jiddiy rate-limit + anomaly detection (7.1). Statik kalitni bir-martalik nonce bilan shifrlash yoki server-side KMS'ga ko'chirish.
   - `runtime/report` JSON schema validatsiyasi (maydon turlari, uzunliklar, enum), litsenziya bog'lanishi va rate-limit (7.2); `\x00`/chunki qiymatlar uchun 500 o'rniga 400.
2. **Tez orada:**
   - Eski core paketlarni public statik xizmatdan olib tashlash yoki signed-URL/auth bilan himoyalash; manifest'ni ham shifrlash (7.3). Eski versiyalarni saqlash kerak bo'lsa — origin'da, CDN'siz.
   - `device_name` uchun kirishda sanitizatsiya/uzunlik cheklovi va chiqarishda kontekstga mos encoding (7.4).
   - `/api/v1/updates` 401 holatini dev bilan tekshirish — regression yoki hujjatlanmagan talab (7.5).
3. **Rejada:** content-key uchun server-side usage logging (qidirilgan pid/container auditlari), eski paket versiyalarida mavjud zaifliklarni audit qilish (downgrade xavfini baholash), device_name render sirtlarini (launcher UI/admin) XSS tekshiruvidan o'tkazish.

---

**Texnik dalil fayllari (3-bosqich):** `uzc_deep3_probe.py` + `uzc_deep3_out.txt` (S0–SE, ~320 so'rov), `uzc_deep3b_probe.py` + `uzc_deep3b_out.txt` (A/B/C/D bo'limlari), `uzc_final_probe.py` + `uzc_final_out.txt` (fp-gipoteza, ranged GET PK tasdiq), `uzc_key_success_2.json` (statik kalit sha256), `uzc_metadata.json` (container/ciphertext hash), `runtime_token3.json` (joriy tiklangan zanjir)
