// Proiect 10 - Generatorul (combinatorica + backtracking)
// Concepte: n!, aranjamente, combinari, triunghiul lui Pascal, backtracking
#include <iostream>
#include <cstdlib>   // abs
using namespace std;

int x[25], n, k, nrSol;
bool folosit[25];

void afiseaza(int lung) {
    nrSol++;
    for (int i = 1; i <= lung; i++) cout << x[i] << " ";
    cout << "\n";
}

// ---------- permutari: n elemente, toate distincte ----------
void permutari(int pas) {
    for (int v = 1; v <= n; v++)
        if (!folosit[v]) {
            x[pas] = v;
            folosit[v] = true;
            if (pas == n) afiseaza(n);
            else permutari(pas + 1);
            folosit[v] = false;            // eliberam valoarea pentru alte variante
        }
}

// ---------- aranjamente: k din n, conteaza ordinea ----------
void aranjamente(int pas) {
    for (int v = 1; v <= n; v++)
        if (!folosit[v]) {
            x[pas] = v;
            folosit[v] = true;
            if (pas == k) afiseaza(k);
            else aranjamente(pas + 1);
            folosit[v] = false;
        }
}

// ---------- combinari: k din n, in ordine strict crescatoare ----------
void combinari(int pas) {
    // incepem de la x[pas-1] + 1; ne oprim la n - k + pas (sa mai ramana loc pentru restul)
    for (int v = x[pas - 1] + 1; v <= n - k + pas; v++) {
        x[pas] = v;
        if (pas == k) afiseaza(k);
        else combinari(pas + 1);
    }
}

// ---------- submultimi: x[i] = 1 daca elementul i e in submultime ----------
void submultimi(int pas) {
    for (int v = 0; v <= 1; v++) {
        x[pas] = v;
        if (pas == n) {
            nrSol++;
            cout << "{ ";
            for (int i = 1; i <= n; i++) if (x[i]) cout << i << " ";
            cout << "}\n";
        }
        else submultimi(pas + 1);
    }
}

// ---------- produs cartezian: x[i] ia valori din 1..card[i] ----------
int card[25];
void produsCartezian(int pas) {
    for (int v = 1; v <= card[pas]; v++) {
        x[pas] = v;
        if (pas == n) afiseaza(n);
        else produsCartezian(pas + 1);
    }
}

// ---------- n regine: x[i] = coloana reginei de pe linia i ----------
bool poatePune(int linie) {
    for (int i = 1; i < linie; i++) {
        if (x[i] == x[linie]) return false;                      // aceeasi coloana
        if (abs(x[i] - x[linie]) == linie - i) return false;     // aceeasi diagonala
    }
    return true;
}
void regine(int linie, bool deseneaza) {
    for (int c = 1; c <= n; c++) {
        x[linie] = c;
        if (poatePune(linie)) {
            if (linie == n) {
                nrSol++;
                if (deseneaza && nrSol <= 3) {                   // desenam primele 3 solutii
                    cout << "Solutia " << nrSol << ":\n";
                    for (int i = 1; i <= n; i++) {
                        for (int j = 1; j <= n; j++) cout << (x[i] == j ? " Q" : " .");
                        cout << "\n";
                    }
                }
            }
            else regine(linie + 1, deseneaza);
        }
    }
}

// ---------- plata unei sume cu bancnote ----------
int valoare[10], nrTipuri, S, cate[10];
void plata(int tip, int sumaCurenta) {
    if (tip > nrTipuri) {
        if (sumaCurenta == S) {
            nrSol++;
            cout << S << " = ";
            bool primul = true;
            for (int i = 1; i <= nrTipuri; i++)
                if (cate[i]) {
                    cout << (primul ? "" : " + ") << cate[i] << " x " << valoare[i];
                    primul = false;
                }
            cout << "\n";
        }
        return;
    }
    // folosim de 0, 1, 2, ... ori bancnota curenta, cat timp nu depasim suma
    for (int c = 0; sumaCurenta + c * valoare[tip] <= S; c++) {
        cate[tip] = c;
        plata(tip + 1, sumaCurenta + c * valoare[tip]);
    }
    cate[tip] = 0;
}

// ---------- formule ----------
long long fact(int n) {
    long long f = 1;
    for (int i = 2; i <= n; i++) f *= i;
    return f;
}
long long aranj(int n, int k) {        // n * (n-1) * ... * (n-k+1), fara a calcula n!
    long long r = 1;
    for (int i = n - k + 1; i <= n; i++) r *= i;
    return r;
}
long long C[61][61];
void pascal() {                        // C[i][j] = C[i-1][j-1] + C[i-1][j]
    for (int i = 0; i <= 60; i++) {
        C[i][0] = C[i][i] = 1;
        for (int j = 1; j < i; j++) C[i][j] = C[i - 1][j - 1] + C[i - 1][j];
    }
}

int main() {
    pascal();
    int opt;
    do {
        cout << "\n===== GENERATOR =====\n";
        cout << "1. Formule (n!, A, C, 2^n)    2. Triunghiul lui Pascal\n";
        cout << "3. Permutari                  4. Aranjamente\n";
        cout << "5. Combinari                  6. Submultimi\n";
        cout << "7. Produs cartezian           8. n regine\n";
        cout << "9. Plata unei sume            0. Iesire\nOptiune: ";
        cin >> opt;
        nrSol = 0;
        x[0] = 0;
        for (int i = 0; i < 25; i++) folosit[i] = false;

        if (opt == 1) {
            cout << "n k = "; cin >> n >> k;
            if (n < 0 || n > 20 || k < 0 || k > n) { cout << "Alege 0 <= k <= n <= 20\n"; continue; }
            cout << n << "! = " << fact(n) << "\n";
            cout << "A(" << n << "," << k << ") = " << aranj(n, k) << "\n";
            cout << "C(" << n << "," << k << ") = " << C[n][k] << "\n";
            cout << "2^" << n << " = " << (1LL << n) << " submultimi\n";
        }
        else if (opt == 2) {
            cout << "Cate linii? "; cin >> n;
            if (n > 20) n = 20;
            for (int i = 0; i < n; i++) {
                for (int s = 0; s < n - i - 1; s++) cout << "  ";   // centrare
                for (int j = 0; j <= i; j++) {
                    cout << C[i][j];
                    // spatiere aproximativa in functie de numarul de cifre
                    long long t = C[i][j];
                    int cif = 0;
                    do { cif++; t /= 10; } while (t);
                    for (int s = cif; s < 4; s++) cout << ' ';
                }
                cout << "\n";
            }
        }
        else if (opt == 3) {
            cout << "n = "; cin >> n;
            if (n < 1 || n > 9) { cout << "Alege 1 <= n <= 9\n"; continue; }
            permutari(1);
            cout << "Total: " << nrSol << " (n! = " << fact(n) << ")\n";
        }
        else if (opt == 4) {
            cout << "n k = "; cin >> n >> k;
            if (k < 1 || k > n || n > 12) { cout << "Alege 1 <= k <= n <= 12\n"; continue; }
            aranjamente(1);
            cout << "Total: " << nrSol << "\n";
        }
        else if (opt == 5) {
            cout << "n k = "; cin >> n >> k;
            if (k < 1 || k > n || n > 20) { cout << "Alege 1 <= k <= n <= 20\n"; continue; }
            combinari(1);
            cout << "Total: " << nrSol << " (C = " << C[n][k] << ")\n";
        }
        else if (opt == 6) {
            cout << "n = "; cin >> n;
            if (n < 1 || n > 12) { cout << "Alege 1 <= n <= 12\n"; continue; }
            submultimi(1);
            cout << "Total: " << nrSol << "\n";
        }
        else if (opt == 7) {
            cout << "Cate multimi? "; cin >> n;
            if (n < 1 || n > 6) { cout << "Alege intre 1 si 6\n"; continue; }
            for (int i = 1; i <= n; i++) {
                cout << "Cardinalul multimii " << i << ": ";
                cin >> card[i];
            }
            produsCartezian(1);
            cout << "Total: " << nrSol << "\n";
        }
        else if (opt == 8) {
            cout << "n = "; cin >> n;
            if (n < 1 || n > 12) { cout << "Alege 1 <= n <= 12\n"; continue; }
            regine(1, true);
            cout << "Total: " << nrSol << " solutii pentru " << n << " regine\n";
        }
        else if (opt == 9) {
            cout << "Suma: "; cin >> S;
            cout << "Cate tipuri de bancnote? "; cin >> nrTipuri;
            if (nrTipuri < 1 || nrTipuri > 9) { cout << "Alege intre 1 si 9\n"; continue; }
            cout << "Valorile: ";
            bool ok = true;
            for (int i = 1; i <= nrTipuri; i++) {
                cin >> valoare[i];
                if (valoare[i] <= 0) ok = false;
            }
            if (!ok) { cout << "Valorile trebuie sa fie pozitive\n"; continue; }
            plata(1, 0);
            cout << "Total: " << nrSol << " moduri\n";
        }
    } while (opt != 0);
    return 0;
}
