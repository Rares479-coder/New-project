# 05. Tablouri bidimensionale (matrice)

O matrice are `n` linii și `m` coloane; elementul de pe linia `i`, coloana `j` este `a[i][j]`.

```cpp
int a[101][101], n, m;
cin >> n >> m;
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        cin >> a[i][j];
```

## Matrice pătratică (n × n) — zonele

```
 diagonala principală:  i == j
 diagonala secundară:   i + j == n + 1
 deasupra diag. princ.: i <  j          sub diag. princ.: i >  j
 deasupra diag. sec.:   i + j <  n + 1  sub diag. sec.:   i + j >  n + 1
```
Zona de **nord** (triunghiul de sus, între diagonale): `i < j && i + j < n + 1`. Celelalte (sud, est, vest) se obțin analog.

## Operații frecvente
- **suma pe linii / coloane**: un vector `sl[i]` și unul `sc[j]`;
- **transpusa**: `t[j][i] = a[i][j]`;
- **produsul** a două matrice: `c[i][j] = Σ a[i][k] * b[k][j]` (coloanele lui A = liniile lui B);
- **interschimbarea a două linii**: `swap(a[x][j], a[y][j])` pentru fiecare `j`;
- **vecinii unui element** — se folosesc vectori de direcție:
```cpp
int di[] = {-1, 0, 1, 0}, dj[] = {0, 1, 0, -1};   // sus, dreapta, jos, stânga
for (int d = 0; d < 4; d++) {
    int ni = i + di[d], nj = j + dj[d];
    if (ni >= 1 && ni <= n && nj >= 1 && nj <= m) { /* vecin valid */ }
}
```
- **bordare**: punem o „ramă” de valori speciale (ex. -1) pe linia 0, n+1 și coloana 0, m+1 ca să nu mai verificăm marginile.

## Proiectele

- **`operatii_matrice.cpp`** — citește o matrice din `matrice.in` și afișează: sume pe linii/coloane, diagonale, zonele, transpusa, parcurgerea în spirală, elementele „șa” și verifică dacă e simetrică / pătrat magic.
- **`x_si_0.cpp`** — jocul X și 0 pe o tablă 3×3, pentru doi jucători, cu detectarea câștigătorului (linie, coloană, diagonale) și un mod contra calculatorului.

## Exerciții

1. ★ Afișează linia cu suma maximă.
2. ★ Construiește matricea `n × n` cu `a[i][j] = min(i, j)`.
3. ★★ Interschimbă prima coloană cu ultima, apoi șterge linia `k`.
4. ★★ Construiește matricea „tablă de șah” cu 0 și 1, apoi matricea completată în spirală cu 1, 2, …, n².
5. ★★ Câte elemente sunt mai mari decât toți vecinii lor (sus, jos, stânga, dreapta)?
6. ★★★ Rotește o matrice pătratică cu 90° în sensul acelor de ceasornic.
7. ★★★ Îmbunătățește calculatorul din X și 0 să nu piardă niciodată (indiciu: capitolul 09, recursivitate — algoritmul minimax).
