import { chercherListe, chercherDetails, chercherTousLesNoms } from './api.ts';
import { filtrerLesPokemons } from './search.ts';
import { obtenirPageActuelle } from './pagination.ts';
import { mettreAJourPagination, creerCarte } from './ui.ts';

let cacheTousLesPokemon: any[] = [];
let idRequeteActuelle = 0;

export async function chargerLaListe() {
    const liste = document.querySelector('#pokemon-list');
    const champ = document.querySelector('#pokemon-search') as HTMLInputElement;
    const paginationZone = document.querySelector('.pagination-header') as HTMLElement;

    idRequeteActuelle++;
    const monId = idRequeteActuelle;

    try {
        const texteRecherche = champ?.value.toLowerCase().trim();
        let PokemonAAfficher = [];

        if (texteRecherche) {
            if (paginationZone) paginationZone.style.display = 'none';
            if (cacheTousLesPokemon.length === 0) {
                cacheTousLesPokemon = await chercherTousLesNoms();
            }
            PokemonAAfficher = filtrerLesPokemons(cacheTousLesPokemon, texteRecherche).slice(0, 20);
        } else {
            if (paginationZone) paginationZone.style.display = 'flex';
            const page = obtenirPageActuelle();
            const donnees = await chercherListe(page);
            mettreAJourPagination(donnees.count, page);
            PokemonAAfficher = donnees.results;
        }

        if (liste) {
            if (monId !== idRequeteActuelle) return;

            liste.innerHTML = "";
            if (PokemonAAfficher.length === 0 && texteRecherche) {
                liste.innerHTML = '<p class="loading-text">aucun Pokémon trouvé.</p>';
                return;
            }

            for (const p of PokemonAAfficher) {
                if (monId !== idRequeteActuelle) return;

                const info = await chercherDetails(p.url);
                const image = info.sprites.other['official-artwork'].front_default;
                liste.innerHTML += creerCarte(info.name, image, p.url, info.cries.latest);
            }
        }
    } catch (e) {
        console.error("Erreur lors du chargement :", e);
    }
}