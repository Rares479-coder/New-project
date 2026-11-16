# IDE C/C++ pentru învățat

Un mediu de dezvoltare care rulează în browser, în stilul **Visual Studio Code**, făcut pentru a învăța C și C++ cu lecțiile din acest repository.

## Ce poate face

- **Editor Monaco**, același editor ca în VS Code: colorare de sintaxă, minimap, căutare/înlocuire, mai multe cursoare, zoom cu Ctrl+rotiță.
- **Autocompletare cu fragmente de cod**: scrie `for`, `main`, `cout`, `readv`, `prim`, `cmmdc`… și apasă Enter.
- **▶ Rulează (F5)**: salvează, compilează cu `g++`/`gcc` și pornește programul.
- **Terminal interactiv**: când programul face `cin >>` / `scanf`, scrii datele direct în terminal.
- **Erori explicate în română**: erorile apar subliniate în cod, iar în panoul **PROBLEME** ai și un sfat (💡), de exemplu „Lipsește un punct și virgulă”.
- **Explică și erorile de la rulare**: împărțire la zero, acces în afara vectorului (segmentation fault), recursivitate infinită.
- **Lecții**: capitolele din repository, cu teoria afișată frumos. La fiecare exemplu de cod ai butonul **▶ Încearcă**, care îl copiază într-un fișier nou (în `incercari/`) ca să-l rulezi și să-l modifici.
- **Explorator de fișiere**: creezi, redenumești și ștergi fișiere și foldere (click dreapta).
- Temă întunecată / luminoasă, alegi standardul C++ (11/14/17/20), tab-urile deschise se păstrează.

Programele rulează în folderul fișierului, deci cele care citesc din fișiere (`.in`, `.txt`) găsesc datele lângă ele.

## De ce ai nevoie

1. **Node.js** 18 sau mai nou: https://nodejs.org (versiunea LTS).
2. **Un compilator C/C++** (`g++` și `gcc`):
   - **Windows**: instalează [MSYS2](https://www.msys2.org), apoi în terminalul MSYS2 rulează `pacman -S mingw-w64-ucrt-x86_64-gcc` și adaugă `C:\msys64\ucrt64\bin` în variabila `PATH`. (Merge și MinGW-ul din Code::Blocks, dacă îl adaugi în `PATH`.)
   - **macOS**: `xcode-select --install`
   - **Linux (Ubuntu/Debian)**: `sudo apt install build-essential`

Verifică într-un terminal: `g++ --version`.

## Pornire

**Windows:** dublu-click pe `ide/porneste.bat`.

**Linux / macOS:**
```bash
cd ide
./porneste.sh
```

Sau manual:
```bash
cd ide
npm install      # doar prima dată
npm start
```
apoi deschide **http://localhost:3000** în browser.

Implicit, spațiul de lucru este folderul acestui repository. Poți deschide orice alt folder:
```bash
node server.js /calea/catre/folderul/meu
```
Pentru telefon: `node server.js --retea` (vezi mai jos). Alt port: `PORT=3001 npm start` (pe Windows: `set PORT=3001 && npm start`).

## Pe telefon 📱

Interfața se adaptează la ecranul telefonului:
- meniul ☰ deschide **Fișiere** și **Lecții**;
- deasupra editorului ai o **bară cu simbolurile C++** greu de găsit pe tastatura telefonului: `{ } ( ) ; [ ] << >> = " # &`, plus Tab, săgeți și Anulează;
- când rulezi un program, terminalul ocupă tot ecranul, iar datele le scrii în **câmpul de jos** și apeși ⏎. Butonul ⤡ te întoarce la cod.

Programele trebuie totuși compilate undeva, iar telefonul nu are compilator. Ai două variante:

### Varianta 1: calculatorul compilează, tu lucrezi de pe telefon (Android și iPhone)

1. Telefonul și calculatorul trebuie să fie în **aceeași rețea Wi-Fi**.
2. Pe calculator pornește IDE-ul în modul rețea:
   - Windows: dublu-click pe `ide/porneste-telefon.bat`
   - Linux / macOS: `cd ide && npm run telefon`
3. În terminal apar un **cod QR** și un link de forma `http://192.168.1.23:3000/?cheie=…`. Scanează codul cu camera telefonului sau scrie link-ul în browser.
4. Pe Windows, la prima pornire, apasă **Permite accesul** când întreabă paravanul de protecție (firewall-ul), pentru rețele private.

Cheia din link se schimbă la fiecare pornire. Fără ea, nimeni din rețea nu poate folosi IDE-ul. Telefonul ține minte cheia până repornești serverul; după aceea scanezi codul QR nou. **Nu da link-ul altora**: cine îl are poate rula programe pe calculatorul tău. Folosește modul rețea doar acasă, nu pe Wi-Fi public.

Sfat: în browserul telefonului alege „Adaugă pe ecranul de pornire”, ca IDE-ul să se deschidă ca o aplicație.

### Varianta 2: totul pe telefon, fără calculator (doar Android)

Cu aplicația gratuită **Termux** (instaleaz-o din F-Droid, nu din Google Play, unde versiunea e veche):
```bash
pkg update
pkg install nodejs clang git
git clone <adresa-acestui-repository>
cd <folderul-repository-ului>/ide
npm install
npm start
```
Apoi deschide **http://localhost:3000** în Chrome pe telefon. IDE-ul folosește automat `clang`, compilatorul din Termux. Lasă Termux pornit cât lucrezi.

## Scurtături de tastatură

| Tastă | Acțiune |
|-------|---------|
| `F5` sau `Ctrl+Enter` | Compilează și rulează |
| `Shift+F5` | Oprește programul |
| `Ctrl+S` / `Ctrl+Shift+S` | Salvează / salvează tot |
| `Alt+N` | Fișier nou |
| `Alt+W` | Închide tab-ul |
| `Ctrl+`` ` | Arată / ascunde terminalul |
| `Ctrl+B` | Arată / ascunde bara laterală |
| `Ctrl+Space` | Sugestii |
| `Ctrl+/` | Comentează linia |
| `F2` | Redenumește o variabilă peste tot în fișier |

În terminal: `Ctrl+C` oprește programul, `Ctrl+D` trimite „sfârșit de fișier” (util la `while (cin >> x)`).

## Cum funcționează

- `server.js` (Node.js) servește interfața, citește și scrie fișierele din spațiul de lucru, compilează cu `g++ -std=c++17 -Wall -Wextra -g` și pornește programul, trimițând intrarea și ieșirea prin WebSocket.
- `public/` conține interfața: editorul [Monaco](https://microsoft.github.io/monaco-editor/), terminalul [xterm.js](https://xtermjs.org) și [marked](https://marked.js.org) pentru lecții.
- Executabilele se pun într-un folder temporar al sistemului, nu în repository.
- Implicit, serverul ascultă doar pe `localhost`, deci nu e accesibil din rețea. Doar cu `--retea` (`npm run telefon`) acceptă conexiuni din rețeaua locală, și atunci numai cu cheia secretă.
- Dacă nu găsește `g++`/`gcc`, folosește `clang++`/`clang` (Termux pe Android, macOS).

Limitări: compilează câte un singur fișier (cum sunt toate programele de liceu), nu are debugger pas cu pas.
