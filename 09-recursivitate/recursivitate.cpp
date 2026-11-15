// Proiect 09 - Recursivitate in actiune
// Concepte: caz de baza, apel recursiv, stiva, memorare, divide et impera, flood fill
#include <iostream>
#include <fstream>
using namespace std;

// ---------- recursivitate simpla ----------
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int sumaCifre(int n) {
    if (n == 0) return 0;
    return n % 10 + sumaCifre(n / 10);
}

int cmmdc(int a, int b) {
    if (b == 0) return a;
    return cmmdc(b, a % b);
}

void inainteSiDupa(int n) {
    if (n == 0) return;
    cout << "[intru " << n << "] ";
    inainteSiDupa(n - 1);
    cout << "[ies " << n << "] ";
}

// ---------- Fibonacci: simplu vs memorare ----------
long long apeluri = 0;

long long fibSimplu(int n) {
    apeluri++;
    if (n <= 2) return 1;
    return fibSimplu(n - 1) + fibSimplu(n - 2);
}

long long memo[100];   // memo[n] = 0 inseamna "inca necalculat"

long long fibMemo(int n) {
    apeluri++;
    if (n <= 2) return 1;
    if (memo[n] != 0) return memo[n];           // deja stim raspunsul
    return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
}

// ---------- putere rapida: O(log n) in loc de O(n) ----------
long long putere(long long a, int n) {
    if (n == 0) return 1;
    long long jum = putere(a, n / 2);
    if (n % 2 == 0) return jum * jum;
    return jum * jum * a;
}

// ---------- turnurile din Hanoi ----------
int mutari = 0;
void hanoi(int n, char sursa, char destinatie, char auxiliar) {
    if (n == 0) return;
    hanoi(n - 1, sursa, auxiliar, destinatie);   // mutam n-1 discuri din drum
    mutari++;
    cout << "  muta discul " << n << ": " << sursa << " -> " << destinatie << "\n";
    hanoi(n - 1, auxiliar, destinatie, sursa);   // le punem peste discul mare
}

// ---------- divide et impera: maxim si merge sort ----------
int maxim(int v[], int st, int dr) {
    if (st == dr) return v[st];
    int m = (st + dr) / 2;
    int a = maxim(v, st, m), b = maxim(v, m + 1, dr);
    return a > b ? a : b;
}

int aux[1000];
void mergeSort(int v[], int st, int dr) {
    if (st >= dr) return;
    int m = (st + dr) / 2;
    mergeSort(v, st, m);              // sortam jumatatea stanga
    mergeSort(v, m + 1, dr);          // sortam jumatatea dreapta
    int i = st, j = m + 1, k = st;    // interclasam cele doua jumatati
    while (i <= m && j <= dr) aux[k++] = (v[i] <= v[j]) ? v[i++] : v[j++];
    while (i <= m) aux[k++] = v[i++];
    while (j <= dr) aux[k++] = v[j++];
    for (k = st; k <= dr; k++) v[k] = aux[k];
}

// ---------- flood fill: numarul de insule ----------
int n, m;
char harta[52][52];

int umple(int i, int j) {     // intoarce suprafata insulei care contine (i, j)
    if (i < 0 || j < 0 || i >= n || j >= m) return 0;   // in afara hartii
    if (harta[i][j] != '1') return 0;                    // apa sau deja vizitat
    harta[i][j] = '*';                                   // marcam ca vizitat
    return 1 + umple(i - 1, j) + umple(i + 1, j) + umple(i, j - 1) + umple(i, j + 1);
}

int main() {
    cout << "5! = " << factorial(5) << ", 20! = " << factorial(20) << "\n";
    cout << "sumaCifre(98765) = " << sumaCifre(98765) << "\n";
    cout << "cmmdc(84, 36) = " << cmmdc(84, 36) << "\n";
    cout << "Ordinea apelurilor: ";
    inainteSiDupa(3);
    cout << "\n\n";

    apeluri = 0;
    cout << "fibSimplu(30) = " << fibSimplu(30) << " cu " << apeluri << " apeluri\n";
    apeluri = 0;
    cout << "fibMemo(30)   = " << fibMemo(30) << " cu " << apeluri << " apeluri\n";
    apeluri = 0;
    cout << "fibMemo(90)   = " << fibMemo(90) << " (fibSimplu ar dura ani!)\n\n";

    cout << "2^62 = " << putere(2, 62) << ", 3^20 = " << putere(3, 20) << "\n\n";

    cout << "Hanoi cu 3 discuri (A -> C):\n";
    hanoi(3, 'A', 'C', 'B');
    cout << "Total: " << mutari << " mutari (= 2^3 - 1)\n\n";

    int v[] = {38, 27, 43, 3, 9, 82, 10, 1};
    int k = 8;
    cout << "Maxim (divide et impera): " << maxim(v, 0, k - 1) << "\n";
    mergeSort(v, 0, k - 1);
    cout << "Merge sort: ";
    for (int i = 0; i < k; i++) cout << v[i] << " ";
    cout << "\n\n";

    ifstream fin("harta.in");
    if (!fin) { cout << "Nu gasesc harta.in\n"; return 1; }
    fin >> n >> m;
    for (int i = 0; i < n; i++) fin >> harta[i];
    int insule = 0, ceaMaiMare = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            if (harta[i][j] == '1') {
                insule++;
                int s = umple(i, j);
                cout << "Insula " << insule << " incepe la (" << i << "," << j
                     << ") si are " << s << " celule\n";
                if (s > ceaMaiMare) ceaMaiMare = s;
            }
    cout << "Total: " << insule << " insule, cea mai mare are " << ceaMaiMare << " celule\n";
    return 0;
}
