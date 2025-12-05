# Datastrukturer & algoritmer --- Eksamensprojekt 

Datamatiker 4.semester - Valgfag: Datastrukturer & algoritmer --- miniprojekt

## Beskrivelse

Dette projekt er en simpel visualisering af et **AVL-træ**. Brugeren kan indsætte tal og se, hvordan et selvbalancerende binært søgetræ opbygges og balanceres ved hjælp af rotationer (LL, LR, RL, RR).

## Teknologier

- HTML / CSS til brugerflade og layout
- JavaScript 
  - `avl/AVLtree.js`: implementerer AVL-datastrukturen og indsættelsesalgoritmen
  - `main.js`: forbinder UI og algoritme, håndterer knapper og snapshots
  - `view/treerenderer.js`: tegner træet som cirkler og linjer i et SVG-element

## Funktionalitet

- Indsæt et tal via inputfeltet og tryk *Insert*.
- Tallet indsættes i AVL-træet som i et binært søgetræ (venstre < rod < højre).
- Højder og balancefaktorer beregnes, og der udføres rotationer ved ubalance.
- Efter hver indsættelse gemmes et snapshot af træet.
- Med *Previous* / *Next* kan man bladre mellem snapshots og se træets udvikling trin for trin.

## Sådan kører du projektet

1. Åbn `index.html` via en live server eller anden simpel webserver, fx:

	```bash
	python -m http.server 8000
	```

	og gå til `http://localhost:8000` i browseren.
2. Indsæt tal i feltet og tryk *Insert* for at se træet blive opbygget og balanceret.

## Kort om algoritmen

Et AVL-træ er et selvbalancerende binært søgetræ. Efter hver indsættelse opdateres højderne for noderne, og balancefaktoren (venstre højde minus højre højde) beregnes. Hvis forskellen bliver for stor, udføres en eller to rotationer, så træet bevarer en højde på cirka $\log n$. Det giver logaritmisk tid for søgning og indsættelse, også i værste fald.

