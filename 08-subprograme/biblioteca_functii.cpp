// Proiect 08 - Biblioteca de functii
// Concepte: functii cu rezultat, functii void, parametri prin valoare si prin referinta,
//           vectori ca parametri, prototipuri, refolosirea functiilor
#include <iostream>
using namespace std;

// ===================== PROTOTIPURI =====================
int nrCifre(int n);
int sumaCifre(int n);
int oglindit(int n);
bool palindrom(int n);
bool prim(int n);
int cmmdc(int a, int b);
int cmmmc(int a, int b);
int sumaDivizori(int n);
bool perfect(int n);
void cifreParImpar(int n, int &pare, int &impare);
void citesteVector(int v[], int &n);
void afiseazaVector(const int v[], int n);
void minMax(const int v[], int n, int &mn, int &mx);
void sorteaza(int v[], int n);
int cautareBinara(const int v[], int n, int x);
void stergeAparitii(int v[], int &n, int x);
void inBaza(int n, int b);

// demonstratie: prin valoare vs prin referinta
void dubleazaValoare(int x)    { x = x * 2; }   // modifica o COPIE
void dubleazaReferinta(int &x) { x = x * 2; }   // modifica ORIGINALUL

// ===================== MAIN =====================
int main() {
    int n;
    cout << "Un numar natural: ";
    cin >> n;
    cout << "nrCifre = " << nrCifre(n) << ", sumaCifre = " << sumaCifre(n)
         << ", oglindit = " << oglindit(n) << "\n";
    cout << "palindrom: " << palindrom(n) << ", prim: " << prim(n)
         << ", perfect: " << perfect(n) << "  (1 = da, 0 = nu)\n";

    int p, i;
    cifreParImpar(n, p, i);       // primim DOUA rezultate prin referinta
    cout << "cifre pare: " << p << ", impare: " << i << "\n";
    cout << "in baza 2: ";  inBaza(n, 2);  cout << ", in baza 16: ";  inBaza(n, 16);
    cout << "\n";

    int a, b;
    cout << "\nDoua numere: ";
    cin >> a >> b;
    cout << "cmmdc = " << cmmdc(a, b) << ", cmmmc = " << cmmmc(a, b) << "\n";
    // functiile se pot combina: numerele prime din [a, b] care sunt si palindroame
    cout << "Prime palindroame in [" << a << ", " << b << "]: ";
    for (int x = a; x <= b; x++)
        if (prim(x) && palindrom(x)) cout << x << " ";
    cout << "\n";

    cout << "\n--- prin valoare vs prin referinta ---\n";
    int t = 5;
    dubleazaValoare(t);
    cout << "dupa dubleazaValoare(t):   t = " << t << "  (nu s-a schimbat)\n";
    dubleazaReferinta(t);
    cout << "dupa dubleazaReferinta(t): t = " << t << " (s-a schimbat)\n";

    cout << "\n--- vectori ---\n";
    int v[1000], m;
    citesteVector(v, m);
    int mn, mx;
    minMax(v, m, mn, mx);
    cout << "minim = " << mn << ", maxim = " << mx << "\n";
    sorteaza(v, m);
    cout << "sortat: ";  afiseazaVector(v, m);
    int x;
    cout << "Ce valoare caut si sterg? ";
    cin >> x;
    int poz = cautareBinara(v, m, x);
    if (poz == -1) cout << x << " nu exista\n";
    else {
        cout << x << " gasit pe pozitia " << poz << "\n";
        stergeAparitii(v, m, x);
        cout << "dupa stergere: ";  afiseazaVector(v, m);
    }
    return 0;
}

// ===================== DEFINITII =====================
int nrCifre(int n) {
    if (n == 0) return 1;
    int k = 0;
    while (n > 0) { k++; n /= 10; }
    return k;
}

int sumaCifre(int n) {
    int s = 0;
    while (n > 0) { s += n % 10; n /= 10; }
    return s;
}

int oglindit(int n) {
    int r = 0;
    while (n > 0) { r = r * 10 + n % 10; n /= 10; }
    return r;
}

bool palindrom(int n) {
    return n == oglindit(n);          // refolosim o functie scrisa deja
}

bool prim(int n) {
    if (n < 2) return false;
    if (n % 2 == 0) return n == 2;
    for (int d = 3; d * d <= n; d += 2)   // doar divizori impari
        if (n % d == 0) return false;
    return true;
}

int cmmdc(int a, int b) {
    while (b != 0) { int r = a % b; a = b; b = r; }
    return a;    // a si b sunt copii: modificarea lor nu afecteaza apelantul
}

int cmmmc(int a, int b) {
    int d = cmmdc(a, b);
    return d == 0 ? 0 : a / d * b;
}

int sumaDivizori(int n) {
    int s = 0;
    for (int d = 1; d * d <= n; d++)
        if (n % d == 0) {
            s += d;
            if (d != n / d) s += n / d;
        }
    return s;
}

bool perfect(int n) {
    return n > 0 && sumaDivizori(n) - n == n;
}

void cifreParImpar(int n, int &pare, int &impare) {
    pare = impare = 0;
    do {
        if (n % 2 == 0) pare++;       // paritatea ultimei cifre = paritatea numarului
        else impare++;
        n /= 10;
    } while (n > 0);
}

void citesteVector(int v[], int &n) {
    cout << "n = ";
    cin >> n;
    if (n > 1000) n = 1000;
    cout << "elementele: ";
    for (int i = 0; i < n; i++) cin >> v[i];
}

void afiseazaVector(const int v[], int n) {   // const = promitem ca nu modificam vectorul
    for (int i = 0; i < n; i++) cout << v[i] << " ";
    cout << "\n";
}

void minMax(const int v[], int n, int &mn, int &mx) {
    mn = mx = v[0];
    for (int i = 1; i < n; i++) {
        if (v[i] < mn) mn = v[i];
        if (v[i] > mx) mx = v[i];
    }
}

void sorteaza(int v[], int n) {      // vectorul original se modifica
    for (int i = 0; i < n - 1; i++)
        for (int j = i + 1; j < n; j++)
            if (v[i] > v[j]) swap(v[i], v[j]);
}

int cautareBinara(const int v[], int n, int x) {
    int st = 0, dr = n - 1;
    while (st <= dr) {
        int m = (st + dr) / 2;
        if (v[m] == x) return m;
        if (v[m] < x) st = m + 1;
        else dr = m - 1;
    }
    return -1;
}

void stergeAparitii(int v[], int &n, int x) {
    int k = 0;                        // o singura parcurgere: copiem doar ce pastram
    for (int i = 0; i < n; i++)
        if (v[i] != x) v[k++] = v[i];
    n = k;                            // n e prin referinta: noua lungime ajunge la apelant
}

void inBaza(int n, int b) {
    const char cifre[] = "0123456789ABCDEF";
    char rez[40];
    int k = 0;
    do { rez[k++] = cifre[n % b]; n /= b; } while (n > 0);
    for (int i = k - 1; i >= 0; i--) cout << rez[i];
}
