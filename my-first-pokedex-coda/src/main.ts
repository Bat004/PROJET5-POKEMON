import './style.css'
import { initialiserPagination } from './pagination.ts'
import { chargerLaListe } from './listepkm.ts'

initialiserPagination(() => {
    chargerLaListe();
});

chargerLaListe();

