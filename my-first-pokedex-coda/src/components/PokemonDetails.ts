export class PokemonDetails extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const name = this.getAttribute('name') || '';
        const image = this.getAttribute('image') || '';
        const id = this.getAttribute('id-pkm') || '';
        const type = this.getAttribute('type') || '';
        const statsStr = this.getAttribute('stats') || '[]';
        let stats = [];
        
        try {
            stats = JSON.parse(statsStr);
        } catch (e) {
            console.error("Erreur parse stats", e);
        }

        const statsHtml = stats.map((s: any) => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('');
        const cri = this.getAttribute('cri') || '';

        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/src/style.css">
            <div class="fiche-detaillee">
                <div class="fiche-header">
                    <h2>${name}</h2>
                    <button class="btn-retour" onclick="location.reload()">RETOUR</button>
                </div>
                <div class="fiche-corps">
                    <img src="${image}" alt="${name}" />
                    <div class="info-box">
                        <p>ID: #${id}</p>
                        <p>Type: ${type}</p>
                        <button class="btn-cri" onclick="new Audio('${cri}').play()">CRI</button>
                        <ul>${statsHtml}</ul>
                    </div>
                </div>
            </div>
            `;
        }
    }
}

if (!customElements.get('pokemon-details')) {
    customElements.define('pokemon-details', PokemonDetails);
}