import './components/PokemonCard.ts'
import './components/PokemonDetails.ts'
import './details.ts'

export function genererSquelette() {}

export function mettreAJourPagination() {}

export function creerCarte(nom: string, image: string, url: string, cri: string) {
    return `
      <pokemon-card 
        name="${nom}" 
        image="${image}" 
        url="${url}" 
        cri="${cri}"
      </pokemon-card>
    `;
}