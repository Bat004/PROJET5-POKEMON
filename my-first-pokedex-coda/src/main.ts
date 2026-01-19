import './style.css'
import { genererSquelette, mettreAJourPagination, creerCarte } from './ui'
import { initialiserRecherche, filtrerLesPokemons } from './search'
import { initialiserPagination, obtenirPageActuelle } from './pagination'
import { chercherListe, chercherDetails, chercherTousLesNoms } from './api'

const app = document.querySelector<HTMLDivElement>('#app')
let cacheTousLesPokemons: any[] = []
let idRequeteActuelle = 0;

async function charger() {
    const liste = document.querySelector('#pokemon-list')
    const champ = document.querySelector('#pokemon-search') as HTMLInputElement
    const paginationZone = document.querySelector('.pagination-header') as HTMLElement

    idRequeteActuelle++;
    const monId = idRequeteActuelle;

    try {
        const texteRecherche = champ?.value.toLowerCase().trim()
        let pokemonsAAfficher = []

        if (texteRecherche) {
            if (paginationZone) paginationZone.style.display = 'none'
            if (cacheTousLesPokemons.length === 0) {
                cacheTousLesPokemons = await chercherTousLesNoms()
            }
            pokemonsAAfficher = filtrerLesPokemons(cacheTousLesPokemons, texteRecherche).slice(0, 20)
        } else {
            if (paginationZone) paginationZone.style.display = 'flex'
            const page = obtenirPageActuelle()
            const donnees = await chercherListe(page)
            mettreAJourPagination(donnees.count, page)
            pokemonsAAfficher = donnees.results
        }

        if (liste) {
            if (monId !== idRequeteActuelle) return; 

            liste.innerHTML = ""
            if (pokemonsAAfficher.length === 0 && texteRecherche) {
                liste.innerHTML = '<p class="loading-text">aucun pokemon trouvé.</p>'
                return
            }

            for (const p of pokemonsAAfficher) {
                if (monId !== idRequeteActuelle) return;

                const info = await chercherDetails(p.url)
                const image = info.sprites.other['official-artwork'].front_default
                liste.innerHTML += creerCarte(info.name, image)
            }
        }
    } catch (e) {
        console.error(e)
    }
}

if (app) {
    genererSquelette(app)
    initialiserRecherche(() => charger())
    initialiserPagination(() => {
        const champ = document.querySelector('#pokemon-search') as HTMLInputElement
        if (champ) champ.value = ""
        charger()
    })
    charger()
}
//test