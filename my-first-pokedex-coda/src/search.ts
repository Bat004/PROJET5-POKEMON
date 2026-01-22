import { chargerLaListe, chargerLaListeDepuisDonnees } from './listepkm.ts';

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

let tousLesPokemons: { name: string; url: string }[] | null = null;

async function chargerTousLesPokemons(): Promise<{ name: string; url: string }[]> {
    if (tousLesPokemons) return tousLesPokemons;

    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
    const data = await res.json() as { results: { name: string; url: string }[] };

    tousLesPokemons = data.results;
    return tousLesPokemons;
}

export function initialiserRechercheVhsFiltreGlobal(): void {
    const input = document.querySelector('#vhs-search-input') as HTMLInputElement | null;
    if (!input) return;

    let delai: number | undefined;

    const appliquer = async () => {
        const q = input.value.trim().toLowerCase();

        if (!q) {
            await chargerLaListe();
            return;
        }

        const source = await chargerTousLesPokemons();
        const filtres = filtrerLesPokemons(source, q);

        await chargerLaListeDepuisDonnees(filtres.slice(0, 10), 0);
    };

    input.addEventListener('input', () => {
        if (delai) window.clearTimeout(delai);
        delai = window.setTimeout(() => {
            void appliquer();
        }, 300);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.value = '';
            void chargerLaListe();
        }
    });

    void chargerTousLesPokemons();
}