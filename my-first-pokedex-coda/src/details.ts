import { chercherDetails } from './api.ts';

export async function afficherLaFiche(url: string, cri: string) {
    const details = await chercherDetails(url);
    const ecran = document.querySelector('#pokemon-list') as HTMLElement;

    if (ecran) {
        ecran.classList.remove('grid-10-pixels');
        ecran.style.display = 'block';

        const imageArt = details.sprites.front_default;

        ecran.innerHTML = `
            <pokemon-details
                name="${details.name}" 
                image="${imageArt}"
                id-pkm="${details.id}"
                cri="${cri}"
                stats='${JSON.stringify(details.stats)}'>
            </pokemon-details>
        `;
    }
}
(window as any).afficherPopup = afficherLaFiche;