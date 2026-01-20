import { chercherListe, chercherDetails } from './api.ts';
import { obtenirPageActuelle } from './pagination.ts';
import { creerCarte } from './ui.ts';


let dernierePage = 0;

export async function chargerLaListe() {
    const liste = document.querySelector('#pokemon-list');
    if (!liste) return;

    try {
        const page = obtenirPageActuelle();
        const directionClass = page > dernierePage ? 'slide-in-right' : 'slide-in-left';
        dernierePage = page;

        liste.innerHTML = "";
        liste.classList.remove('slide-in-right', 'slide-in-left');

        const donnees = await chercherListe(page);
        const PokemonAAfficher = donnees.results.slice(0, 10);

        const detailsPromises = PokemonAAfficher.map((p: any) => chercherDetails(p.url));
        const infos = await Promise.all(detailsPromises);

        infos.forEach(info => {
            const image = info.sprites.front_default
            const urlPokemon = `https://pokeapi.co/api/v2/pokemon/${info.id}/`;
            liste.innerHTML += creerCarte(info.name, image, urlPokemon, info.cries.latest);
        });

        void (liste as HTMLElement).offsetWidth;
        liste.classList.add(directionClass);

    } catch (e) {
        console.error("Erreur lors du chargement des Pokémon :", e);
    }
}