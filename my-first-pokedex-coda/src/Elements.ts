/**
 * Elements.ts
 * Gestion des éléments interactifs et des modales (Filtrage et Recherche)
 */
import { chercherTypes, chercherPokemonParType, chercherDetails, chercherPokemonParGeneration, chercherGenerations } from './api.ts';
import { chargerLaListeDepuisDonnees, chargerLaListe } from './listepkm.ts';

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
        this.modalOverlay.id = `modal-overlay-${this.id}`;
        this.modalOverlay.className = 'modal-overlay';

        this.modal = document.createElement('div');
        this.modal.id = `modal-content-${this.id}`;
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
                <div id="types-container" class="types-grid">
                    <p>Chargement des types...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-action-btn secondary" id="modal-reset-types">Réinitialiser</button>
                <button class="modal-action-btn" id="modal-close-types">Fermer</button>
            </div>
        `;

        this.modal.querySelector('.modal-close-btn')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-close-types')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-reset-types')?.addEventListener('click', () => {
            chargerLaListe();
            this.close();
        });
    }

    public async open(): Promise<void> {
        super.open();
        if (!this.typesCharge) {
            await this.chargerEtAfficherTypes();
        }
    }

    private async chargerEtAfficherTypes(): Promise<void> {
        const container = document.getElementById('types-container');
        if (!container) return;

        try {
            const types = await chercherTypes();
            container.innerHTML = '';

            const traductions: { [key: string]: string } = {
                normal: 'Normal', fighting: 'Combat', flying: 'Vol', poison: 'Poison',
                ground: 'Sol', rock: 'Roche', bug: 'Insecte', ghost: 'Spectre',
                steel: 'Acier', fire: 'Feu', water: 'Eu', grass: 'Plante',
                electric: 'Electrik', psychic: 'Psy', ice: 'Glace', dragon: 'Dragon',
                dark: 'Tenebres', fairy: 'Fee'
            };

            types.forEach((type: any) => {
                if (type.name === 'unknown' || type.name === 'shadow') return;
                const btn = document.createElement('button');
                btn.className = `type-btn type-${type.name}`;
                btn.textContent = traductions[type.name] || type.name;
                btn.addEventListener('click', async () => {
                    container.innerHTML = '<p>Filtrage en cours...</p>';
                    const pokemons = await chercherPokemonParType(type.url);
                    await chargerLaListeDepuisDonnees(pokemons.slice(0, 10));
                    this.close();
                    this.chargerEtAfficherTypes();
                });
                container.appendChild(btn);
            });
            this.typesCharge = true;
        } catch (error) {
            container.innerHTML = '<p>Erreur de chargement.</p>';
        }
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
                <h2>Recherche Pokémon</h2>
                <button class="modal-close-btn">✕</button>
            </div>
            <div class="modal-body">
                <div class="search-container">
                    <label for="pokemon-id-input" class="search-label">Trouve le Pokémon via son ID</label>
                    <div class="search-input-group">
                        <input type="number" id="pokemon-id-input" placeholder="Ex: 25" min="1" max="1025">
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
            
            const errorMsg = document.getElementById('search-error');
            if (errorMsg) errorMsg.style.display = 'none';

            try {
                const pokemon = await chercherDetails(`https://pokeapi.co/api/v2/pokemon/${id}/`);
                // On crée un format compatible avec chargerLaListeDepuisDonnees
                const result = [{
                    name: pokemon.name,
                    url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`
                }];
                await chargerLaListeDepuisDonnees(result);
                this.close();
                input.value = '';
            } catch (error) {
                if (errorMsg) {
                    errorMsg.textContent = "Pokemon introuvable. Vérifiez l'ID.";
                    errorMsg.style.display = 'block';
                }
            }
        };

        btn?.addEventListener('click', executerRecherche);
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executerRecherche();
        });
    }
}

/**
 * Modale pour le filtrage par Génération (Bouton A)
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
                <h2>Filtrer par Génération</h2>
                <button class="modal-close-btn">✕</button>
            </div>
            <div class="modal-body">
                <div id="gens-container" class="gens-grid">
                    <p>Chargement des générations...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-action-btn secondary" id="modal-reset-gens">Réinitialiser</button>
                <button class="modal-action-btn" id="modal-close-gens">Fermer</button>
            </div>
        `;

        this.modal.querySelector('.modal-close-btn')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-close-gens')?.addEventListener('click', () => this.close());
        this.modal.querySelector('#modal-reset-gens')?.addEventListener('click', () => {
            chargerLaListe();
            this.close();
        });
    }

    public async open(): Promise<void> {
        super.open();
        if (!this.gensCharge) {
            await this.chargerEtAfficherGens();
        }
    }

    private async chargerEtAfficherGens(): Promise<void> {
        const container = document.getElementById('gens-container');
        if (!container) return;

        try {
            const gens = await chercherGenerations();
            container.innerHTML = '';

            gens.forEach((gen: any, index: number) => {
                const btn = document.createElement('button');
                btn.className = `gen-btn gen-${index + 1}`;
                // On transforme "generation-i" en "Génération 1"
                const genNumber = index + 1;
                btn.textContent = `Gén. ${genNumber}`;
                
                btn.addEventListener('click', async () => {
                    container.innerHTML = '<p>Filtrage en cours...</p>';
                    const pokemons = await chercherPokemonParGeneration(gen.url);
                    // On trie par ID pour avoir un ordre logique
                    const sortedPokemons = pokemons.sort((a: any, b: any) => {
                        const idA = parseInt(a.url.split('/').filter(Boolean).pop());
                        const idB = parseInt(b.url.split('/').filter(Boolean).pop());
                        return idA - idB;
                    });
                    await chargerLaListeDepuisDonnees(sortedPokemons.slice(0, 10));
                    this.close();
                    this.chargerEtAfficherGens();
                });
                container.appendChild(btn);
            });
            this.gensCharge = true;
        } catch (error) {
            container.innerHTML = '<p>Erreur de chargement.</p>';
        }
    }
}

export function initialiserBoutonsAction(): void {
    const typeModal = new TypeModal();
    const searchModal = new SearchModal();
    const genModal = new GenerationModal();

    // Bouton Y - Filtrage par Type
    const btnY = document.querySelector('.btn-y');
    btnY?.addEventListener('click', () => typeModal.open());

    // Bouton B - Recherche par ID
    const btnB = document.querySelector('.btn-b');
    btnB?.addEventListener('click', () => searchModal.open());

    // Bouton A - Filtrage par Génération
    const btnA = document.querySelector('.btn-a');
    btnA?.addEventListener('click', () => genModal.open());
}
