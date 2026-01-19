export function initialiserRecherche(auChangement: () => void) {
    const boutonPokeball = document.querySelector('#pokeball-btn');
    const boiteRecherche = document.querySelector('#search-box');
    const imagePokeball = document.querySelector('#pokeball-img');
    const champSaisie = document.querySelector('#pokemon-search') as HTMLInputElement;

    boutonPokeball?.addEventListener('click', () => {
        boiteRecherche?.classList.toggle('search-visible');
        boiteRecherche?.classList.toggle('search-hidden');
        imagePokeball?.classList.toggle('opened');
        if (boiteRecherche?.classList.contains('search-visible')) {
            champSaisie?.focus();
        }
    });

    champSaisie?.addEventListener('input', () => {
        auChangement();
    });

    let delai: number;
    champSaisie?.addEventListener('input', () => {
        clearTimeout(delai);
        delai = setTimeout(() => {
            auChangement();
        }, 300);
    });
}

export function filtrerLesPokemons(liste: any[], texte: string) {
    if (!texte) return [];
    
    const debutReg = new RegExp('^' + texte, 'i');

    return liste
        .filter(p => p.name.toLowerCase().includes(texte.toLowerCase()))
        .sort((a, b) => {
            const aCommence = debutReg.test(a.name);
            const bCommence = debutReg.test(b.name);
            if (aCommence && !bCommence) return -1;
            if (!aCommence && bCommence) return 1;
            return a.name.localeCompare(b.name);
        });
}