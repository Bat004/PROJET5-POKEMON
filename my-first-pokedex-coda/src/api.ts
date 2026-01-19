import { POKEMONS_PAR_PAGE } from './pagination';

export async function chercherListe(page: number) {
    const depart = page * POKEMONS_PAR_PAGE;
    const reponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${POKEMONS_PAR_PAGE}&offset=${depart}`);
    return await reponse.json();
}

export async function chercherDetails(url: string) {
    const reponse = await fetch(url);
    return await reponse.json();
}

export async function chercherTousLesNoms() {
    const reponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
    const donnees = await reponse.json();
    return donnees.results;
}