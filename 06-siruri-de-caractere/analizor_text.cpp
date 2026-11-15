// Proiect 06 - Analizor de text
// Concepte: char[], cin.getline, strlen, strcpy, strcat, strcmp, strstr, strtok, coduri ASCII
#include <iostream>
#include <cstring>
#include <cctype>
using namespace std;

const char SEPARATORI[] = " ,.;:!?-\t";

bool eVocala(char c) {
    return strchr("aeiouAEIOU", c) != NULL;
}

int main() {
    char text[1001];
    cout << "Scrie o fraza: ";
    cin.getline(text, 1001);

    // ---------- 1. Statistici pe caractere ----------
    int vocale = 0, consoane = 0, cifre = 0, spatii = 0, mari = 0;
    int n = strlen(text);
    for (int i = 0; i < n; i++) {
        char c = text[i];
        if (isalpha(c)) {
            if (eVocala(c)) vocale++;
            else consoane++;
            if (isupper(c)) mari++;
        }
        else if (isdigit(c)) cifre++;
        else if (c == ' ') spatii++;
    }
    cout << "\nLungime: " << n << "\nVocale: " << vocale << ", consoane: " << consoane
         << ", cifre: " << cifre << ", spatii: " << spatii << ", majuscule: " << mari << "\n";

    // ---------- 2. Cuvintele (strtok strica sirul, deci lucram pe o copie) ----------
    char copie[1001];
    strcpy(copie, text);
    char cuvinte[200][51];
    int nrCuv = 0;
    char *p = strtok(copie, SEPARATORI);
    while (p != NULL && nrCuv < 200) {
        strncpy(cuvinte[nrCuv], p, 50);
        cuvinte[nrCuv][50] = '\0';
        nrCuv++;
        p = strtok(NULL, SEPARATORI);
    }
    cout << "Numar de cuvinte: " << nrCuv << "\n";

    // cel mai lung cuvant
    int iMax = -1;
    for (int i = 0; i < nrCuv; i++)
        if (iMax == -1 || strlen(cuvinte[i]) > strlen(cuvinte[iMax])) iMax = i;
    if (iMax != -1) cout << "Cel mai lung cuvant: " << cuvinte[iMax] << "\n";

    // cuvinte palindrom (cel putin 2 litere), comparand fara a tine cont de majuscule
    cout << "Cuvinte palindrom: ";
    for (int i = 0; i < nrCuv; i++) {
        int L = strlen(cuvinte[i]);
        bool pal = L >= 2;
        for (int st = 0, dr = L - 1; st < dr && pal; st++, dr--)
            if (tolower(cuvinte[i][st]) != tolower(cuvinte[i][dr])) pal = false;
        if (pal) cout << cuvinte[i] << " ";
    }
    cout << "\n";

    // ---------- 3. Prima litera a fiecarui cuvant cu majuscula ----------
    char titlu[1001];
    strcpy(titlu, text);
    for (int i = 0; titlu[i]; i++)
        if (isalpha(titlu[i]) && (i == 0 || strchr(SEPARATORI, titlu[i - 1])))
            titlu[i] = toupper(titlu[i]);
    cout << "Format titlu: " << titlu << "\n";

    // ---------- 4. Stergerea vocalelor (bucla cu doi indici) ----------
    char faraVocale[1001];
    int k = 0;
    for (int i = 0; text[i]; i++)
        if (!eVocala(text[i])) faraVocale[k++] = text[i];
    faraVocale[k] = '\0';             // nu uita terminatorul!
    cout << "Fara vocale: " << faraVocale << "\n";

    // ---------- 5. Cifrul lui Cezar ----------
    int cheie = 3;
    char cript[1001];
    strcpy(cript, text);
    for (int i = 0; cript[i]; i++) {
        if (islower(cript[i])) cript[i] = 'a' + (cript[i] - 'a' + cheie) % 26;
        else if (isupper(cript[i])) cript[i] = 'A' + (cript[i] - 'A' + cheie) % 26;
    }
    cout << "Criptat (Cezar, cheie " << cheie << "): " << cript << "\n";
    for (int i = 0; cript[i]; i++) {    // decriptare: deplasare cu 26 - cheie
        if (islower(cript[i])) cript[i] = 'a' + (cript[i] - 'a' + 26 - cheie) % 26;
        else if (isupper(cript[i])) cript[i] = 'A' + (cript[i] - 'A' + 26 - cheie) % 26;
    }
    cout << "Decriptat: " << cript << "\n";

    // ---------- 6. Sortarea alfabetica a cuvintelor (strcmp) ----------
    for (int i = 0; i < nrCuv - 1; i++)
        for (int j = i + 1; j < nrCuv; j++)
            if (strcmp(cuvinte[i], cuvinte[j]) > 0) {
                char aux[51];
                strcpy(aux, cuvinte[i]);
                strcpy(cuvinte[i], cuvinte[j]);
                strcpy(cuvinte[j], aux);
            }
    cout << "Cuvinte sortate: ";
    for (int i = 0; i < nrCuv; i++) cout << cuvinte[i] << " ";
    cout << "\n";

    // ---------- 7. Inlocuirea unui cuvant cu altul (strstr) ----------
    char vechi[51], nou[51];
    cout << "\nCe cuvant inlocuiesc? ";
    cin >> vechi;
    cout << "Cu ce? ";
    cin >> nou;

    char rezultat[2001] = "";
    char *start = text;
    char *gasit = strstr(start, vechi);
    int inlocuiri = 0;
    while (gasit != NULL) {
        strncat(rezultat, start, gasit - start);  // partea dinaintea aparitiei
        strcat(rezultat, nou);                    // cuvantul nou
        start = gasit + strlen(vechi);            // continuam dupa aparitie
        gasit = strstr(start, vechi);
        inlocuiri++;
    }
    strcat(rezultat, start);                      // ce a ramas
    cout << "Rezultat (" << inlocuiri << " inlocuiri): " << rezultat << "\n";

    return 0;
}
