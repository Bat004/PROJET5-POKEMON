import './carte.ts'

export function genererSquelette(zone: HTMLElement) {
    zone.innerHTML = `
      <div class="header-container">
        <div class="header-left">
          <div id="pokeball-btn"><img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" id="pokeball-img" /></div>
          <div id="search-box" class="search-hidden"><input type="text" id="pokemon-search" placeholder="NOM DU POKEMON..." /></div>
          <h1>Pokedex</h1>
        </div>
        <div class="pagination-header">
          <button id="btn-precedent"><</button>
          <div class="page-display"><select id="page-select"></select><span>/</span><span id="total-pages">0</span></div>
          <button id="btn-suivant">></button>
        </div>
      </div>
      <ul id="pokemon-list"></ul>
      <div id="pokemon-pop-up"></div> 
    `;
}

export function mettreAJourPagination(nbTotalElements: number, pageActuelle: number) {
    const menu = document.querySelector('#page-select') as HTMLSelectElement;
    const texteTotal = document.querySelector('#total-pages');
    const nbPages = Math.ceil(nbTotalElements / 20);

    if (texteTotal) texteTotal.textContent = nbPages.toString();
    if (menu) {
        if (menu.options.length === 0) {
            for (let i = 0; i < nbPages; i++) {
                const opt = document.createElement('option');
                opt.value = i.toString();
                opt.text = (i + 1).toString();
                menu.add(opt);
            }
        }
        menu.value = pageActuelle.toString();
    }
}

export function creerCarte(nom: string, image: string, url: string, cri: string) {
    return `
      <li class="pokemon-card">
        <img src="${image}" alt="${nom}" />
        <span class="pokemon-name" onclick="afficherPopup('${url}', '${cri}')">
          ${nom}
        </span>
      </li>
    `;
}
