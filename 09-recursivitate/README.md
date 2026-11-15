# 09. Funcții recursive

O funcție e **recursivă** dacă se apelează pe ea însăși. Orice funcție recursivă are nevoie de:
1. **condiția de oprire** (cazul de bază) — altfel se apelează la infinit și programul se blochează (stack overflow);
2. **apelul recursiv** pe o problemă **mai mică**.

```cpp
int factorial(int n) {
    if (n == 0) return 1;            // cazul de bază
    return n * factorial(n - 1);     // n! = n * (n-1)!
}
```

## Cum se execută (stiva)
`factorial(3)` → `3 * factorial(2)` → `3 * 2 * factorial(1)` → `3 * 2 * 1 * factorial(0)` → `3 * 2 * 1 * 1 = 6`.
Fiecare apel își are propriile variabile locale, păstrate pe **stivă** până se întoarce.

## Ce se întâmplă înainte și după apel
```cpp
void f(int n) {
    if (n == 0) return;
    cout << n << " ";   // ÎNAINTE de apel → 3 2 1
    f(n - 1);
    cout << n << " ";   // DUPĂ apel (la întoarcere) → 1 2 3
}
```
Asta e cheia exercițiilor de tip „Ce se afișează pentru apelul f(…)?” de la bacalaureat.

## Exemple clasice
| Problemă | Relația de recurență |
|----------|---------------------|
| suma cifrelor | `s(n) = n%10 + s(n/10)`, `s(0) = 0` |
| cmmdc | `cmmdc(a, b) = cmmdc(b, a % b)`, `cmmdc(a, 0) = a` |
| Fibonacci | `f(n) = f(n-1) + f(n-2)`, `f(1) = f(2) = 1` |
| putere rapidă | `a^n = (a^(n/2))²`, × a dacă n e impar |
| Ackermann, Manna-Pnueli | funcții date la bac pentru „urmărirea apelurilor” |

**Atenție:** Fibonacci recursiv simplu este **exponențial** — `f(40)` face sute de milioane de apeluri. Soluția: memorare (reținem rezultatele deja calculate).

## Divide et impera
Împarți problema în subprobleme independente, le rezolvi recursiv, combini rezultatele:
- maximul dintr-un vector: max(maxim stânga, maxim dreapta);
- căutarea binară;
- **sortarea prin interclasare (merge sort)**, O(n log n);
- turnurile din Hanoi.

## Umplerea (flood fill)
Pornești dintr-o celulă a unei matrice și te „întinzi” recursiv în vecinii care au aceeași valoare — așa se numără zonele / insulele dintr-o hartă.

## Proiect: `recursivitate.cpp`

Demonstrează: factorial, suma cifrelor, cmmdc, afișarea înainte/după apel, Fibonacci simplu vs. cu memorare (numărând apelurile), putere rapidă, turnurile din Hanoi, merge sort și numărarea insulelor dintr-o hartă (`harta.in`) cu flood fill.

## Exerciții

1. ★ Funcție recursivă care returnează numărul de cifre pare ale unui număr.
2. ★ Afișează recursiv un vector de la coadă la cap.
3. ★★ Funcție recursivă care verifică dacă un șir de caractere e palindrom.
4. ★★ Ce afișează `f(5)`? `void f(int n){ if(n>0){ f(n-2); cout<<n; f(n-1);} }` — răspunde pe hârtie, apoi verifică.
5. ★★ Calculează recursiv suma elementelor unui vector prin divide et impera.
6. ★★★ Implementează Quick Sort.
7. ★★★ Într-un labirint (matrice de 0 = liber și 1 = zid), află dacă se poate ajunge din colțul stânga-sus în colțul dreapta-jos; apoi afișează cel mai scurt drum (vezi și BFS, capitolul 11).
