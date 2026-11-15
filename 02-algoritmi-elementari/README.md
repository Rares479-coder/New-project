# 02. Algoritmi elementari

Algoritmii de aici apar în aproape orice problemă de bacalaureat. Învață-i până îi poți scrie din reflex.

## Prelucrarea cifrelor unui număr

```cpp
while (n > 0) {
    int c = n % 10;   // ultima cifră
    // ... folosește cifra c
    n = n / 10;       // elimină ultima cifră
}
```
Atenție: dacă `n` poate fi 0, tratează separat cazul (bucla nu se execută deloc).

## Oglinditul (inversul) unui număr
```cpp
int ogl = 0;
while (n > 0) { ogl = ogl * 10 + n % 10; n /= 10; }
```
Un număr e **palindrom** dacă este egal cu oglinditul său.

## Divizori și numere prime
```cpp
// divizorii lui n: e suficient să mergem până la sqrt(n)
for (int d = 1; d * d <= n; d++)
    if (n % d == 0) { /* d și n/d sunt divizori */ }

bool prim = n >= 2;
for (int d = 2; d * d <= n && prim; d++)
    if (n % d == 0) prim = false;
```

## CMMDC — algoritmul lui Euclid
```cpp
while (b != 0) { int r = a % b; a = b; b = r; }   // cmmdc = a
// cmmmc(a, b) = a / cmmdc(a, b) * b
```

## Maxim / minim, sume, numărare
```cpp
int maxim = INT_MIN;           // sau prima valoare citită
for (...) if (x > maxim) maxim = x;
```

## Șirul lui Fibonacci
`f1 = 1, f2 = 1, fn = f(n-1) + f(n-2)` → se calculează cu trei variabile, fără vector.

## Conversii între baze
- din baza 10 în baza b: împarți repetat la b, resturile citite **invers** dau numărul;
- din baza b în baza 10: `rez = rez * b + cifra`, parcurgând cifrele de la stânga.

## Descompunerea în factori primi
```cpp
for (int d = 2; n > 1; d++) {
    int p = 0;
    while (n % d == 0) { n /= d; p++; }
    if (p) cout << d << "^" << p << " ";
}
```

## Proiect: `laborator_numere.cpp`

Citești un număr și primești un „raport” complet: cifre, suma cifrelor, oglindit, palindrom, prim, perfect, divizori, descompunere în factori primi, scriere în baza 2, verificare dacă e termen Fibonacci. În plus: cmmdc/cmmmc pentru două numere.

## Exerciții

1. ★ Afișează cifra maximă și de câte ori apare într-un număr.
2. ★ Construiește numărul format doar din cifrele pare ale lui `n` (păstrând ordinea).
3. ★ Afișează primele `n` numere prime.
4. ★★ Verifică dacă două numere sunt prietene (suma divizorilor proprii ai unuia este celălalt) — ex. 220 și 284.
5. ★★ Convertește un număr din baza 2 în baza 10, apoi într-o bază b oarecare (2..9).
6. ★★ Câte numere din intervalul `[a, b]` au suma cifrelor egală cu `s`?
7. ★★★ Afișează toate numerele „super-prime” mai mici decât n (un număr e super-prim dacă toate prefixele lui sunt prime, ex. 2393: 2, 23, 239, 2393).
8. ★★★ Simplifică o fracție `a/b` și scrie-o ca fracție mixtă.
