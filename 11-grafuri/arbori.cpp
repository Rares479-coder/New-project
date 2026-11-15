// Proiect 11b - Arbori dati prin vectorul de tati
// Concepte: radacina, frunze, fii, niveluri, inaltime, drum spre radacina
#include <iostream>
#include <fstream>
using namespace std;

int n, tata[101];

int nivel(int x) {                 // radacina are nivelul 0
    if (tata[x] == 0) return 0;
    return 1 + nivel(tata[x]);
}

void afiseazaSubarbore(int x, int adancime) {   // afisare "indentata", ca un arbore de foldere
    for (int i = 0; i < adancime; i++) cout << "    ";
    cout << (adancime ? "|-- " : "") << x << "\n";
    for (int y = 1; y <= n; y++)
        if (tata[y] == x) afiseazaSubarbore(y, adancime + 1);
}

int main() {
    ifstream fin("arbore.in");
    if (!fin) { cout << "Nu gasesc arbore.in\n"; return 1; }
    fin >> n;
    for (int i = 1; i <= n; i++) fin >> tata[i];

    int radacina = 0;
    for (int i = 1; i <= n; i++) if (tata[i] == 0) radacina = i;
    cout << "Radacina: " << radacina << "\n";

    // fiii fiecarui nod si frunzele (noduri fara fii)
    cout << "Frunze: ";
    for (int i = 1; i <= n; i++) {
        bool areFii = false;
        for (int j = 1; j <= n; j++) if (tata[j] == i) areFii = true;
        if (!areFii) cout << i << " ";
    }
    cout << "\n";
    for (int i = 1; i <= n; i++) {
        cout << "Fiii lui " << i << ": ";
        int cnt = 0;
        for (int j = 1; j <= n; j++) if (tata[j] == i) { cout << j << " "; cnt++; }
        if (cnt == 0) cout << "-";
        cout << "\n";
    }

    // niveluri si inaltime
    int inaltime = 0;
    cout << "Niveluri: ";
    for (int i = 1; i <= n; i++) {
        int niv = nivel(i);
        cout << i << ":" << niv << " ";
        if (niv > inaltime) inaltime = niv;
    }
    cout << "\nInaltimea arborelui: " << inaltime << "\n";

    cout << "\nArborele desenat:\n";
    afiseazaSubarbore(radacina, 0);

    int x;
    cout << "\nNodul pentru drumul spre radacina: ";
    if (cin >> x && x >= 1 && x <= n) {
        cout << x;
        while (tata[x] != 0) {
            x = tata[x];
            cout << " -> " << x;
        }
        cout << "\n";
    }
    return 0;
}
