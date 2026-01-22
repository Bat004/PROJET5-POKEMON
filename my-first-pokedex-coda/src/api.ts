import { POKEMONS_PAR_PAGE } from './pagination';

export async function chercherListe(page: number) {
    try {
        const depart = page * POKEMONS_PAR_PAGE;
        const reponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${POKEMONS_PAR_PAGE}&offset=${depart}`);
        
        // Sécurité pour l'erreur 404 ou 500
        if (!reponse.ok) {
            throw new Error(`Erreur HTTP ! statut : ${reponse.status}`);
        }

        return await reponse.json();
    } catch (error) {
        console.error("Erreur dans chercherListe:", error);
        throw error; // On relance l'erreur pour que le composant puisse afficher un message à l'utilisateur
    }
}

export async function chercherDetails(url: string) {
    try {
        const reponse = await fetch(url);

        if (!reponse.ok) {
            throw new Error(`Erreur lors de la récupération des détails ! statut : ${reponse.status}`);
        }

        return await reponse.json();
    } catch (error) {
        console.error("Erreur dans chercherDetails:", error);
        return null; // Ici, on peut retourner null pour ne pas casser l'affichage global
    }
}

export async function chercherTousLesNoms() {
    try {
        const reponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
        console.log("Hello, i'm working");

        if (!reponse.ok) {
            throw new Error(`Erreur HTTP ! statut : ${reponse.status}`);
        }

        const donnees = await reponse.json();
        return donnees.results;
    } catch (error) {
        console.error("Erreur dans chercherTousLesNoms:", error);
        return []; // En cas d'erreur, on renvoie une liste vide pour éviter de faire planter une boucle .map()
    }
}

export async function chercherTypes() {
    try {
        const reponse = await fetch('https://pokeapi.co/api/v2/type');

        if (!reponse.ok) {
            throw new Error(`Impossible de récupérer les types.`);
        }

        const donnees = await reponse.json();
        return donnees.results;
    } catch (error) {
        console.error("Erreur dans chercherTypes:", error);
        return [];
    }
}

export async function chercherPokemonParType(typeUrl: string) {
    try {
        const reponse = await fetch(typeUrl);

        if (!reponse.ok) {
            throw new Error(`Erreur sur l'URL du type.`);
        }

        const donnees = await reponse.json();
        return donnees.pokemon.map((p: any) => p.pokemon);
    } catch (error) {
        console.error("Erreur dans chercherPokemonParType:", error);
        return [];
    }
}