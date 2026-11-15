// Proiect 05b - Jocul X si 0
// Concepte: matrice 3x3, verificarea liniilor/coloanelor/diagonalelor, validarea datelor
#include <iostream>
#include <cstdlib>   // rand, srand
#include <ctime>     // time
using namespace std;

char tabla[4][4];    // folosim liniile si coloanele 1..3

void initializeaza() {
    for (int i = 1; i <= 3; i++)
        for (int j = 1; j <= 3; j++)
            tabla[i][j] = '.';
}

void afiseaza() {
    cout << "\n    1   2   3\n";
    for (int i = 1; i <= 3; i++) {
        cout << i << "   ";
        for (int j = 1; j <= 3; j++) {
            cout << tabla[i][j];
            if (j < 3) cout << " | ";
        }
        cout << "\n";
        if (i < 3) cout << "   ---+---+---\n";
    }
    cout << "\n";
}

// intoarce 'X' sau '0' daca unul a castigat, altfel '.'
char castigator() {
    for (int i = 1; i <= 3; i++) {
        // linia i
        if (tabla[i][1] != '.' && tabla[i][1] == tabla[i][2] && tabla[i][2] == tabla[i][3])
            return tabla[i][1];
        // coloana i
        if (tabla[1][i] != '.' && tabla[1][i] == tabla[2][i] && tabla[2][i] == tabla[3][i])
            return tabla[1][i];
    }
    // diagonala principala (i == j)
    if (tabla[2][2] != '.' && tabla[1][1] == tabla[2][2] && tabla[2][2] == tabla[3][3])
        return tabla[2][2];
    // diagonala secundara (i + j == 4)
    if (tabla[2][2] != '.' && tabla[1][3] == tabla[2][2] && tabla[2][2] == tabla[3][1])
        return tabla[2][2];
    return '.';
}

// calculatorul: 1) castiga daca poate, 2) blocheaza adversarul, 3) centrul, 4) o casuta la intamplare
void mutareCalculator(char eu, char adversar) {
    // incercam pe rand fiecare casuta libera
    for (int etapa = 1; etapa <= 2; etapa++) {
        char cine = (etapa == 1) ? eu : adversar;
        for (int i = 1; i <= 3; i++)
            for (int j = 1; j <= 3; j++)
                if (tabla[i][j] == '.') {
                    tabla[i][j] = cine;               // "ce-ar fi daca..."
                    bool castiga = castigator() == cine;
                    tabla[i][j] = '.';                // anulam incercarea
                    if (castiga) {
                        tabla[i][j] = eu;
                        cout << "Calculatorul muta pe " << i << " " << j << "\n";
                        return;
                    }
                }
    }
    if (tabla[2][2] == '.') {
        tabla[2][2] = eu;
        cout << "Calculatorul muta pe 2 2\n";
        return;
    }
    int i, j;
    do {
        i = rand() % 3 + 1;
        j = rand() % 3 + 1;
    } while (tabla[i][j] != '.');
    tabla[i][j] = eu;
    cout << "Calculatorul muta pe " << i << " " << j << "\n";
}

int main() {
    srand(time(0));
    int mod;
    cout << "X si 0\n1. Doi jucatori\n2. Contra calculatorului\nAlege: ";
    cin >> mod;

    initializeaza();
    char jucator = 'X';
    int mutari = 0;
    afiseaza();

    while (castigator() == '.' && mutari < 9) {
        if (mod == 2 && jucator == '0') {
            mutareCalculator('0', 'X');
        } else {
            int i, j;
            cout << "Jucatorul " << jucator << ", linia si coloana (1-3): ";
            if (!(cin >> i >> j)) return 0;          // s-a terminat inputul
            if (i < 1 || i > 3 || j < 1 || j > 3 || tabla[i][j] != '.') {
                cout << "Mutare invalida, incearca din nou.\n";
                continue;
            }
            tabla[i][j] = jucator;
        }
        mutari++;
        afiseaza();
        jucator = (jucator == 'X') ? '0' : 'X';     // schimbam jucatorul
    }

    char c = castigator();
    if (c == '.') cout << "Remiza!\n";
    else cout << "A castigat " << c << "!\n";
    return 0;
}
