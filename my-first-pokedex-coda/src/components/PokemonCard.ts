export class PokemonCard extends HTMLElement {
    static get observedAttributes() {
        return ['name', 'image', 'url', 'cri', 'type'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() { this.render(); }
    attributeChangedCallback() { this.render(); }

    render() {
        const name = this.getAttribute('name');
        const image = this.getAttribute('image');
        const url = this.getAttribute('url');
        const cri = this.getAttribute('cri');

        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/src/style.css">
            <div class="card-wrapper" onclick="window.afficherPopup('${url}', '${cri}')">
                <img src="${image}" alt="${name}" />
                <p>${name}</p>
            </div>
            `;
        }
    }
}

if (!customElements.get('pokemon-card')) {
    customElements.define('pokemon-card', PokemonCard);
}