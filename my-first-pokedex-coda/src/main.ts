import './style.css'
import { genererSquelette } from './ui.ts'
import { initialiserRecherche } from './search.ts'
import { initialiserPagination } from './pagination.ts'
import { chargerLaListe } from './listepkm.ts'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
    genererSquelette(app)
    
    initialiserRecherche(() => chargerLaListe())
    
    initialiserPagination(() => {
        const champ = document.querySelector('#pokemon-search') as HTMLInputElement
        if (champ) champ.value = ""
        chargerLaListe()
    })

    chargerLaListe()
}
