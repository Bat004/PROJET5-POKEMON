export const POKEMONS_PAR_PAGE = 10;
let pageActuelle = 0;

export function initialiserPagination(auChangementDePage: (nouvellePage: number) => void) {
    const btnAvant = document.querySelector('#btn-precedent');
    const btnApres = document.querySelector('#btn-suivant');
    const menuPages = document.querySelector('#page-select') as HTMLSelectElement;

    btnApres?.addEventListener('click', () => {
        pageActuelle++;
        auChangementDePage(pageActuelle);
    });

    btnAvant?.addEventListener('click', () => {
        if (pageActuelle > 0) {
            pageActuelle--;
            auChangementDePage(pageActuelle);
        }
    });

    menuPages?.addEventListener('change', (e) => {
        pageActuelle = parseInt((e.target as HTMLSelectElement).value);
        auChangementDePage(pageActuelle);
    });
}

export function obtenirPageActuelle() {
    return pageActuelle;
}
