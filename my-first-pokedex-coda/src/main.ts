import './style.css'
import { initialiserPagination } from './pagination.ts'
import { chargerLaListe } from './listepkm.ts'
import { initialiserBoutonsAction } from './Elements.ts'

initialiserPagination(() => {
    chargerLaListe();
});

chargerLaListe();

// Initialisation des boutons d'action (Y, B)
initialiserBoutonsAction();

