# parketipaigaldaja.ee

Eestikeelne staatiline veebileht: HTML, CSS ja brauseri JavaScript. Ei vaja Next.js-i, Reacti, andmebaasi ega serveripoolset renderdamist. Kõik viis lehte on päris HTML-failid. 3D sõltuvused on kohalikud ja laaditakse ainult disainistuudios.

## Käivitamine ja kontrollid

Node.js 22 või uuem:

```sh
npm ci
npm run build
npm run dev
```

Ava `http://127.0.0.1:4173`. Staatilise hostingu jaoks piisab HTML-failidest, lehtede kaustadest ja `assets/` kaustast; npm pole hostingus vajalik. `file://` ei sobi JavaScripti moodulite tõttu. Ka alamkaustas hostimine töötab suhteliste linkidega.

```sh
npm run lint
npm run typecheck
npm test
npm run test:browser
```

Brauserikontroll kasutab kohalikku Microsoft Edge'i ja nõuab töötavat dev-serverit. Kontrollib viit marsruuti, 360 px vaadet, reduced-motion režiimi, disaini püsimist, jagamislingi taastamist, vigast URL-i, 2D eelvaadet, galeriid ja päringu allalaadimist.

HTML-i sisu muuda failis `scripts/build.mjs` ja käivita `npm run build`. Stiilid: `assets/style.css`. Ühised käitumised: `assets/app.js`. 3D: `assets/room3d.js`; põrandamustrid ja 2D: `assets/floor.js`.

## Enne avaldamist

Täida ja kinnita `assets/config.js`: ärinimi, kontaktid, tegutsemispiirkond, teenuste hinnad, käibemaksu ning materjalide hinna käsitlus. Puuduvad andmed jäävad avalikus vaates välja. Hinnad on praegu teadlikult `null`; kalkulaator koostab päringu hinnanumbrita. Liistud on jooksva meetri töö ja nende hind ei ole arvutatav ruumi pindalast.

Lisa kinnitatud projektifotod ja andmed inspiratsioonigalerii asemele. Praegused visuaalid on märgistatud inspiratsioonina. Kohanda kanoonilisi URL-e, sitemap'i ja jagamispildi URL-i, kui avalik domeen erineb `parketipaigaldaja.ee`-st.

Avaldamist ei ole selle töö käigus käivitatud. GitHub Pagesi töövoog on omaniku loal GitHubis **peatatud** (`disabled_manually`), et main-haru push ei avaldaks lehte automaatselt. Avaldamiseks luba pärast andmete kinnitamist GitHub Actionsis töövoog uuesti ja kasuta `Run workflow` toimingut. Tähelepanu: algne töövoofail sisaldab ka main-haru push-päästikut, seega pärast uuesti lubamist käivitavad edasised push-id avaldamise. Töövoog avaldab repositooriumi staatilise sisu; ära pane repositooriumisse saladusi.

## Disainistuudio

Three.js 0.180.0, PBR materjalid, soe suunatud päevavalgus ja pehmed varjud. OrbitControls piirab kaamerat. Stseen renderdab valiku, kaamera või suuruse muutumisel, mitte pidevalt. Puuteekraanil ei püüta lehe kerimist kinni; kasuta vaatenurga nuppe.

Puidusüü on deterministlikult genereeritud igale lauale. Sirge laud, täisnurkne kalasaba ja mitriga chevron erinevad geomeetriliselt tekstuuril. Viimistlus muudab roughness'i. Laius ja pikkus on 2–10 m, ühe kümnendkoha täpsusega. Suurte mõõtmete korral kujutab stseen üht näidisistumisnurka.

Kõik valikud valideeritakse ühises JSDoc-tüübitud mudelis (`assets/state.js`). Disain salvestub localStorage'isse; keelatud salvestus ei takista tööd. URL taastab valikud salvestusest kõrgema prioriteediga. Jagamislink sisaldab ainult disainiandmeid. `?view=2d` võimaldab varuvaadet kontrollida; WebGL laadimis- või kontekstivea korral töötab 2D eelvaade automaatselt samade valikutega.

## Päring ja isikuandmed

Vorm **ei saada praegu andmeid**. Sellel on brauseri sisendivalideerimine, laadimise ja vea olek ning tekstifaili allalaadimine. Isikuandmeid ei logita, salvestata localStorage'isse ega lisata URL-i. Faili koostamise kinnitus ütleb selgelt, et päringut ei saadetud.

Saatmise ühendamiseks loo oma serveripoolne endpoint, lisa serveris valideerimine, kuritarvituse tõkestamine ja vajalik andmekaitseteave ning muuda `assets/app.js` saatmisharu. `formEndpoint` on hetkel TODO, mitte toimiv integratsioon. SMTP ja API võtmed peavad jääma serverisse. Staatilisse JS-i saladusi lisada ei tohi.

## Visuaalide päritolu

- `assets/hero.jpg`: OpenAI sisseehitatud imagegen-tööriistaga selle projekti jaoks loodud AI inspiratsioonivisuaal, mitte ettevõtte päris projekt. Prompt: „Premium warm Nordic living room, natural oak herringbone parquet prominently covering foreground, cream sofa, wood chair, low oak coffee table, ivory plaster walls, large left window, soft golden afternoon sunlight, editorial interior photography, no rugs, no people, text or logos.“ Ei kopeeri konkurendi pilti. Algne PNG säilib looja lokaalses generated_images kaustas; veebis kasutatakse optimeeritud JPEG-d.
- `assets/straight.svg`, `assets/chevron.svg`, `assets/favicon.svg`: selle projekti jaoks koodina loodud illustratsioonid.
- Põrandatekstuurid ja 3D geomeetria: projektis protseduurselt loodud; väliseid mudeli- või tekstuurilitsentse pole.
- Three.js ja OrbitControls: MIT, litsents `assets/vendor/THREE-LICENSE.txt`.
- Fondid: süsteemi Arial/Helvetica ja Georgia/Times New Roman; fontide võrgupäringuid ega väliseid fontifaile pole.

Higgsfieldi ja GitHubi ühendustööriistad ei olnud selles seansis saadaval. Repositooriumi muudatused tehti Gitiga, visuaal sisseehitatud imagegen-tööriistaga.

## Piirangud

3D on stiilne illustreeriv ruumimudel, mitte mõõdistatud ruumi fotorealistlik digikaksik. Ekraanitoonid ja materjalide läige sõltuvad seadmest; lõplik valik vajab päris materjalinäidist. 2D on lihtsustatud ruumiillustratsioon. Hinnad, ettevõtte faktid, päris referentsid ja e-posti saatmine vajavad omaniku kinnitatud andmeid ja seadistust.

