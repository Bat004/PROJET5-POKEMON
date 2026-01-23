import './style.css'
import { initialiserPagination } from './pagination.ts'
import { chargerLaListe } from './listepkm.ts'
import { initialiserBoutonsAction } from './Elements.ts'
import { initialiserRechercheVhsFiltreGlobal } from './search.ts'

initialiserPagination(() => {
    chargerLaListe();
});

chargerLaListe();

initialiserBoutonsAction();

initialiserRechercheVhsFiltreGlobal();
