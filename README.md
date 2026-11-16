# Învață C++ prin proiecte

Un traseu complet de învățare C++, de la primele programe până la grafuri, organizat pe capitolele din programa de liceu (informatică, bacalaureat).

Fiecare capitol are:
- **README.md**: teoria pe scurt, cu exemple de cod;
- **un proiect rezolvat** (`.cpp`), comentat linie cu linie acolo unde e nevoie;
- **exerciții** de dificultate crescătoare (★ ușor, ★★ mediu, ★★★ greu), ca să exersezi singur.

## Traseul recomandat

| # | Capitol | Proiect | Ce înveți |
|---|---------|---------|-----------|
| 01 | [Elemente de bază](01-elemente-de-baza) | Calculator + analizor de numere | tipuri de date, operatori, `if`, `switch`, `while`, `for` |
| 02 | [Algoritmi elementari](02-algoritmi-elementari) | Laboratorul de numere | cifre, divizori, prim, cmmdc, palindrom, baze de numerație |
| 03 | [Fișiere text](03-fisiere-text) | Catalogul clasei | `ifstream`, `ofstream`, citire până la sfârșitul fișierului |
| 04 | [Vectori](04-vectori) | Gestiunea unui vector | sortări, căutare binară, inserare/ștergere, interclasare, frecvențe |
| 05 | [Matrice](05-matrice) | Operații pe matrice + X și 0 | diagonale, zone, parcurgere în spirală, joc în consolă |
| 06 | [Șiruri de caractere](06-siruri-de-caractere) | Analizor de text | `<cstring>`, `strtok`, cuvinte, cifrul lui Cezar |
| 07 | [Structuri neomogene](07-structuri-neomogene) | Registrul elevilor | `struct`, vectori de structuri, sortare după criterii |
| 08 | [Subprograme](08-subprograme) | Biblioteca de funcții | parametri prin valoare / referință, funcții care returnează valori |
| 09 | [Recursivitate](09-recursivitate) | Recursivitate în acțiune | factorial, Fibonacci, Hanoi, umplere (fill), divide et impera |
| 10 | [Combinatorică](10-combinatorica) | Generatorul (backtracking) | permutări, aranjamente, combinări, submulțimi, n regine |
| 11 | [Grafuri](11-grafuri) | Harta orașelor | matrice de adiacență, BFS, DFS, componente conexe, Roy-Floyd, arbori |

## IDE-ul inclus (recomandat)

În folderul [`ide/`](ide) găsești un mediu de lucru în browser, în stilul Visual Studio Code: editor cu autocompletare, buton **▶ Rulează**, terminal în care introduci datele, erori de compilare explicate în română și lecțiile de mai sus cu butonul **▶ Încearcă** la fiecare exemplu.

```bash
cd ide
npm install   # prima dată
npm start     # apoi deschide http://localhost:3000
```
Pe Windows: dublu-click pe `ide/porneste.bat`. Detalii în [ide/README.md](ide/README.md).

## Cum compilezi și rulezi (fără IDE)

Ai nevoie de un compilator C++ (g++ / MinGW, sau un IDE precum Code::Blocks, CLion, Visual Studio Code).

```bash
cd 04-vectori
g++ -std=c++17 -Wall -o vectori gestiune_vector.cpp
./vectori              # pe Windows: vectori.exe
```

Programele care lucrează cu fișiere caută fișierul de intrare (`.in` / `.txt`) **în folderul din care rulezi programul**. Rulează-le din folderul capitolului.

Pentru a compila tot dintr-o dată (Linux/macOS): `./compileaza_tot.sh`

## Cum să folosești materialul

1. Citește teoria din README-ul capitolului.
2. **Înainte** să deschizi proiectul rezolvat, încearcă să scrii singur 1-2 dintre funcțiile lui.
3. Rulează proiectul, schimbă datele de intrare, pune `cout`-uri ca să vezi ce se întâmplă.
4. Rezolvă exercițiile. Dacă te blochezi, recitește proiectul: de obicei ideea e acolo.
5. Treci la capitolul următor doar când poți rezolva exercițiile ★ și ★★ fără ajutor.
