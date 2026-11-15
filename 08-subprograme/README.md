# 08. Subprograme (funcții)

O funcție este o „bucată” de cod cu nume, pe care o scrii o dată și o folosești de câte ori vrei.

```cpp
//  tip returnat   nume     parametri formali
    int            cmmdc   (int a, int b) {
        while (b) { int r = a % b; a = b; b = r; }
        return a;                    // valoarea întoarsă
    }

int main() {
    cout << cmmdc(12, 18);           // apel, cu parametri efectivi (actuali)
}
```

## Tipuri de funcții
- **cu rezultat** (`int`, `bool`, `double` …): se folosesc în expresii, `return valoare;`
- **`void`**: nu întorc nimic, doar fac ceva (afișează, modifică parametri).

## Transmiterea parametrilor

| Prin valoare | Prin referință (`&`) |
|---|---|
| `void f(int x)` | `void f(int &x)` |
| funcția primește o **copie** | funcția lucrează pe **variabila originală** |
| modificările se pierd la ieșire | modificările rămân după apel |

```cpp
void interschimba(int &a, int &b) { int aux = a; a = b; b = aux; }
```
Prin referință poți „întoarce” mai multe rezultate deodată:
```cpp
void minMax(int v[], int n, int &mn, int &mx) { ... }
```
**Vectorii** se transmit întotdeauna „ca referință” (funcția poate modifica elementele).

## Variabile locale și globale
- **locale** — declarate în funcție, există doar cât rulează funcția;
- **globale** — declarate în afara funcțiilor, vizibile peste tot, inițializate automat cu 0.
Dacă o locală are același nume cu o globală, o „ascunde” pe cea globală.

## Prototip (declarare înainte de definire)
```cpp
bool prim(int n);           // prototip: îi spune compilatorului că funcția există
int main() { cout << prim(7); }
bool prim(int n) { ... }    // definiția poate veni mai jos
```

## Subiectul II/III de bacalaureat
De obicei cere: „Scrieți **definiția completă** a subprogramului `f` care primește prin parametrul `n` … și returnează / furnizează prin parametrul `r` …”. Respectă **exact** antetul cerut (nume, tip, ordinea parametrilor, `&` unde e nevoie)!

## Proiect: `biblioteca_functii.cpp`

O colecție de funcții clasice (cifre, prim, cmmdc, oglindit, divizori, sortare, căutare, citire/afișare vector, minMax prin referință, conversie în bază), testate dintr-un `main` care arată cum se apelează fiecare și diferența dintre transmiterea prin valoare și prin referință.

## Exerciții (în stilul bacalaureatului)

1. ★ `int sumaCifre(int n)` — returnează suma cifrelor lui `n`.
2. ★ `bool patratPerfect(int n)` — verifică dacă `n` e pătrat perfect.
3. ★★ `void cifre(int n, int &pare, int &impare)` — furnizează câte cifre pare și câte impare are `n`.
4. ★★ `int elimCifra(int n, int c)` — returnează numărul obținut din `n` prin eliminarea tuturor aparițiilor cifrei `c` (ex. `elimCifra(12324, 2) = 134`).
5. ★★ `void transforma(int v[], int n)` — înlocuiește fiecare element cu suma cifrelor sale; folosește funcția de la 1.
6. ★★ `int nrPrime(int a, int b)` — câte numere prime sunt în `[a, b]`; folosește o funcție `prim`.
7. ★★★ `void sterge(int v[], int &n, int x)` — șterge toate aparițiile lui `x` din vector, într-o singură parcurgere.
8. ★★★ Rescrie proiectul din capitolul 02 folosind doar funcții (un `main` de maxim 20 de linii).
