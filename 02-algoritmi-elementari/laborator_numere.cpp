// Proiect 02 - Laboratorul de numere
// Concepte: prelucrarea cifrelor, divizori, numere prime, cmmdc, baze de numeratie, Fibonacci
// (aici scriem totul in main, cu bucle; in capitolul 08 vom muta fiecare algoritm intr-o functie)
#include <iostream>
using namespace std;

int main() {
    long long n;
    cout << "Introdu un numar natural: ";
    cin >> n;

    cout << "\n===== RAPORT PENTRU " << n << " =====\n";

    // ---------- 1. Cifre: numar, suma, produs, cifra maxima ----------
    long long copie = n;
    int nrCifre = 0, suma = 0, cifMax = 0;
    long long produs = 1;
    if (copie == 0) { nrCifre = 1; produs = 0; }
    while (copie > 0) {
        int c = copie % 10;
        nrCifre++;
        suma += c;
        produs *= c;
        if (c > cifMax) cifMax = c;
        copie /= 10;
    }
    cout << "Numar de cifre:    " << nrCifre << "\n";
    cout << "Suma cifrelor:     " << suma << "\n";
    cout << "Produsul cifrelor: " << produs << "\n";
    cout << "Cifra maxima:      " << cifMax << "\n";

    // ---------- 2. Oglindit si palindrom ----------
    long long ogl = 0;
    copie = n;
    while (copie > 0) {
        ogl = ogl * 10 + copie % 10;
        copie /= 10;
    }
    cout << "Oglinditul:        " << ogl << "\n";
    cout << "Palindrom:         " << (ogl == n ? "DA" : "NU") << "\n";

    // ---------- 3. Divizori (pana la radical) ----------
    int nrDiv = 0;
    long long sumaDiv = 0;
    cout << "Divizori:          ";
    for (long long d = 1; d * d <= n; d++) {
        if (n % d == 0) {
            cout << d << " ";
            nrDiv++;
            sumaDiv += d;
            if (d != n / d) {          // nu numaram de doua ori radicalul (ex: 36 -> 6)
                cout << n / d << " ";
                nrDiv++;
                sumaDiv += n / d;
            }
        }
    }
    cout << "(" << nrDiv << " divizori, nu sunt in ordine)\n";

    // ---------- 4. Prim si perfect ----------
    // un numar e prim daca are exact 2 divizori
    cout << "Prim:              " << (nrDiv == 2 ? "DA" : "NU") << "\n";
    // perfect = suma divizorilor proprii (fara n) este n, ex: 6 = 1 + 2 + 3
    cout << "Perfect:           " << (n > 0 && sumaDiv - n == n ? "DA" : "NU") << "\n";

    // ---------- 5. Descompunere in factori primi ----------
    if (n > 1) {
        cout << "Factori primi:     ";
        copie = n;
        bool primul = true;
        for (long long d = 2; copie > 1; d++) {
            // optimizare: daca d*d > copie, ce a ramas e prim
            if (d * d > copie) d = copie;
            int p = 0;
            while (copie % d == 0) {
                copie /= d;
                p++;
            }
            if (p > 0) {
                if (!primul) cout << " * ";
                cout << d;
                if (p > 1) cout << "^" << p;
                primul = false;
            }
        }
        cout << "\n";
    }

    // ---------- 6. Scrierea in baza 2 ----------
    // resturile impartirilor repetate la 2, citite de la ultimul la primul
    // le pastram intr-un vector (vezi capitolul 04) ca sa le afisam invers
    int biti[64], k = 0;
    copie = n;
    do {
        biti[k++] = copie % 2;
        copie /= 2;
    } while (copie > 0);
    cout << "In baza 2:         ";
    for (int i = k - 1; i >= 0; i--) cout << biti[i];
    cout << "\n";

    // ---------- 7. Este termen Fibonacci? ----------
    long long a = 0, b = 1;   // F0 = 0, F1 = 1
    while (b < n) {
        long long c = a + b;
        a = b;
        b = c;
    }
    cout << "Termen Fibonacci:  " << (b == n || n == 0 ? "DA" : "NU") << "\n";

    // ---------- 8. CMMDC si CMMMC pentru doua numere ----------
    long long x, y;
    cout << "\nIntrodu doua numere pentru cmmdc/cmmmc: ";
    cin >> x >> y;
    long long r, p = x, q = y;
    while (q != 0) {           // algoritmul lui Euclid
        r = p % q;
        p = q;
        q = r;
    }
    cout << "cmmdc(" << x << ", " << y << ") = " << p << "\n";
    if (p != 0) cout << "cmmmc(" << x << ", " << y << ") = " << x / p * y << "\n";
    if (p == 1) cout << "Numerele sunt prime intre ele.\n";

    return 0;
}
