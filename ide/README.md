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
Alt port: `PORT=3001 npm start` (pe Windows: `set PORT=3001 && npm start`).

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
- Serverul ascultă doar pe `localhost`, deci nu e accesibil din rețea.

Limitări: compilează câte un singur fișier (cum sunt toate programele de liceu), nu are debugger pas cu pas.
