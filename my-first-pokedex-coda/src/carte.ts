import {chercherDetails} from "./api.ts";

async function afficherPopup(url: string, cri: string) {
    const details = await chercherDetails(url);
    const popup = document.querySelector('#pokemon-pop-up') as HTMLElement;

    if (popup) {
        const statsHtml = details.stats.map((s: any) => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('');
        popup.innerHTML = `
          <div class="popup-content">
            <button class="btn-cri" onclick="new Audio('${cri}').play()">CRI</button>
            <h2>${details.name}</h2>
            <img src="${details.sprites.other['official-artwork'].front_default}"/>
            <p>ID: #${details.id}</p>
            <ul>${statsHtml}</ul>
          </div>
        `;
        popup.style.display = 'flex';
        popup.addEventListener('click', (event) => {
            if (event.target === popup) {
                popup.style.display = 'none';
            }
        });
    }
}
(window as any).afficherPopup = afficherPopup;
