import { chercherListe, chercherDetails } from './api.ts';
import { obtenirPageActuelle } from './pagination.ts';
import { creerCarte } from './ui.ts';

// Cache de la liste "brute" (name/url) de la page courante
let listePageCourante: any[] = [];

let dernierePage = 0;

export function obtenirListePageCourante(): any[] {
    return listePageCourante;
}

export async function chargerLaListe() {
    try {
        const page = obtenirPageActuelle();
        const donnees = await chercherListe(page);

        await chargerLaListeDepuisDonnees(donnees.results.slice(0, 10), page);
    } catch (e) {
        console.error("Erreur lors du chargement des Pokémon :", e);
    }
}

export async function chargerLaListeDepuisDonnees(pokemonList: any[], page: number = 0) {
    const liste = document.querySelector('#pokemon-list');
    if (!liste) return;

    const directionClass = page > dernierePage ? 'slide-in-right' : 'slide-in-left';
    dernierePage = page;

    liste.innerHTML = "";
    liste.classList.remove('slide-in-right', 'slide-in-left');

    const detailsPromises = pokemonList.map((p: any) => chercherDetails(p.url));
    const infos = await Promise.all(detailsPromises);

    infos.forEach(info => {
        const image = info.sprites.front_default
        const urlPokemon = `https://pokeapi.co/api/v2/pokemon/${info.id}/`;
        liste.innerHTML += creerCarte(info.name, image, urlPokemon, info.cries.latest);
    });

    void (liste as HTMLElement).offsetWidth;
    liste.classList.add(directionClass);
}