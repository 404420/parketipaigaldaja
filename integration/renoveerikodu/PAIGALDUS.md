# Parketipaigaldaja päringud Renoveeri Kodu adminis

1. Laadi pakis olev `api/parket-contact.php` renoveerikodu.ee veebijuure `api` kausta. Seal peab juba olema olemas aktiivse saidi `contact.php`.
2. Ära asenda `config.php`, `contact.php`, admini faile ega andmebaasi. Uus fail kasutab olemasolevat andmebaasiühendust, CAPTCHA kontrolli, meilide saatmist ja `contacts` tabelit. Andmebaasimigratsiooni pole vaja.
3. Kui serveris on reCAPTCHA kasutusel, lisa sama reCAPTCHA v2 märkeruudu võtme lubatud domeenidesse `parketipaigaldaja.ee`, `www.parketipaigaldaja.ee` ning praeguse GitHub Pagesi lehe jaoks `404420.github.io`. Salajane võti jääb serveri olemasolevasse seadistusse.
4. Ava `https://renoveerikodu.ee/api/parket-contact.php`. Vastus peab sisaldama `success: true` ja `captchaRequired`. See aadress väljastab ainult avaliku CAPTCHA seadistuse, mitte päringuid.
5. Avalda parketipaigaldaja muudatused GitHub Pagesis alles pärast serverifaili paigaldamist.
6. Saada kontrollpäring parketipaigaldaja vormist. Logi sisse `https://renoveerikodu.ee/admin` ja kontrolli jaotises Päringud uut rida allikaga `parketipaigaldaja.ee`. Sõnum sisaldab pindala, soovitud aega, disaini ja töö kirjeldust; asukoht asub aadressi veerus. Olemasolev contact.php saadab ka teavituse ettevõttele ja kinnituskirja kliendile.

Vastuvõtt lubab brauseripäringuid ainult koodis loetletud veebiaadressidelt, kontrollib sisendit ning kasutab olemasoleva contact.php robotikontrolli ja peibutusvälja. CORS ei asenda robotikaitset; hoia olemasolev CAPTCHA aktiivne. Siin pole uusi sisselogimis- ega lugemisvõimalusi.

Brauseri saatmist on kontrollitud simuleeritud API vastustega (edu ja salvestamisviga). Päris serveri salvestamine ja CAPTCHA tuleb kontrollida pärast paigaldamist. Kohalikus keskkonnas ei ole PHP käivitajat.
