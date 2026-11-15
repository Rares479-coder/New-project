// Proiect 03 - Catalogul clasei
// Concepte: ifstream / ofstream, citire cand nu stim cate valori sunt, getline, prelucrare linie cu linie
#include <iostream>
#include <fstream>
#include <sstream>    // istringstream: ne permite sa "citim" dintr-un sir ca dintr-un fisier
#include <string>
#include <iomanip>    // setprecision, fixed
using namespace std;

int main() {
    ifstream fin("note.txt");
    if (!fin) {
        cout << "Nu am gasit fisierul note.txt! Ruleaza programul din folderul 03-fisiere-text.\n";
        return 1;
    }
    ofstream fout("raport.txt");

    int frecventa[11] = {0};        // frecventa[n] = de cate ori apare nota n
    int nrElevi = 0, corigenti = 0;
    double sumaMedii = 0, mediaMax = -1;
    string celMaiBun;

    fout << fixed << setprecision(2);   // afisam mediile cu 2 zecimale
    fout << "RAPORT CATALOG\n";
    fout << "==============\n";

    string linie;
    while (getline(fin, linie)) {        // citim linie cu linie pana la sfarsitul fisierului
        if (linie.empty()) continue;     // sarim peste liniile goale

        istringstream in(linie);         // "fisier" format doar din linia curenta
        string nume, prenume;
        in >> nume >> prenume;

        int nota, nrNote = 0, suma = 0;
        while (in >> nota) {             // citim cate note sunt pe linie
            suma += nota;
            nrNote++;
            if (nota >= 1 && nota <= 10) frecventa[nota]++;
        }
        if (nrNote == 0) continue;

        double media = (double)suma / nrNote;   // (double) ca impartirea sa nu fie intreaga!
        nrElevi++;
        sumaMedii += media;

        fout << setw(12) << left << nume << setw(10) << prenume
             << " note: " << nrNote << "  media: " << media;
        if (media < 5) {
            fout << "  CORIGENT";
            corigenti++;
        }
        fout << "\n";

        if (media > mediaMax) {
            mediaMax = media;
            celMaiBun = nume + " " + prenume;
        }
    }

    fout << "\nSTATISTICI\n";
    fout << "Numar elevi:     " << nrElevi << "\n";
    if (nrElevi > 0) {
        fout << "Media clasei:    " << sumaMedii / nrElevi << "\n";
        fout << "Cel mai bun:     " << celMaiBun << " (" << mediaMax << ")\n";
    }
    fout << "Corigenti:       " << corigenti << "\n";

    fout << "\nFRECVENTA NOTELOR\n";
    for (int n = 10; n >= 1; n--) {
        if (frecventa[n] == 0) continue;
        fout << setw(2) << right << n << ": ";
        for (int i = 0; i < frecventa[n]; i++) fout << '*';   // o mica histograma
        fout << " (" << frecventa[n] << ")\n";
    }

    fin.close();
    fout.close();
    cout << "Am procesat " << nrElevi << " elevi. Rezultatul este in raport.txt\n";
    return 0;
}
