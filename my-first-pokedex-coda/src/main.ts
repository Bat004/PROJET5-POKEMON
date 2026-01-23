import './style.css'
import { initialiserPagination } from './pagination.ts'
import { chargerLaListe } from './listepkm.ts'
import { initialiserBoutonsAction, filterState } from './Elements.ts'
import { initialiserRechercheVhsFiltreGlobal } from './search.ts'

initialiserPagination(() => {
    if (filterState.getIsFiltering()) {
        filterState.renderCurrentPage();
    } else {
        chargerLaListe();
    }
});

chargerLaListe();

initialiserBoutonsAction();

initialiserRechercheVhsFiltreGlobal();
