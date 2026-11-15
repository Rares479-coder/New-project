# 07. Structuri de date neomogene (`struct`)

Un vector reține date de **același** tip. Când vrem să grupăm date de tipuri **diferite** despre același obiect (un elev are nume — text, vârstă — întreg, medie — real), folosim `struct`.

```cpp
struct Elev {
    char nume[31];
    int clasa;
    double medie;
};

Elev e;                       // o variabilă de tip Elev
strcpy(e.nume, "Ana");        // acces la câmp cu operatorul .
e.clasa = 10;
e.medie = 9.5;

Elev v[100];                  // vector de structuri
v[3].medie = 8.75;
```

## Structuri imbricate
```cpp
struct Data { int zi, luna, an; };
struct Persoana {
    char nume[31];
    Data nastere;             // o structură în altă structură
};
p.nastere.an = 2008;
```

## Atribuire și comparare
- Două structuri de același tip **se pot atribui**: `a = b;` (copiază toate câmpurile — util la `swap` când sortăm).
- **Nu** se pot compara direct (`a == b` nu compilează); compari câmp cu câmp.

## Sortare după mai multe criterii
```cpp
// descrescător după medie, iar la medii egale alfabetic după nume
bool inainte(Elev a, Elev b) {
    if (a.medie != b.medie) return a.medie > b.medie;
    return strcmp(a.nume, b.nume) < 0;
}
```

## Exemple clasice
- punct în plan: `struct Punct { double x, y; };` → distanța dintre două puncte;
- fracție: `struct Fractie { int a, b; };` → adunare, simplificare;
- dată calendaristică → compararea a două date, vârsta unei persoane.

## Proiect: `registru_elevi.cpp`

Citește elevii din `elevi.in` (nume, prenume, clasa, trei note), calculează mediile și oferă un meniu: afișare tabel, clasament (sortare după medie, apoi alfabetic), căutare după nume, cea mai bună medie pe fiecare clasă, filtrare a corigenților, adăugarea unui elev nou și salvarea în `elevi.out`.

## Exerciții

1. ★ Definește `struct Punct` și calculează distanța dintre două puncte.
2. ★ Definește `struct Fractie`; citește două fracții și afișează suma lor, simplificată.
3. ★★ Citește `n` dreptunghiuri (lungime, lățime) și afișează-le în ordinea crescătoare a ariei.
4. ★★ Citește datele de naștere a `n` persoane și afișează-l pe cel mai tânăr.
5. ★★ Citește `n` produse (denumire, preț, cantitate) și afișează valoarea totală a stocului și produsele epuizate.
6. ★★★ Adaugă în registru câmpul `Data nastere` și opțiunea „elevii născuți într-o anumită lună”.
