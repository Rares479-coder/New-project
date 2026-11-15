# 06. Șiruri de caractere

La liceu (și la bacalaureat) se lucrează mai ales cu **șiruri de tip C**: vectori de `char` terminați cu caracterul `'\0'`.

```cpp
#include <cstring>
char s[101];                 // maxim 100 de caractere + '\0'
cin >> s;                    // citește PÂNĂ LA PRIMUL SPAȚIU
cin.getline(s, 101);         // citește toată linia, cu spații
```
Atenție: dacă ai folosit `cin >> n` înainte de `getline`, rămâne un `'\n'` în buffer → pune `cin.get();` înainte.

## Funcții din `<cstring>`

| Funcție | Ce face |
|---------|---------|
| `strlen(s)` | lungimea (fără `'\0'`) |
| `strcpy(d, s)` | copiază `s` în `d` |
| `strcat(d, s)` | lipește `s` la sfârșitul lui `d` |
| `strcmp(a, b)` | `<0` dacă a < b alfabetic, `0` dacă sunt egale, `>0` altfel |
| `strchr(s, c)` | pointer la prima apariție a caracterului `c` (sau `NULL`) |
| `strstr(s, t)` | pointer la prima apariție a șirului `t` în `s` (sau `NULL`) |
| `strtok(s, sep)` | împarte șirul în cuvinte (modifică `s`!) |

Poziția unui pointer `p` în șirul `s`: `p - s`.

## Caractere — codul ASCII
`'A'..'Z'` = 65..90, `'a'..'z'` = 97..122, `'0'..'9'` = 48..57.
```cpp
if (c >= 'a' && c <= 'z') c = c - 'a' + 'A';   // literă mică → mare (sau toupper(c))
int cifra = c - '0';                            // '7' → 7
```
Funcții utile din `<cctype>`: `isalpha`, `isdigit`, `isupper`, `islower`, `toupper`, `tolower`.

## Despărțirea în cuvinte cu `strtok`
```cpp
char *p = strtok(s, " ,.;!?");
while (p != NULL) {
    cout << p << "\n";
    p = strtok(NULL, " ,.;!?");     // NULL = continuă pe același șir
}
```

## Ștergerea / inserarea unui caracter
```cpp
strcpy(s + i, s + i + 1);   // șterge caracterul de pe poziția i
```
Notă: standardul nu garantează `strcpy` cu zone suprapuse; varianta sigură e `memmove(s + i, s + i + 1, strlen(s + i + 1) + 1)` sau o buclă simplă. Proiectul folosește o buclă.

## Proiect: `analizor_text.cpp`

Citește o frază și: numără vocale/consoane/cifre/cuvinte, găsește cel mai lung cuvânt, afișează cuvintele palindrom, transformă prima literă a fiecărui cuvânt în majusculă, înlocuiește un cuvânt cu altul, criptează/decriptează cu cifrul lui Cezar și sortează alfabetic cuvintele.

## Exerciții

1. ★ Numără de câte ori apare o literă într-un text (fără să conteze literă mare/mică).
2. ★ Verifică dacă un cuvânt este palindrom.
3. ★★ Șterge toate vocalele dintr-un șir.
4. ★★ Afișează cuvintele care încep și se termină cu aceeași literă.
5. ★★ (bac) Dublează fiecare vocală dintr-un cuvânt: „mere” → „meeree”.
6. ★★ Verifică dacă două cuvinte sunt anagrame (vector de frecvență pe 26 de litere).
7. ★★★ Transformă un număr scris cu cifre romane (ex. `MCMXCIV`) în număr zecimal și invers.
8. ★★★ Construiește un mic „corector”: înlocuiește spațiile multiple cu unul singur, pune majusculă după punct și elimină spațiile dinaintea virgulelor.
