// Proiect 07 - Registrul elevilor
// Concepte: struct, vector de structuri, structuri imbricate, sortare dupa mai multe criterii
#include <iostream>
#include <fstream>
#include <cstring>
#include <iomanip>
using namespace std;

struct Note {
    int romana, mate, info;
};

struct Elev {
    char nume[31], prenume[31];
    int clasa;
    Note note;           // structura imbricata
    double medie;
};

Elev v[200];
int n;

double calculeazaMedia(Note x) {
    return (x.romana + x.mate + x.info) / 3.0;
}

void afiseazaAntet() {
    cout << left << setw(12) << "Nume" << setw(10) << "Prenume" << right
         << setw(6) << "Clasa" << setw(5) << "Rom" << setw(5) << "Mat" << setw(5) << "Inf"
         << setw(8) << "Medie" << "\n";
    cout << "---------------------------------------------------\n";
}

void afiseazaElev(Elev e) {
    cout << left << setw(12) << e.nume << setw(10) << e.prenume << right
         << setw(6) << e.clasa << setw(5) << e.note.romana << setw(5) << e.note.mate
         << setw(5) << e.note.info << setw(8) << fixed << setprecision(2) << e.medie << "\n";
}

// true daca elevul a trebuie sa apara inaintea lui b in clasament
bool inainte(Elev a, Elev b) {
    if (a.medie != b.medie) return a.medie > b.medie;      // 1) media descrescator
    int c = strcmp(a.nume, b.nume);
    if (c != 0) return c < 0;                              // 2) numele alfabetic
    return strcmp(a.prenume, b.prenume) < 0;               // 3) prenumele alfabetic
}

int main() {
    ifstream fin("elevi.in");
    if (!fin) { cout << "Nu gasesc elevi.in\n"; return 1; }
    fin >> n;
    for (int i = 0; i < n; i++) {
        fin >> v[i].nume >> v[i].prenume >> v[i].clasa
            >> v[i].note.romana >> v[i].note.mate >> v[i].note.info;
        v[i].medie = calculeazaMedia(v[i].note);
    }
    fin.close();

    int opt;
    do {
        cout << "\n===== REGISTRU (" << n << " elevi) =====\n";
        cout << "1. Afiseaza toti elevii\n2. Clasament\n3. Cauta dupa nume\n";
        cout << "4. Cel mai bun elev din fiecare clasa\n5. Corigenti (vreo nota < 5)\n";
        cout << "6. Adauga elev\n7. Salveaza in elevi.out\n0. Iesire\nOptiune: ";
        cin >> opt;

        if (opt == 1) {
            afiseazaAntet();
            for (int i = 0; i < n; i++) afiseazaElev(v[i]);
        }
        else if (opt == 2) {
            // sortare prin selectie; structurile se pot atribui, deci swap functioneaza
            for (int i = 0; i < n - 1; i++)
                for (int j = i + 1; j < n; j++)
                    if (inainte(v[j], v[i])) swap(v[i], v[j]);
            afiseazaAntet();
            for (int i = 0; i < n; i++) {
                cout << setw(2) << i + 1 << ". ";
                afiseazaElev(v[i]);
            }
        }
        else if (opt == 3) {
            char cautat[31];
            cout << "Numele: ";
            cin >> cautat;
            bool gasit = false;
            for (int i = 0; i < n; i++)
                if (strcmp(v[i].nume, cautat) == 0) {
                    if (!gasit) afiseazaAntet();
                    afiseazaElev(v[i]);
                    gasit = true;
                }
            if (!gasit) cout << "Nu exista elevul " << cautat << "\n";
        }
        else if (opt == 4) {
            // pentru fiecare clasa 9..12 cautam elevul cu media maxima
            for (int cls = 9; cls <= 12; cls++) {
                int best = -1;
                for (int i = 0; i < n; i++)
                    if (v[i].clasa == cls && (best == -1 || v[i].medie > v[best].medie))
                        best = i;
                if (best != -1)
                    cout << "Clasa " << cls << ": " << v[best].nume << " " << v[best].prenume
                         << " (" << fixed << setprecision(2) << v[best].medie << ")\n";
            }
        }
        else if (opt == 5) {
            int cnt = 0;
            for (int i = 0; i < n; i++) {
                Note x = v[i].note;
                if (x.romana < 5 || x.mate < 5 || x.info < 5) {
                    if (cnt == 0) afiseazaAntet();
                    afiseazaElev(v[i]);
                    cnt++;
                }
            }
            if (cnt == 0) cout << "Niciun corigent!\n";
        }
        else if (opt == 6) {
            if (n == 200) { cout << "Registrul e plin\n"; continue; }
            Elev e;
            cout << "Nume prenume clasa nota_romana nota_mate nota_info:\n";
            cin >> e.nume >> e.prenume >> e.clasa >> e.note.romana >> e.note.mate >> e.note.info;
            e.medie = calculeazaMedia(e.note);
            v[n++] = e;                    // atribuire de structuri
            cout << "Adaugat, media " << fixed << setprecision(2) << e.medie << "\n";
        }
        else if (opt == 7) {
            ofstream fout("elevi.out");
            fout << n << "\n";
            for (int i = 0; i < n; i++)
                fout << v[i].nume << " " << v[i].prenume << " " << v[i].clasa << " "
                     << v[i].note.romana << " " << v[i].note.mate << " " << v[i].note.info << "\n";
            cout << "Salvat.\n";
        }
    } while (opt != 0);

    return 0;
}
