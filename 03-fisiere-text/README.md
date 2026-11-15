# 03. Fișiere text

Până acum datele veneau de la tastatură (`cin`) și plecau pe ecran (`cout`). Cu fișierele, citim și scriem **exact la fel**, doar că prin alte „canale”.

```cpp
#include <fstream>
using namespace std;

ifstream fin("date.in");    // fișier de intrare (citire)
ofstream fout("date.out");  // fișier de ieșire (scriere) — se creează / se suprascrie

int main() {
    int n, x;
    fin >> n;
    for (int i = 1; i <= n; i++) {
        fin >> x;
        fout << x * 2 << " ";
    }
    fin.close();
    fout.close();
    return 0;
}
```

## Verificarea deschiderii
```cpp
if (!fin) { cout << "Nu gasesc fisierul!"; return 1; }
```

## Citire când NU știm câte numere sunt
Cel mai des la bacalaureat: „fișierul conține un șir de cel mult 10⁶ numere”.
```cpp
int x;
while (fin >> x) {     // citirea reușește → intră în buclă; la sfârșitul fișierului → iese
    // prelucrează x
}
```

## Citire linie cu linie
```cpp
char linie[256];
while (fin.getline(linie, 256)) { ... }

// sau cu string:
string s;
while (getline(fin, s)) { ... }
```

## Adăugare la sfârșitul unui fișier (fără să-l ștergi)
```cpp
ofstream fout("jurnal.txt", ios::app);
```

## Algoritmi eficienți pe fișiere
Multe probleme se rezolvă **fără vector**, citind numerele unul câte unul și ținând minte doar ce trebuie (ultimul număr, maximul, o sumă). Exemplu: lungimea celei mai lungi secvențe crescătoare:
```cpp
int x, ant, lung = 1, lmax = 1;
fin >> ant;
while (fin >> x) {
    if (x > ant) lung++; else lung = 1;
    if (lung > lmax) lmax = lung;
    ant = x;
}
```

## Proiect: `catalog.cpp`

Citește din `note.txt` linii de forma `Nume Prenume nota1 nota2 ...` (număr variabil de note) și scrie în `raport.txt`:
- media fiecărui elev și dacă e promovat;
- media clasei, cel mai bun elev, câți au rămas corigenți;
- frecvența fiecărei note (1..10).

Rulează-l din acest folder ca să găsească `note.txt`. Apoi deschide `raport.txt`.

## Exerciții

1. ★ Fișierul `numere.in` conține numere naturale. Scrie în `numere.out` doar numerele pare, câte unul pe linie.
2. ★ Numără câte linii, câte cuvinte și câte caractere are un fișier text.
3. ★★ Fișierul conține un șir de numere. Afișează lungimea celei mai lungi secvențe de numere egale.
4. ★★ Copiază un fișier în altul, transformând toate literele mici în litere mari.
5. ★★ (bac) Fișierul conține cel mult 10⁶ numere din [0, 100]. Afișează numerele care apar o singură dată, în ordine crescătoare — eficient, folosind un vector de frecvență.
6. ★★★ Adaugă în catalog: sortarea elevilor după medie în `clasament.txt` și un „jurnal” (`ios::app`) în care fiecare rulare adaugă data și media clasei.
