/**
 * Elements.ts
 * Logique mixte : Types (INTERSECTION ET), Générations (UNION OU)
 * Pagination de 10 pokémons par page
 */
import { chercherTypes, chercherPokemonParType, chercherDetails, chercherGenerations, chercherPokemonParGeneration } from './api.ts';
import { chargerLaListeDepuisDonnees, chargerLaListe } from './listepkm.ts';
import { obtenirPageActuelle } from './pagination.ts';

/**
 * Gestionnaire d'etat global pour les filtres
 */
class FilterManager {
    public selectedTypes: { name: string, url: string }[] = [];
    public selectedGens: { name: string, url: string }[] = [];
    private filteredResults: any[] = [];
    private isFiltering: boolean = false;

    public async applyFilters() {
        let typeResults: any[] | null = null;
        let genResults: any[] | null = null;

        // 1. Filtrage par Types (Intersection : Type A ET Type B)
        if (this.selectedTypes.length > 0) {
            const allTypePokesLists = await Promise.all(
                this.selectedTypes.map(t => chercherPokemonParType(t.url))
            );
            
            let intersection = allTypePokesLists[0];
            for (let i = 1; i < allTypePokesLists.length; i++) {
                const currentListNames = new Set(allTypePokesLists[i].map((p: any) => p.name));
                intersection = intersection.filter((p: any) => currentListNames.has(p.name));
            }
            typeResults = intersection;
        }

        // 2. Filtrage par Générations (Union : Gen A OU Gen B)
        if (this.selectedGens.length > 0) {
            const allGenPokesLists = await Promise.all(
                this.selectedGens.map(g => chercherPokemonParGeneration(g.url))
            );
            
            const seen = new Set();
            genResults = [];
            for (const list of allGenPokesLists) {
                for (const p of list) {
                    if (!seen.has(p.name)) {
                        seen.add(p.name);
                        genResults.push(p);
                    }
                }
            }
        }

        // 3. Combinaison finale (Intersection entre Types et Générations)
        let finalResults: any[] = [];

        if (typeResults !== null && genResults !== null) {
            const genNames = new Set(genResults.map((p: any) => p.name));
            finalResults = typeResults.filter((p: any) => genNames.has(p.name));
            this.isFiltering = true;
        } 
        else if (typeResults !== null) {
            finalResults = typeResults;
            this.isFiltering = true;
        } 
        else if (genResults !== null) {
            finalResults = genResults;
            this.isFiltering = true;
        } 
        else {
            this.isFiltering = false;
            this.filteredResults = [];
            await chargerLaListe();
            this.updateModalsBorder(false);
            return;
        }

        this.filteredResults = finalResults;
        this.filteredResults.sort((a: any, b: any) => {
            const idA = parseInt(a.url.split('/').filter(Boolean).pop());
            const idB = parseInt(b.url.split('/').filter(Boolean).pop());
            return idA - idB;
        });

        await this.renderCurrentPage();
        this.updateModalsBorder(true);
    }

    public async renderCurrentPage() {
        if (!this.isFiltering) {
            await chargerLaListe();
            return;
        }

        const page = obtenirPageActuelle();
        const start = page * 10;
        const end = start + 10;
        const pageData = this.filteredResults.slice(start, end);
        
        await chargerLaListeDepuisDonnees(pageData, page);
    }

    public getIsFiltering(): boolean {
        return this.isFiltering;
    }

    private updateModalsBorder(hasFilters: boolean) {
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach(modal => {
            if (hasFilters) {
                modal.classList.add('filters-active');
            } else {
                modal.classList.remove('filters-active');
            }
        });
    }

    public reset() {
        this.selectedTypes = [];
        this.selectedGens = [];
        this.isFiltering = false;
        this.filteredResults = [];
        this.applyFilters();
    }

    public toggleType(type: { name: string, url: string }) {
        const index = this.selectedTypes.findIndex(t => t.name === type.name);
        if (index === -1) {
            this.selectedTypes.push(type);
        } else {
            this.selectedTypes.splice(index, 1);
        }
    }

    public toggleGen(gen: { name: string, url: string }) {
        const index = this.selectedGens.findIndex(g => g.url === gen.url);
        if (index === -1) {
            this.selectedGens.push(gen);
        } else {
            this.selectedGens.splice(index, 1);
        }
    }

    public isTypeSelected(typeName: string): boolean {
        return this.selectedTypes.some(t => t.name === typeName);
    }

    public isGenSelected(genUrl: string): boolean {
        return this.selectedGens.some(g => g.url === genUrl);
    }
}

export const filterState = new FilterManager();

// Dictionnaire de traduction des types
const traductionsTypes: { [key: string]: string } = {
    normal: 'Normal', fighting: 'Combat', flying: 'Vol', poison: 'Poison',
    ground: 'Sol', rock: 'Roche', bug: 'Insecte', ghost: 'Spectre',
    steel: 'Acier', fire: 'Feu', water: 'Eau', grass: 'Plante',
    electric: 'Electrik', psychic: 'Psy', ice: 'Glace', dragon: 'Dragon',
    dark: 'Tenebres', fairy: 'Fee'
};

/**
 * Classe de base pour les modales
 */
abstract class BaseModal {
    protected modal: HTMLElement | null = null;
    protected modalOverlay: HTMLElement | null = null;
    protected id: string;

    constructor(id: string) {
        this.id = id;
        this.createBaseStructure();
    }

    private createBaseStructure(): void {
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.className = 'modal-overlay';
        this.modal = document.createElement('div');
        this.modal.className = 'modal-content';

        document.body.appendChild(this.modalOverlay);
        document.body.appendChild(this.modal);

        this.modalOverlay.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });
    }

    public open(): void {
        if (this.modal && this.modalOverlay) {
            this.modalOverlay.classList.add('active');
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    public close(): void {
        if (this.modal && this.modalOverlay) {
            this.modalOverlay.classList.remove('active');
            this.modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    protected isOpen(): boolean {
        return this.modal?.classList.contains('active') || false;
    }

    protected abstract initContent(): void;
}

/**
 * Modale pour le filtrage par Type (Bouton Y)
 */
class TypeModal extends BaseModal {
    private typesCharge: boolean = false;

    constructor() {
        super('types');
        this.initContent();
    }

    protected initContent(): void {
        if (!this.modal) return;
        this.modal.innerHTML = `
            <div class="modal-header">
                <h2>Filtrer par Type (Intersection ET)</h2>
                <button class="modal-close-btn">✕</button>
            </div>
            <div class="modal-body">
                <div id="active-filters-type" class="active-filters-info"></div>
                <div id="types-container" class="types-grid">
                    <p>Chargement...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-action-btn secondary" id="modal-reset-types">Reinitialiser</button>
                <button class="modal-action-btn primary" id="modal-apply-types">Appliquer</button>
                <button class="modal-action-btn" id="modal-close-types">Fermer</button>
            </div>
        `;

        this.modal.querySelector('.modal-close-btn')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-close-types')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-apply-types')?.addEventListener('click', async () => {
            await filterState.applyFilters();
            this.close();
        });
        this.modal.querySelector('#modal-reset-types')?.addEventListener('click', async () => {
            filterState.selectedTypes = [];
            this.updateActiveInfo();
            this.refreshButtons();
            await filterState.applyFilters();
        });
    }

    private updateActiveInfo() {
        const info = this.modal?.querySelector('#active-filters-type');
        if (info) {
            if (filterState.selectedTypes.length === 0) {
                info.textContent = "Aucun type sélectionné";
            } else {
                const names = filterState.selectedTypes.map(t => traductionsTypes[t.name] || t.name).join(' + ');
                info.textContent = `Types requis : ${names}`;
            }
        }
    }

    private refreshButtons() {
        const container = this.modal?.querySelector('#types-container');
        if (!container) return;
        const buttons = container.querySelectorAll('.type-btn');
        buttons.forEach((btn: any) => {
            const typeName = btn.getAttribute('data-type');
            if (filterState.isTypeSelected(typeName)) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    public async open(): Promise<void> {
        super.open();
        if (!this.typesCharge) {
            await this.chargerEtAfficherTypes();
        } else {
            this.updateActiveInfo();
            this.refreshButtons();
        }
    }

    private async chargerEtAfficherTypes(): Promise<void> {
        const container = this.modal?.querySelector('#types-container');
        if (!container) return;

        try {
            const types = await chercherTypes();
            container.innerHTML = '';
            types.forEach((type: any) => {
                if (type.name === 'unknown' || type.name === 'shadow') return;
                const btn = document.createElement('button');
                btn.className = `type-btn type-${type.name}`;
                btn.setAttribute('data-type', type.name);
                btn.textContent = traductionsTypes[type.name] || type.name;
                
                if (filterState.isTypeSelected(type.name)) btn.classList.add('selected');

                btn.addEventListener('click', () => {
                    filterState.toggleType({ name: type.name, url: type.url });
                    btn.classList.toggle('selected');
                    this.updateActiveInfo();
                });
                container.appendChild(btn);
            });
            this.typesCharge = true;
            this.updateActiveInfo();
        } catch (error) { container.innerHTML = '<p>Erreur.</p>'; }
    }
}

/**
 * Modale pour le filtrage par Generation (Bouton A)
 */
class GenerationModal extends BaseModal {
    private gensCharge: boolean = false;

    constructor() {
        super('generations');
        this.initContent();
    }

    protected initContent(): void {
        if (!this.modal) return;
        this.modal.innerHTML = `
            <div class="modal-header">
                <h2>Filtrer par Generation (Union OU)</h2>
                <button class="modal-close-btn">✕</button>
            </div>
            <div class="modal-body">
                <div id="active-filters-gen" class="active-filters-info"></div>
                <div id="gens-container" class="gens-grid">
                    <p>Chargement...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-action-btn secondary" id="modal-reset-gens">Reinitialiser</button>
                <button class="modal-action-btn primary" id="modal-apply-gens">Appliquer</button>
                <button class="modal-action-btn" id="modal-close-gens">Fermer</button>
            </div>
        `;

        this.modal.querySelector('.modal-close-btn')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-close-gens')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-apply-gens')?.addEventListener('click', async () => {
            await filterState.applyFilters();
            this.close();
        });
        this.modal.querySelector('#modal-reset-gens')?.addEventListener('click', async () => {
            filterState.selectedGens = [];
            this.updateActiveInfo();
            this.refreshButtons();
            await filterState.applyFilters();
        });
    }

    private updateActiveInfo() {
        const info = this.modal?.querySelector('#active-filters-gen');
        if (info) {
            if (filterState.selectedGens.length === 0) {
                info.textContent = "Aucune génération sélectionnée";
            } else {
                const names = filterState.selectedGens.map(g => g.name).join(', ');
                info.textContent = `Générations actives : ${names}`;
            }
        }
    }

    private refreshButtons() {
        const container = this.modal?.querySelector('#gens-container');
        if (!container) return;
        const buttons = container.querySelectorAll('.gen-btn');
        buttons.forEach((btn: any) => {
            const genUrl = btn.getAttribute('data-url');
            if (filterState.isGenSelected(genUrl)) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    public async open(): Promise<void> {
        super.open();
        if (!this.gensCharge) {
            await this.chargerEtAfficherGens();
        } else {
            this.updateActiveInfo();
            this.refreshButtons();
        }
    }

    private async chargerEtAfficherGens(): Promise<void> {
        const container = this.modal?.querySelector('#gens-container');
        if (!container) return;

        try {
            const gens = await chercherGenerations();
            container.innerHTML = '';
            gens.forEach((gen: any, index: number) => {
                const btn = document.createElement('button');
                btn.className = `gen-btn gen-${index + 1}`;
                btn.setAttribute('data-url', gen.url);
                btn.textContent = `Gen. ${index + 1}`;
                
                if (filterState.isGenSelected(gen.url)) btn.classList.add('selected');

                btn.addEventListener('click', () => {
                    filterState.toggleGen({ name: `Gen. ${index + 1}`, url: gen.url });
                    btn.classList.toggle('selected');
                    this.updateActiveInfo();
                });
                container.appendChild(btn);
            });
            this.gensCharge = true;
            this.updateActiveInfo();
        } catch (error) { container.innerHTML = '<p>Erreur.</p>'; }
    }
}

/**
 * Modale pour la recherche par ID (Bouton B)
 */
class SearchModal extends BaseModal {
    constructor() {
        super('search');
        this.initContent();
    }

    protected initContent(): void {
        if (!this.modal) return;
        this.modal.innerHTML = `
            <div class="modal-header">
                <h2>Recherche Pokemon</h2>
                <button class="modal-close-btn">✕</button>
            </div>
            <div class="modal-body">
                <div class="search-container">
                    <label for="pokemon-id-input" class="search-label">Trouve le Pokemon via son ID</label>
                    <div class="search-input-group">
                        <input type="number" id="pokemon-id-input" placeholder="Ex: 25">
                        <button id="btn-search-id" class="modal-action-btn">Chercher</button>
                    </div>
                    <p id="search-error" class="search-error-msg" style="display: none;"></p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-action-btn secondary" id="modal-close-search">Annuler</button>
            </div>
        `;

        this.modal.querySelector('.modal-close-btn')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-close-search')?.addEventListener('click', () => this.close());

        const input = this.modal.querySelector('#pokemon-id-input') as HTMLInputElement;
        const btn = this.modal.querySelector('#btn-search-id');

        const executerRecherche = async () => {
            const id = input.value.trim();
            if (!id) return;
            try {
                const pokemon = await chercherDetails(`https://pokeapi.co/api/v2/pokemon/${id}/`);
                await chargerLaListeDepuisDonnees([{ name: pokemon.name, url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/` }]);
                this.close();
                input.value = '';
            } catch (error) {
                const errorMsg = document.getElementById('search-error');
                if (errorMsg) { errorMsg.textContent = "Introuvable."; errorMsg.style.display = 'block'; }
            }
        };

        btn?.addEventListener('click', executerRecherche);
        input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executerRecherche(); });
    }
}

export function initialiserBoutonsAction(): void {
    const typeModal = new TypeModal();
    const searchModal = new SearchModal();
    const genModal = new GenerationModal();

    document.querySelector('.btn-y')?.addEventListener('click', () => typeModal.open());
    document.querySelector('.btn-b')?.addEventListener('click', () => searchModal.open());
    document.querySelector('.btn-a')?.addEventListener('click', () => genModal.open());
}
