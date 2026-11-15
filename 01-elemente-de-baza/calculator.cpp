// Proiect 01 - Calculator cu meniu
// Concepte: variabile, tipuri de date, operatori, if/else, switch, while, do-while, for
#include <iostream>
#include <cmath>     // sqrt
using namespace std;

int main() {
    int optiune;

    do {
        // ---------- meniul ----------
        cout << "\n===== CALCULATOR =====\n";
        cout << "1. Operatie aritmetica (a op b)\n";
        cout << "2. Ecuatia de gradul I   (a*x + b = 0)\n";
        cout << "3. Ecuatia de gradul II  (a*x^2 + b*x + c = 0)\n";
        cout << "4. An bisect\n";
        cout << "5. Tabla inmultirii\n";
        cout << "6. Suma si media unor numere (oprire la 0)\n";
        cout << "0. Iesire\n";
        cout << "Alege optiunea: ";
        cin >> optiune;

        switch (optiune) {
        case 1: {
            double a, b;
            char op;
            cout << "Scrie expresia (ex: 7 / 2): ";
            cin >> a >> op >> b;
            switch (op) {
            case '+': cout << "Rezultat: " << a + b << "\n"; break;
            case '-': cout << "Rezultat: " << a - b << "\n"; break;
            case '*': cout << "Rezultat: " << a * b << "\n"; break;
            case '/':
                if (b == 0) cout << "Eroare: impartire la 0!\n";
                else cout << "Rezultat: " << a / b << "\n";
                break;
            case '%':
                // % exista doar pentru numere intregi, de aceea convertim la int
                if ((int)b == 0) cout << "Eroare: impartire la 0!\n";
                else cout << "Rezultat: " << (int)a % (int)b << "\n";
                break;
            default:
                cout << "Operator necunoscut!\n";
            }
            break;
        }
        case 2: {
            double a, b;
            cout << "a = "; cin >> a;
            cout << "b = "; cin >> b;
            if (a != 0)
                cout << "x = " << -b / a << "\n";
            else if (b == 0)
                cout << "Ecuatia are o infinitate de solutii\n";
            else
                cout << "Ecuatia nu are solutii\n";
            break;
        }
        case 3: {
            double a, b, c;
            cout << "a b c = ";
            cin >> a >> b >> c;
            if (a == 0) {
                cout << "Nu este ecuatie de gradul II (a = 0)\n";
                break;
            }
            double delta = b * b - 4 * a * c;
            if (delta > 0) {
                double x1 = (-b + sqrt(delta)) / (2 * a);
                double x2 = (-b - sqrt(delta)) / (2 * a);
                cout << "x1 = " << x1 << ", x2 = " << x2 << "\n";
            } else if (delta == 0) {
                cout << "x1 = x2 = " << -b / (2 * a) << "\n";
            } else {
                cout << "Nu are solutii reale (delta < 0)\n";
            }
            break;
        }
        case 4: {
            int an;
            cout << "Anul: ";
            cin >> an;
            // bisect: divizibil cu 4 si nu cu 100, SAU divizibil cu 400
            bool bisect = (an % 4 == 0 && an % 100 != 0) || an % 400 == 0;
            cout << an << (bisect ? " este" : " nu este") << " an bisect\n";
            break;
        }
        case 5: {
            int n;
            cout << "Tabla inmultirii pana la n = ";
            cin >> n;
            for (int i = 1; i <= n; i++) {
                for (int j = 1; j <= n; j++) {
                    int p = i * j;
                    // aliniere simpla: adaugam spatii in functie de cate cifre are p
                    if (p < 10) cout << "   ";
                    else if (p < 100) cout << "  ";
                    else cout << " ";
                    cout << p;
                }
                cout << "\n";
            }
            break;
        }
        case 6: {
            double x, suma = 0;
            int cate = 0;
            cout << "Scrie numere (0 = stop): ";
            cin >> x;
            while (x != 0) {
                suma += x;
                cate++;
                cin >> x;
            }
            cout << "Ai introdus " << cate << " numere, suma = " << suma;
            if (cate > 0) cout << ", media = " << suma / cate;
            cout << "\n";
            break;
        }
        case 0:
            cout << "La revedere!\n";
            break;
        default:
            cout << "Optiune invalida!\n";
        }
    } while (optiune != 0);

    return 0;
}
