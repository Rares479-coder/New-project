// Proiect 04 - Gestiunea unui vector
// Concepte: citire/afisare, inserare, stergere, sortari, cautare binara, interclasare, frecvente
#include <iostream>
using namespace std;

const int NMAX = 1000;
int v[NMAX + 1], n = 0;      // vector global, indexat de la 1

int main() {
    int opt;
    do {
        cout << "\n========== VECTOR (n = " << n << ") ==========\n";
        cout << " 1. Citeste vector nou         2. Afiseaza\n";
        cout << " 3. Insereaza pe pozitie       4. Sterge de pe pozitie\n";
        cout << " 5. Minim, maxim, suma, medie  6. Sortare prin selectie\n";
        cout << " 7. Bubble sort descrescator   8. Cautare liniara\n";
        cout << " 9. Cautare binara            10. Inversare\n";
        cout << "11. Elimina duplicatele       12. Interclaseaza cu alt vector\n";
        cout << "13. Frecventa cifrelor        14. Rotire la stanga cu k\n";
        cout << "15. Cea mai lunga secventa crescatoare\n";
        cout << " 0. Iesire\nOptiune: ";
        cin >> opt;

        if (opt == 1) {
            cout << "n = "; cin >> n;
            if (n > NMAX) n = NMAX;
            cout << "Elementele: ";
            for (int i = 1; i <= n; i++) cin >> v[i];
        }
        else if (opt == 2) {
            for (int i = 1; i <= n; i++) cout << v[i] << " ";
            cout << "\n";
        }
        else if (opt == 3) {
            int p, x;
            cout << "Pozitia (1.." << n + 1 << ") si valoarea: ";
            cin >> p >> x;
            if (p < 1 || p > n + 1 || n == NMAX) { cout << "Pozitie invalida\n"; continue; }
            for (int i = n; i >= p; i--) v[i + 1] = v[i];   // facem loc, mutand spre dreapta
            v[p] = x;
            n++;
        }
        else if (opt == 4) {
            int p;
            cout << "Pozitia (1.." << n << "): ";
            cin >> p;
            if (p < 1 || p > n) { cout << "Pozitie invalida\n"; continue; }
            for (int i = p; i < n; i++) v[i] = v[i + 1];    // acoperim golul, mutand spre stanga
            n--;
        }
        else if (opt == 5) {
            if (n == 0) { cout << "Vector gol\n"; continue; }
            int mn = v[1], mx = v[1], pmn = 1, pmx = 1;
            long long s = 0;
            for (int i = 1; i <= n; i++) {
                s += v[i];
                if (v[i] < mn) { mn = v[i]; pmn = i; }
                if (v[i] > mx) { mx = v[i]; pmx = i; }
            }
            cout << "Minim " << mn << " (poz " << pmn << "), maxim " << mx << " (poz " << pmx << ")\n";
            cout << "Suma " << s << ", media " << (double)s / n << "\n";
        }
        else if (opt == 6) {
            for (int i = 1; i < n; i++) {
                int pmin = i;                        // cautam minimul din v[i..n]
                for (int j = i + 1; j <= n; j++)
                    if (v[j] < v[pmin]) pmin = j;
                swap(v[i], v[pmin]);                 // si il punem pe pozitia i
            }
            cout << "Sortat crescator.\n";
        }
        else if (opt == 7) {
            bool schimbat;
            do {
                schimbat = false;
                for (int i = 1; i < n; i++)
                    if (v[i] < v[i + 1]) { swap(v[i], v[i + 1]); schimbat = true; }
            } while (schimbat);
            cout << "Sortat descrescator.\n";
        }
        else if (opt == 8) {
            int x, cnt = 0;
            cout << "Valoarea cautata: "; cin >> x;
            cout << "Apare pe pozitiile: ";
            for (int i = 1; i <= n; i++)
                if (v[i] == x) { cout << i << " "; cnt++; }
            if (cnt == 0) cout << "nicaieri";
            cout << "\n";
        }
        else if (opt == 9) {
            // verificam intai ca vectorul e sortat crescator
            bool sortat = true;
            for (int i = 1; i < n; i++) if (v[i] > v[i + 1]) sortat = false;
            if (!sortat) { cout << "Vectorul trebuie sortat crescator (optiunea 6)!\n"; continue; }
            int x;
            cout << "Valoarea cautata: "; cin >> x;
            int st = 1, dr = n, poz = -1, pasi = 0;
            while (st <= dr && poz == -1) {
                int m = (st + dr) / 2;
                pasi++;
                if (v[m] == x) poz = m;
                else if (v[m] < x) st = m + 1;   // e in dreapta
                else dr = m - 1;                 // e in stanga
            }
            if (poz != -1) cout << "Gasit pe pozitia " << poz;
            else cout << "Nu exista";
            cout << " (in " << pasi << " pasi)\n";
        }
        else if (opt == 10) {
            for (int i = 1, j = n; i < j; i++, j--) swap(v[i], v[j]);
            cout << "Inversat.\n";
        }
        else if (opt == 11) {
            // pastram doar prima aparitie a fiecarei valori; k = cate elemente am pastrat
            int k = 0;
            for (int i = 1; i <= n; i++) {
                bool exista = false;
                for (int j = 1; j <= k && !exista; j++)
                    if (v[j] == v[i]) exista = true;
                if (!exista) v[++k] = v[i];
            }
            cout << "Am eliminat " << n - k << " elemente.\n";
            n = k;
        }
        else if (opt == 12) {
            int m, w[NMAX + 1], r[2 * NMAX + 1];
            cout << "Atentie: ambii vectori trebuie sortati crescator.\n";
            cout << "m = "; cin >> m;
            if (m > NMAX) m = NMAX;
            cout << "Elementele: ";
            for (int i = 1; i <= m; i++) cin >> w[i];
            int i = 1, j = 1, k = 0;
            while (i <= n && j <= m) {                 // luam mereu elementul mai mic
                if (v[i] <= w[j]) r[++k] = v[i++];
                else r[++k] = w[j++];
            }
            while (i <= n) r[++k] = v[i++];            // ce a ramas din v
            while (j <= m) r[++k] = w[j++];            // ce a ramas din w
            cout << "Rezultat: ";
            for (int t = 1; t <= k; t++) cout << r[t] << " ";
            cout << "\n";
        }
        else if (opt == 13) {
            int fr[10] = {0};
            for (int i = 1; i <= n; i++) {
                int x = v[i] < 0 ? -v[i] : v[i];
                do { fr[x % 10]++; x /= 10; } while (x > 0);
            }
            for (int c = 0; c <= 9; c++)
                if (fr[c]) cout << "cifra " << c << ": " << fr[c] << " ori\n";
        }
        else if (opt == 14) {
            int k;
            cout << "k = "; cin >> k;
            if (n == 0) continue;
            k %= n;
            for (int pas = 1; pas <= k; pas++) {       // rotim cu cate o pozitie de k ori
                int prim = v[1];
                for (int i = 1; i < n; i++) v[i] = v[i + 1];
                v[n] = prim;
            }
            cout << "Rotit.\n";
        }
        else if (opt == 15) {
            if (n == 0) continue;
            int lung = 1, lmax = 1, inceput = 1, incMax = 1;
            for (int i = 2; i <= n; i++) {
                if (v[i] > v[i - 1]) lung++;
                else { lung = 1; inceput = i; }
                if (lung > lmax) { lmax = lung; incMax = inceput; }
            }
            cout << "Lungime " << lmax << ": ";
            for (int i = incMax; i < incMax + lmax; i++) cout << v[i] << " ";
            cout << "\n";
        }
    } while (opt != 0);
    return 0;
}
