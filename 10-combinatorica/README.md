# 10. Elemente de combinatorică (și metoda backtracking)

## Formulele

| Ce numărăm | Notație | Formulă | Exemplu (n = 4, k = 2) |
|-----------|---------|---------|------------------------|
| **Permutări** — toate ordonările a n elemente | Pₙ | n! | 4! = 24 |
| **Aranjamente** — k elemente din n, **contează ordinea** | Aₙᵏ | n! / (n−k)! | 12 |
| **Combinări** — k elemente din n, **nu contează ordinea** | Cₙᵏ | n! / (k!·(n−k)!) | 6 |
| **Submulțimi** ale unei mulțimi cu n elemente | — | 2ⁿ | 16 |
| **Produs cartezian** A₁×…×Aₖ | — | \|A₁\|·…·\|Aₖ\| | — |

Exemple: în câte moduri se așază 5 elevi pe 5 scaune → P₅; câte podiumuri (aur, argint, bronz) din 10 sportivi → A₁₀³; câte echipe de 3 din 10 → C₁₀³.

**Triunghiul lui Pascal**: `C[n][k] = C[n-1][k-1] + C[n-1][k]` — calculează combinări fără factoriale uriașe.

## Backtracking — cum le **generăm** pe toate

Construim soluția element cu element într-un vector `x[1..k]`. La fiecare pas încercăm toate valorile posibile; dacă o valoare e bună („valid”), mergem mai departe; după ce am terminat cu ea, ne întoarcem și încercăm următoarea.

```cpp
int x[20], n, k;
bool folosit[20];

void back(int pas) {
    for (int v = 1; v <= n; v++) {
        if (!folosit[v]) {               // condiția de validitate
            x[pas] = v;
            folosit[v] = true;
            if (pas == n) afiseaza();     // soluție completă
            else back(pas + 1);           // continuăm construcția
            folosit[v] = false;           // revenim (backtrack)
        }
    }
}
```

Diferențele dintre probleme stau doar în **valorile încercate** și în **condiția de validitate**:

| Problemă | Valori pentru `x[pas]` | Condiție |
|----------|-----------------------|----------|
| Permutări | 1..n | nefolosit |
| Aranjamente | 1..n | nefolosit, oprire la pas = k |
| Combinări | `x[pas-1]+1 .. n` | (crescător ⇒ automat distincte) |
| Submulțimi | 0 / 1 (iau sau nu elementul) | — |
| Produs cartezian | 1..nᵢ | — |
| n regine | coloana 1..n | nu se atacă (coloană / diagonală) |
| Plata unei sume | numărul de bancnote de fiecare tip | suma ≤ S |

## Proiect: `generator.cpp`

Un meniu care calculează numerele (n!, Aₙᵏ, Cₙᵏ cu triunghiul lui Pascal, 2ⁿ) și **generează** cu backtracking: permutări, aranjamente, combinări, submulțimi, produs cartezian, problema celor n regine (cu afișarea tablei) și toate modurile de a plăti o sumă cu bancnote date.

## Exerciții

1. ★ Generează toate numerele de 3 cifre distincte formate cu cifrele 1, 2, 3, 4.
2. ★ Câte drapele tricolore se pot forma cu 6 culori? Generează-le.
3. ★★ Generează permutările lui {1..n} în care nu există două numere pare alăturate.
4. ★★ Generează toate parantezările corecte cu n perechi de paranteze: `(())`, `()()`.
5. ★★ (bac) Se dau n elevi; generează toate echipele de k elevi în care sunt cel puțin 2 fete.
6. ★★ Descompune un număr n ca sumă de numere naturale nenule, în ordine crescătoare (partiții).
7. ★★★ Problema calului: drum al calului pe o tablă n × n care trece o singură dată prin fiecare pătrat.
8. ★★★ Sudoku: completează o grilă 9 × 9 citită dintr-un fișier.
