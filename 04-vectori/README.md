# 04. Tablouri unidimensionale (vectori)

Un vector reține mai multe valori de același tip, una după alta în memorie, accesate prin **indice**.

```cpp
int v[101];        // 101 elemente: v[0] ... v[100]
int n;
cin >> n;
for (int i = 1; i <= n; i++) cin >> v[i];   // la liceu indexăm des de la 1
```
Atenție: C++ **nu verifică** dacă indicele e în afara vectorului — `v[200]` compilează, dar strică memoria.

## Algoritmi de bază

**Inserare** pe poziția `p` (mutăm elementele spre dreapta, de la coadă):
```cpp
for (int i = n; i >= p; i--) v[i + 1] = v[i];
v[p] = x; n++;
```
**Ștergere** de pe poziția `p` (mutăm spre stânga):
```cpp
for (int i = p; i < n; i++) v[i] = v[i + 1];
n--;
```

**Sortare prin selecție** (O(n²)):
```cpp
for (int i = 1; i < n; i++)
    for (int j = i + 1; j <= n; j++)
        if (v[i] > v[j]) swap(v[i], v[j]);
```

**Bubble sort** — repetăm până nu mai facem nicio interschimbare.

**Căutare binară** (vectorul trebuie să fie SORTAT, O(log n)):
```cpp
int st = 1, dr = n, poz = -1;
while (st <= dr && poz == -1) {
    int m = (st + dr) / 2;
    if (v[m] == x) poz = m;
    else if (v[m] < x) st = m + 1;
    else dr = m - 1;
}
```

**Interclasare** a doi vectori sortați → un vector sortat, în O(n + m).

**Vector de frecvență** — când valorile sunt mici (ex. cifre, numere ≤ 10⁶):
```cpp
int fr[10] = {0};
while (n) { fr[n % 10]++; n /= 10; }
```
Cu el poți sorta în O(n + valMax) (counting sort) sau găsi elemente care apar o singură dată.

## Proiect: `gestiune_vector.cpp`

Un meniu care lucrează pe același vector: adăugare, afișare, inserare, ștergere, min/max, sortare (selecție și bubble), căutare liniară și binară, inversare, eliminarea duplicatelor, interclasare cu alt vector, frecvența cifrelor, rotire la stânga, cea mai lungă secvență crescătoare.

## Exerciții

1. ★ Afișează elementele vectorului care sunt mai mari decât media aritmetică.
2. ★ Verifică dacă un vector este palindrom (v[1] = v[n], v[2] = v[n-1], …).
3. ★★ Mută toate elementele nule la sfârșitul vectorului, păstrând ordinea celorlalte.
4. ★★ Șterge din vector toate numerele prime.
5. ★★ Inserează după fiecare element par dublul lui.
6. ★★ (bac) Se dau două șiruri sortate crescător. Afișează elementele comune (intersecția), în O(n + m).
7. ★★★ Afișează cea mai lungă secvență de elemente care au aceeași paritate.
8. ★★★ Rotește vectorul cu `k` poziții la dreapta, folosind doar 3 inversări de secvențe.
