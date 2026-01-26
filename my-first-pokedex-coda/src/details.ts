import { chercherDetails } from './api.ts';

async function recupererBio(speciesUrl: string): Promise<string> {
    const res = await fetch(speciesUrl);
    const species = await res.json();

    const entryFR = species.flavor_text_entries.find(
        (e: any) => e.language.name === "fr"
    );

    return entryFR
        ? entryFR.flavor_text.replace(/\f|\n/g, ' ')
        : "Aucune description disponible.";
}


export async function afficherLaFiche(url: string, cri: string) {
    const details = await chercherDetails(url);
    console.log("species url =", details?.species?.url);
    const ecran = document.querySelector('#pokemon-list') as HTMLElement;

    if (ecran) {
        ecran.classList.remove('grid-10-pixels');
        ecran.style.display = 'block';

        const imageArt =
            details.sprites.versions["generation-v"]["black-white"]
                ?.animated?.front_default
            || details.sprites.front_default;

        const type = details.types.map((t: any) => t.type.name).join(' / ');
        const bio = await recupererBio(details.species.url);


        ecran.innerHTML = `
            <pokemon-details
                name="${details.name}" 
                image="${imageArt}"
                id-pkm="${details.id}"  
                cri="${cri}"
                type="${type}"
                bio="${bio.replace(/"/g, '&quot;')}"
                stats='${JSON.stringify(details.stats)}'>
            </pokemon-details>
            `;
    }
}
(window as any).afficherPopup = afficherLaFiche;