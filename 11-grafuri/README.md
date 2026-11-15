# 11. Elemente de teoria grafurilor

Un **graf** G = (X, U) este o mulțime de **noduri** (vârfuri) X și o mulțime de **muchii** U care leagă perechi de noduri. Exemple: orașe și drumuri, persoane și prietenii, pagini web și link-uri.

## Noțiuni
- **graf neorientat**: muchia [x, y] = muchia [y, x]; **orientat**: arcul (x, y) are sens.
- **gradul** unui nod = numărul de muchii incidente cu el. Suma gradelor = 2 · numărul de muchii.
  La grafuri orientate: grad intern (arce care intră) și grad extern (arce care ies).
- **nod izolat**: grad 0; **nod terminal**: grad 1.
- **lanț** (drum, la orientate): succesiune de noduri legate prin muchii; **elementar** dacă nodurile sunt distincte.
- **ciclu**: lanț care începe și se termină în același nod.
- **graf conex**: există lanț între oricare două noduri. **Componentă conexă**: subgraf conex maximal.
- **graf complet** cu n noduri: are n(n−1)/2 muchii.
- **graf hamiltonian**: are un ciclu care trece o dată prin fiecare **nod**; **eulerian**: ciclu care trece o dată prin fiecare **muchie** (conex + toate gradele pare).
- **arbore**: graf conex fără cicluri; are exact n − 1 muchii.

## Reprezentări

**Matricea de adiacență** — `a[i][j] = 1` dacă există muchie între i și j (simetrică la neorientat):
```cpp
int a[101][101];
fin >> n >> m;
for (int i = 1; i <= m; i++) { fin >> x >> y; a[x][y] = a[y][x] = 1; }
```
**Liste de adiacență** — pentru fiecare nod, vecinii lui (`vector<int> L[101]`); mai eficient la grafuri mari.

**Lista muchiilor** — un vector de perechi (x, y).

**Vectorul de tați** (pentru arbori) — `tata[i]` = părintele nodului `i`, iar rădăcina are `tata = 0`.

## Parcurgeri

**În lățime (BFS)** — vizitează nodurile în ordinea distanței față de start, cu o coadă. Dă **cel mai scurt drum** (în număr de muchii).
```cpp
int coada[101], st = 1, dr = 1;
coada[1] = start; viz[start] = 1;
while (st <= dr) {
    int x = coada[st++];
    for (int y = 1; y <= n; y++)
        if (a[x][y] && !viz[y]) { viz[y] = 1; coada[++dr] = y; }
}
```

**În adâncime (DFS)** — merge cât mai departe pe un drum, apoi revine (recursiv):
```cpp
void dfs(int x) {
    viz[x] = 1;
    for (int y = 1; y <= n; y++)
        if (a[x][y] && !viz[y]) dfs(y);
}
```
**Componente conexe**: pornești un DFS din fiecare nod încă nevizitat; numărul de porniri = numărul de componente.

## Drumuri minime în grafuri cu costuri
- **Roy-Floyd** (toate perechile, O(n³)):
```cpp
for (k = 1..n) for (i = 1..n) for (j = 1..n)
    if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
```
- **Dijkstra** (de la un nod la toate celelalte, costuri pozitive).

## Proiectele

- **`harta_oraselor.cpp`** — citește din `harta.in` un graf neorientat cu costuri (orașe și distanțe) și afișează: matricea de adiacență, gradele, nodurile izolate, BFS, DFS, componentele conexe, dacă e conex / arbore / eulerian, cel mai scurt drum ca număr de muchii (BFS) și ca distanță (Roy-Floyd, cu reconstituirea drumului), și dacă graful are cicluri.
- **`arbori.cpp`** — citește un arbore dat prin vectorul de tați (`arbore.in`) și afișează: rădăcina, frunzele, fiii fiecărui nod, nivelul fiecărui nod, înălțimea, drumul de la un nod la rădăcină.

## Exerciții

1. ★ Citește un graf și afișează nodul (nodurile) cu gradul maxim.
2. ★ Verifică dacă o succesiune de noduri dată este un lanț în graf; dacă da, este elementar?
3. ★★ Câte muchii trebuie adăugate ca graful să devină complet? Dar ca să devină conex?
4. ★★ Verifică dacă graful este bipartit (nodurile se pot colora cu 2 culori, fără muchii între noduri de aceeași culoare) — BFS cu culori.
5. ★★ Pentru un graf orientat dat prin lista arcelor, afișează gradul intern și extern al fiecărui nod.
6. ★★ Pentru un arbore dat prin vectorul de tați, afișează nodurile de pe un anumit nivel și cel mai apropiat strămoș comun a două noduri.
7. ★★★ Implementează Dijkstra și compară rezultatele cu Roy-Floyd.
8. ★★★ Determină toate ciclurile hamiltoniene ale unui graf mic (backtracking — capitolul 10).
