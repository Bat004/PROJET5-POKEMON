/**
 * Elements.ts
 * Gestion des filtres cumulables sans accents et avec types traduits
 */
import { chercherTypes, chercherPokemonParType, chercherDetails, chercherGenerations, chercherPokemonParGeneration } from './api.ts';
import { chargerLaListeDepuisDonnees, chargerLaListe } from './listepkm.ts';

/**
 * Gestionnaire d'etat global pour les filtres
 */
class FilterManager {
    public currentType: { name: string, url: string } | null = null;
    public currentGen: { name: string, url: string } | null = null;

    public async applyFilters() {
        let results: any[] = [];

        if (this.currentType && this.currentGen) {
            const typePokes = await chercherPokemonParType(this.currentType.url);
            const genPokes = await chercherPokemonParGeneration(this.currentGen.url);
            const genNames = new Set(genPokes.map((p: any) => p.name));
            results = typePokes.filter((p: any) => genNames.has(p.name));
        } 
        else if (this.currentType) {
            results = await chercherPokemonParType(this.currentType.url);
        } 
        else if (this.currentGen) {
            results = await chercherPokemonParGeneration(this.currentGen.url);
        } 
        else {
            await chargerLaListe();
            this.updateModalsBorder(false);
            return;
        }

        results.sort((a: any, b: any) => {
            const idA = parseInt(a.url.split('/').filter(Boolean).pop());
            const idB = parseInt(b.url.split('/').filter(Boolean).pop());
            return idA - idB;
        });

        await chargerLaListeDepuisDonnees(results.slice(0, 10));
        this.updateModalsBorder(true);
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
        this.currentType = null;
        this.currentGen = null;
        this.applyFilters();
    }
}

const filterState = new FilterManager();

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
                <h2>Filtrer par Type</h2>
                <button class="modal-close-btn">✕</button>
            </div>
            <div class="modal-body">
                <div id="active-filters-type" class="active-filters-info"></div>
                <div id="types-container" class="types-grid">
                    <p>Chargement...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-action-btn secondary" id="modal-reset-types">Reinitialiser Tout</button>
                <button class="modal-action-btn" id="modal-close-types">Fermer</button>
            </div>
        `;

        this.modal.querySelector('.modal-close-btn')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-close-types')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-reset-types')?.addEventListener('click', () => {
            filterState.reset();
            this.updateActiveInfo();
            this.close();
        });
    }

    private updateActiveInfo() {
        const info = this.modal?.querySelector('#active-filters-type');
        if (info) {
            const typeName = filterState.currentType ? (traductionsTypes[filterState.currentType.name] || filterState.currentType.name) : "Aucun";
            info.textContent = `Type actif : ${typeName}`;
        }
    }

    public async open(): Promise<void> {
        super.open();
        this.updateActiveInfo();
        if (!this.typesCharge) await this.chargerEtAfficherTypes();
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
                btn.textContent = traductionsTypes[type.name] || type.name;
                btn.addEventListener('click', async () => {
                    filterState.currentType = { name: type.name, url: type.url };
                    await filterState.applyFilters();
                    this.close();
                });
                container.appendChild(btn);
            });
            this.typesCharge = true;
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
                <h2>Filtrer par Generation</h2>
                <button class="modal-close-btn">✕</button>
            </div>
            <div class="modal-body">
                <div id="active-filters-gen" class="active-filters-info"></div>
                <div id="gens-container" class="gens-grid">
                    <p>Chargement...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-action-btn secondary" id="modal-reset-gens">Reinitialiser Tout</button>
                <button class="modal-action-btn" id="modal-close-gens">Fermer</button>
            </div>
        `;

        this.modal.querySelector('.modal-close-btn')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-close-gens')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-reset-gens')?.addEventListener('click', () => {
            filterState.reset();
            this.updateActiveInfo();
            this.close();
        });
    }

    private updateActiveInfo() {
        const info = this.modal?.querySelector('#active-filters-gen');
        if (info) {
            info.textContent = filterState.currentGen ? `Generation active : ${filterState.currentGen.name}` : "Aucune";
        }
    }

    public async open(): Promise<void> {
        super.open();
        this.updateActiveInfo();
        if (!this.gensCharge) await this.chargerEtAfficherGens();
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
                btn.textContent = `Gen. ${index + 1}`;
                btn.addEventListener('click', async () => {
                    filterState.currentGen = { name: `Generation ${index + 1}`, url: gen.url };
                    await filterState.applyFilters();
                    this.close();
                });
                container.appendChild(btn);
            });
            this.gensCharge = true;
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
