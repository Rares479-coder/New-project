// Proiect 05a - Operatii pe matrice
// Concepte: citire din fisier, sume pe linii/coloane, diagonale, zone, transpusa, spirala
#include <iostream>
#include <fstream>
#include <iomanip>
using namespace std;

int a[101][101], n, m;

int main() {
    ifstream fin("matrice.in");
    if (!fin) { cout << "Nu gasesc matrice.in\n"; return 1; }
    fin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            fin >> a[i][j];

    // ---------- afisare, cu suma pe linii si pe coloane ----------
    cout << "Matricea (ultima coloana / linie = sume):\n";
    int sumaCol[101] = {0};
    for (int i = 1; i <= n; i++) {
        int sumaLin = 0;
        for (int j = 1; j <= m; j++) {
            cout << setw(4) << a[i][j];
            sumaLin += a[i][j];
            sumaCol[j] += a[i][j];
        }
        cout << "  |" << setw(4) << sumaLin << "\n";
    }
    for (int j = 1; j <= m; j++) cout << "----";
    cout << "\n";
    for (int j = 1; j <= m; j++) cout << setw(4) << sumaCol[j];
    cout << "\n\n";

    // ---------- maximul si pozitiile lui ----------
    int mx = a[1][1];
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            if (a[i][j] > mx) mx = a[i][j];
    cout << "Maximul " << mx << " apare pe pozitiile: ";
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            if (a[i][j] == mx) cout << "(" << i << "," << j << ") ";
    cout << "\n";

    // ---------- transpusa ----------
    cout << "\nTranspusa:\n";
    for (int j = 1; j <= m; j++) {          // liniile transpusei = coloanele lui a
        for (int i = 1; i <= n; i++) cout << setw(4) << a[i][j];
        cout << "\n";
    }

    // ---------- parcurgerea in spirala ----------
    cout << "\nSpirala: ";
    int sus = 1, jos = n, st = 1, dr = m;
    while (sus <= jos && st <= dr) {
        for (int j = st; j <= dr; j++) cout << a[sus][j] << " ";        // linia de sus ->
        sus++;
        for (int i = sus; i <= jos; i++) cout << a[i][dr] << " ";       // coloana din dreapta v
        dr--;
        if (sus <= jos) {
            for (int j = dr; j >= st; j--) cout << a[jos][j] << " ";    // linia de jos <-
            jos--;
        }
        if (st <= dr) {
            for (int i = jos; i >= sus; i--) cout << a[i][st] << " ";   // coloana din stanga ^
            st++;
        }
    }
    cout << "\n";

    // ---------- puncte sa: minim pe linie si maxim pe coloana ----------
    cout << "\nPuncte sa (minim pe linia lui, maxim pe coloana lui): ";
    bool gasit = false;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            bool ok = true;
            for (int k = 1; k <= m && ok; k++) if (a[i][k] < a[i][j]) ok = false;
            for (int k = 1; k <= n && ok; k++) if (a[k][j] > a[i][j]) ok = false;
            if (ok) { cout << a[i][j] << " la (" << i << "," << j << ") "; gasit = true; }
        }
    if (!gasit) cout << "nu exista";
    cout << "\n";

    // ---------- operatii doar pentru matrice patratica ----------
    if (n != m) {
        cout << "\nMatricea nu e patratica: sar peste diagonale si zone.\n";
        return 0;
    }

    int sDP = 0, sDS = 0, sSub = 0, sDeasupra = 0, sNord = 0, sSud = 0, sEst = 0, sVest = 0;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++) {
            if (i == j) sDP += a[i][j];
            if (i + j == n + 1) sDS += a[i][j];
            if (i > j) sSub += a[i][j];
            if (i < j) sDeasupra += a[i][j];
            // cele 4 zone delimitate de ambele diagonale (fara elementele de pe diagonale)
            if (i < j && i + j < n + 1) sNord += a[i][j];
            if (i > j && i + j > n + 1) sSud += a[i][j];
            if (i < j && i + j > n + 1) sEst += a[i][j];
            if (i > j && i + j < n + 1) sVest += a[i][j];
        }
    cout << "\nDiagonala principala: " << sDP << ", diagonala secundara: " << sDS << "\n";
    cout << "Sub diagonala principala: " << sSub << ", deasupra: " << sDeasupra << "\n";
    cout << "Zone: nord " << sNord << ", sud " << sSud << ", est " << sEst << ", vest " << sVest << "\n";

    // simetrica fata de diagonala principala?
    bool simetrica = true;
    for (int i = 1; i <= n && simetrica; i++)
        for (int j = i + 1; j <= n; j++)
            if (a[i][j] != a[j][i]) simetrica = false;
    cout << "Simetrica: " << (simetrica ? "DA" : "NU") << "\n";

    // patrat magic: toate liniile, coloanele si cele doua diagonale au aceeasi suma
    bool magic = (sDP == sDS);
    for (int i = 1; i <= n && magic; i++) {
        int sl = 0, sc = 0;
        for (int j = 1; j <= n; j++) { sl += a[i][j]; sc += a[j][i]; }
        if (sl != sDP || sc != sDP) magic = false;
    }
    cout << "Patrat magic: " << (magic ? "DA" : "NU") << "\n";

    return 0;
}
