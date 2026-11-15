# 01. Elementele de bază ale limbajului C++

## Structura unui program

```cpp
#include <iostream>      // biblioteca pentru cin / cout
using namespace std;     // ca să nu scriem std::cout

int main() {
    cout << "Salut!" << endl;
    return 0;            // programul s-a terminat cu succes
}
```

## Tipuri de date

| Tip | Ce reține | Exemplu |
|-----|-----------|---------|
| `int` | numere întregi (aprox. ±2 miliarde) | `int x = 25;` |
| `long long` | întregi foarte mari (±9·10¹⁸) | `long long p = 1LL * a * b;` |
| `double` | numere reale | `double m = 9.5;` |
| `char` | un caracter | `char c = 'A';` |
| `bool` | adevărat / fals | `bool ok = true;` |

## Operatori

- aritmetici: `+ - * / %`. Atenție: `7 / 2 == 3` (împărțire întreagă), `7 % 2 == 1` (restul), `7.0 / 2 == 3.5`
- relaționali: `== != < <= > >=`
- logici: `&&` (și), `||` (sau), `!` (negație)
- de atribuire: `= += -= *= /= %=`, incrementare `x++`, decrementare `x--`

## Structuri de control

```cpp
// decizie
if (x % 2 == 0) cout << "par";
else cout << "impar";

// selecție multiplă
switch (op) {
    case '+': r = a + b; break;
    case '-': r = a - b; break;
    default: cout << "operator necunoscut";
}

// repetitive
for (int i = 1; i <= n; i++) s += i;     // număr cunoscut de pași
while (n > 0) { n /= 10; }               // condiție verificată la început
do { cin >> x; } while (x < 0);          // se execută cel puțin o dată
```

## Proiect: `calculator.cpp`

Un program cu meniu care:
1. face operații aritmetice între două numere (cu verificarea împărțirii la 0);
2. rezolvă ecuația de gradul I și de gradul II;
3. spune dacă un an este bisect;
4. afișează tabla înmulțirii;
5. calculează suma și media unor numere citite până la 0.

Compilare: `g++ -std=c++17 -o calculator calculator.cpp`

## Exerciții

1. ★ Citește trei numere și afișează-l pe cel mai mare.
2. ★ Citește o notă (1-10) și afișează calificativul (Insuficient / Suficient / Bine / Foarte bine), folosind `switch`.
3. ★ Afișează toate numerele pare dintre `a` și `b`.
4. ★★ Citește lungimile a trei segmente și spune dacă pot forma un triunghi și ce fel de triunghi (echilateral, isoscel, dreptunghic, oarecare).
5. ★★ Citește numere până la 0 și afișează câte sunt pozitive, câte negative, și media celor pozitive.
6. ★★ Adaugă în calculator opțiunea „ridicare la putere” (`a` la puterea `b`, fără `pow`).
7. ★★★ Desenează în consolă un triunghi de `*` cu `n` linii, apoi un romb.
