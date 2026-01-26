import './style.css'
import { initialiserPagination } from './pagination.ts'
import { chargerLaListe } from './listepkm.ts'
import { initialiserBoutonsAction, filterState } from './Elements.ts'
import { initialiserRechercheVhsFiltreGlobal } from './search.ts'
import { initialiserCartridges } from './cartridges.ts'

initialiserPagination(() => {
    if (filterState.getIsFiltering()) {
        filterState.renderCurrentPage();
    } else {
        chargerLaListe();
    }
});

chargerLaListe();

initialiserBoutonsAction();

initialiserRechercheVhsFiltreGlobal();
initialiserCartridges();

// Logique du bouton ON/OFF
const btnPower = document.getElementById('btn-power');
const powerLed = document.getElementById('power-led');
const screenDisplay = document.querySelector('.pixel-screen-display');
const vhsScreen = document.querySelector('.vhs-mini-screen');
let isPowerOn = true;

btnPower?.addEventListener('click', () => {
    isPowerOn = !isPowerOn;
    
    // Déclencher l'animation de flash
    screenDisplay?.classList.add('power-anim');
    vhsScreen?.classList.add('power-anim');
    
    setTimeout(() => {
        if (isPowerOn) {
            powerLed?.classList.add('active');
            screenDisplay?.classList.remove('off');
            vhsScreen?.classList.remove('off');
        } else {
            powerLed?.classList.remove('active');
            screenDisplay?.classList.add('off');
            vhsScreen?.classList.add('off');
        }
        
        // Retirer la classe d'animation après coup
        setTimeout(() => {
            screenDisplay?.classList.remove('power-anim');
            vhsScreen?.classList.remove('power-anim');
        }, 400);
    }, 200); // Le changement d'état se fait au milieu du flash
});

window.addEventListener('pokedex-reload', () => {
    chargerLaListe();
});
