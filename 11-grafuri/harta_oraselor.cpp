// Proiect 11a - Harta oraselor (graf neorientat cu costuri)
// Concepte: matrice de adiacenta, grade, BFS, DFS, componente conexe, cicluri, Roy-Floyd
#include <iostream>
#include <fstream>
#include <iomanip>
using namespace std;

const int INF = 1000000000;
int n, m;
int a[101][101];        // a[i][j] = 1 daca exista muchie
int cost[101][101];     // distanta drumului direct i - j
int d[101][101];        // distante minime (Roy-Floyd)
int urm[101][101];      // urm[i][j] = urmatorul nod pe drumul minim de la i la j
int viz[101];

void dfs(int x, int componenta) {
    viz[x] = componenta;
    cout << x << " ";
    for (int y = 1; y <= n; y++)
        if (a[x][y] && !viz[y]) dfs(y, componenta);
}

// BFS de la start; tata[] permite refacerea drumului, dist[] = numarul de muchii
void bfs(int start, int dist[], int tata[], bool afiseaza) {
    int coada[101], st = 1, dr = 1;
    bool vizitat[101] = {false};
    for (int i = 1; i <= n; i++) { dist[i] = -1; tata[i] = 0; }
    coada[1] = start;
    vizitat[start] = true;
    dist[start] = 0;
    while (st <= dr) {
        int x = coada[st++];
        if (afiseaza) cout << x << " ";
        for (int y = 1; y <= n; y++)
            if (a[x][y] && !vizitat[y]) {
                vizitat[y] = true;
                dist[y] = dist[x] + 1;
                tata[y] = x;
                coada[++dr] = y;
            }
    }
}

void afiseazaDrumBFS(int tata[], int x) {   // recursiv: intai drumul pana la tata, apoi x
    if (tata[x] != 0) {
        afiseazaDrumBFS(tata, tata[x]);
        cout << " -> ";
    }
    cout << x;
}

int main() {
    ifstream fin("harta.in");
    if (!fin) { cout << "Nu gasesc harta.in\n"; return 1; }
    fin >> n >> m;
    for (int i = 1; i <= m; i++) {
        int x, y, c;
        fin >> x >> y >> c;
        a[x][y] = a[y][x] = 1;
        cost[x][y] = cost[y][x] = c;
    }

    // ---------- matricea de adiacenta ----------
    cout << "Matricea de adiacenta:\n   ";
    for (int j = 1; j <= n; j++) cout << setw(2) << j;
    cout << "\n";
    for (int i = 1; i <= n; i++) {
        cout << setw(2) << i << " ";
        for (int j = 1; j <= n; j++) cout << setw(2) << a[i][j];
        cout << "\n";
    }

    // ---------- grade ----------
    int grad[101] = {0}, sumaGrade = 0;
    bool toateGradelePare = true;
    cout << "\nGrade: ";
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) grad[i] += a[i][j];
        sumaGrade += grad[i];
        if (grad[i] % 2) toateGradelePare = false;
        cout << "d(" << i << ")=" << grad[i] << " ";
    }
    cout << "\nSuma gradelor = " << sumaGrade << " = 2 * " << m << " muchii\n";
    cout << "Noduri terminale (grad 1): ";
    for (int i = 1; i <= n; i++) if (grad[i] == 1) cout << i << " ";
    cout << "\nNoduri izolate (grad 0): ";
    for (int i = 1; i <= n; i++) if (grad[i] == 0) cout << i << " ";
    cout << "\n";

    // ---------- parcurgeri ----------
    int dist[101], tata[101];
    cout << "\nBFS din 1: ";
    bfs(1, dist, tata, true);
    cout << "\nDFS din 1: ";
    dfs(1, 1);
    cout << "\n";

    // ---------- componente conexe ----------
    for (int i = 1; i <= n; i++) viz[i] = 0;
    int nrComp = 0;
    cout << "\nComponente conexe:\n";
    for (int i = 1; i <= n; i++)
        if (!viz[i]) {
            nrComp++;
            cout << "  componenta " << nrComp << ": ";
            dfs(i, nrComp);
            cout << "\n";
        }
    bool conex = (nrComp == 1);
    cout << "Graful " << (conex ? "este" : "nu este") << " conex";
    if (!conex) cout << " (ar trebui adaugate minim " << nrComp - 1 << " muchii)";
    cout << "\n";
    // un graf fara cicluri cu p componente are exact n - p muchii
    cout << "Are cicluri: " << (m > n - nrComp ? "DA" : "NU") << "\n";
    cout << "Este arbore: " << (conex && m == n - 1 ? "DA" : "NU") << "\n";
    cout << "Este eulerian: " << (conex && toateGradelePare ? "DA" : "NU") << "\n";

    // ---------- Roy-Floyd: distante minime intre toate perechile ----------
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++) {
            if (i == j) d[i][j] = 0;
            else if (a[i][j]) d[i][j] = cost[i][j];
            else d[i][j] = INF;
            urm[i][j] = (a[i][j] ? j : 0);
        }
    for (int k = 1; k <= n; k++)
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                if (d[i][k] < INF && d[k][j] < INF && d[i][k] + d[k][j] < d[i][j]) {
                    d[i][j] = d[i][k] + d[k][j];
                    urm[i][j] = urm[i][k];       // ca sa ajungem la j, mergem intai spre k
                }

    cout << "\nDistante minime (Roy-Floyd), - = nu exista drum:\n   ";
    for (int j = 1; j <= n; j++) cout << setw(4) << j;
    cout << "\n";
    for (int i = 1; i <= n; i++) {
        cout << setw(2) << i << " ";
        for (int j = 1; j <= n; j++)
            if (d[i][j] == INF) cout << setw(4) << "-";
            else cout << setw(4) << d[i][j];
        cout << "\n";
    }

    // ---------- interogari ----------
    int x, y;
    cout << "\nDe la ce oras la ce oras? ";
    while (cin >> x >> y) {
        if (x < 1 || x > n || y < 1 || y > n) { cout << "Noduri intre 1 si " << n << "\n"; break; }
        if (d[x][y] == INF) {
            cout << "Nu exista drum intre " << x << " si " << y << "\n";
        } else {
            bfs(x, dist, tata, false);
            cout << "Cele mai putine muchii (" << dist[y] << "): ";
            afiseazaDrumBFS(tata, y);
            cout << "\nCea mai scurta distanta (" << d[x][y] << " km): " << x;
            for (int t = x; t != y; ) {
                t = urm[t][y];
                cout << " -> " << t;
            }
            cout << "\n";
        }
        cout << "\nAlta pereche (sau Ctrl+D / Ctrl+Z pentru iesire)? ";
    }
    cout << "\n";
    return 0;
}
