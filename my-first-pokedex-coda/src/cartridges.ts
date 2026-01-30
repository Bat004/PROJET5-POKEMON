import { chercherTousLesNoms, chercherDetails } from './api';

// Gestion de l'état de l'équipe
const TEAM_STORAGE_KEY = 'pokemon_team_data';

function getTeam() {
    const saved = localStorage.getItem(TEAM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [null, null, null, null, null, null];
}

function saveTeam(team: any[]) {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
}

export function initialiserCartridges() {
    // 1. Injection du CSS spécifique harmonisé
    const style = document.createElement('style');
    style.textContent = `
        .cartridge-slot-dynamic {
            position: absolute;
            top: -45px;
            right: 50px;
            width: 130px;
            height: 50px;
            background: #cc313f;
            border: 5px solid #2f3542;
            border-bottom: none;
            border-radius: 10px 10px 0 0;
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: flex-end;
            cursor: pointer;
            box-shadow: inset 0 5px 10px rgba(0,0,0,0.3);
        }
        .cartridge-dynamic {
            width: 110px;
            height: 60px;
            background: #2ecc71;
            border: 4px solid #2f3542;
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 5px;
            transform: translateY(-35px);
            transition: transform 0.2s;
            box-shadow: 4px 0 0 rgba(0,0,0,0.2);
        }
        .cartridge-slot-dynamic:hover .cartridge-dynamic {
            transform: translateY(-45px);
        }
        .cartridge-label-dynamic {
            width: 85%;
            height: 50%;
            background: white;
            border: 2px solid #2f3542;
            margin-top: 5px;
            font-size: 7px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-family: 'Press Start 2P', cursive;
        }
        .cartridge-grip-dynamic {
            width: 70%;
            height: 12px;
            margin-top: 8px;
            background: repeating-linear-gradient(to bottom, transparent, transparent 2px, #2f3542 2px, #2f3542 4px);
            opacity: 0.3;
        }
        .cartridge-modal-dynamic {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f1f2f6;
            border: 8px solid #2f3542;
            border-radius: 20px;
            padding: 20px;
            z-index: 10001;
            display: none;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .cartridge-modal-dynamic.active { display: block; }
        .cartridge-overlay-dynamic {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: none;
        }
        .cartridge-overlay-dynamic.active { display: block; }
        .cartridge-options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        .cartridge-opt {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            padding: 10px;
            border-radius: 10px;
            transition: background 0.2s;
        }
        .cartridge-opt:hover { background: rgba(0,0,0,0.05); }
        .cartridge-opt .cartridge-dynamic { transform: translateY(0); width: 100px; height: 80px; }
        .v-green-dyn { background: #2ecc71 !important; }
        .v-blue-dyn { background: #3498db !important; }
        
        #team-mode-content {
            width: 100%;
            height: 100%;
            background: var(--pkm-screen-inner);
            display: flex;
            flex-direction: column;
            padding: 10px;
            box-sizing: border-box;
            color: var(--pkm-border);
            font-family: 'Press Start 2P', cursive;
            position: relative;
            overflow: hidden;
        }

        .team-header {
            background-color: var(--pkm-red);
            border: 3px solid var(--pkm-border);
            border-radius: 8px;
            padding: 6px;
            margin-bottom: 10px;
            text-align: center;
        }

        .team-header h1 {
            color: white;
            font-size: 10px;
            margin: 0;
            text-transform: uppercase;
        }

        .team-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 8px;
            flex-grow: 1;
        }

        .team-slot {
            background: white;
            border: 3px solid var(--pkm-border);
            display: flex;
            cursor: pointer;
            transition: all 0.1s;
            position: relative;
            padding: 4px;
            box-shadow: 0 3px 0 rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .team-slot:hover {
            background: var(--pkm-yellow);
            transform: translateY(-1px);
        }

        .team-slot:not(.filled) {
            justify-content: center;
            align-items: center;
            border-style: dashed;
        }

        .team-slot:not(.filled)::after {
            content: "+";
            font-size: 20px;
            color: var(--pkm-border);
            opacity: 0.5;
        }

        .slot-left {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2px;
        }

        .slot-left img {
            width: 100px;
            height: 100px;
            image-rendering: pixelated;
            object-fit: contain;
        }

        .slot-left p {
            font-size: 10px;
            margin-top: 6px;
            text-transform: uppercase;
            text-align: center;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .slot-right {
            display: none;
        }

        .stat-row {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }

        .stat-label {
            font-size: 4px;
            text-transform: uppercase;
        }

        .stat-bar-container {
            width: 100%;
            height: 4px;
            background: #dfe4ea;
            border: 1px solid var(--pkm-border);
        }

        .stat-bar-fill {
            height: 100%;
            background: #2ecc71;
        }

        .remove-btn {
            position: absolute;
            top: 0;
            right: 0;
            background: var(--pkm-red);
            color: white;
            border-left: 2px solid var(--pkm-border);
            border-bottom: 2px solid var(--pkm-border);
            width: 12px;
            height: 12px;
            font-size: 6px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 2;
        }

        /* POPUP DE SÉLECTION */
        #selection-popup {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: var(--pkm-screen-inner);
            z-index: 100;
            display: none;
            flex-direction: column;
            padding: 8px;
            box-sizing: border-box;
            border: 4px solid var(--pkm-border);
        }

        #selection-popup.active { display: flex; }

        .popup-search-bar {
            display: flex;
            gap: 4px;
            margin-bottom: 8px;
        }

        .popup-input {
            flex-grow: 1;
            border: 2px solid var(--pkm-border);
            padding: 4px;
            font-family: 'Press Start 2P', cursive;
            font-size: 7px;
            outline: none;
        }

        .popup-close {
            background: var(--pkm-red);
            color: white;
            border: 2px solid var(--pkm-border);
            padding: 4px;
            font-size: 7px;
            cursor: pointer;
        }

        .popup-results {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 6px;
            flex-grow: 1;
        }

        .result-item {
            background: white;
            border: 2px solid var(--pkm-border);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 2px;
            transition: background 0.1s;
        }

        .result-item:hover { background: var(--pkm-yellow); }
        .result-item img { width: 50px; height: 50px; object-fit: contain; }
        .result-item p { font-size: 8px; margin-top: 4px; text-transform: uppercase; text-align: center; }
    `;
    document.head.appendChild(style);

    // 2. Création du HTML de la fente de cartouche
    const consoleElem = document.querySelector('.pokedex-console');
    if (!consoleElem) return;

    const slot = document.createElement('div');
    slot.className = 'cartridge-slot-dynamic';
    slot.innerHTML = `
        <div class="cartridge-dynamic" id="active-cart-dyn">
            <div class="cartridge-label-dynamic" style="background:#55efc4; color:white;">POKEDEX</div>
            <div class="cartridge-grip-dynamic"></div>
        </div>
    `;
    consoleElem.appendChild(slot);

    const overlay = document.createElement('div');
    overlay.className = 'cartridge-overlay-dynamic';
    document.body.appendChild(overlay);

    const modal = document.createElement('div');
    modal.className = 'cartridge-modal-dynamic';
    modal.innerHTML = `
        <h2 style="font-family: 'Press Start 2P'; font-size: 14px; margin-bottom: 20px; text-align: center;">CHOISIR VERSION</h2>
        <div class="cartridge-options-grid">
            <div class="cartridge-opt" data-ver="vert">
                <div class="cartridge-dynamic v-green-dyn">
                    <div class="cartridge-label-dynamic" style="background:#55efc4; color:white;">POKEDEX</div>
                    <div class="cartridge-grip-dynamic"></div>
                </div>
                <p style="font-family: 'Press Start 2P'; font-size: 8px; margin-top: 10px;">POKEDEX</p>
            </div>
            <div class="cartridge-opt" data-ver="bleu">
                <div class="cartridge-dynamic v-blue-dyn">
                    <div class="cartridge-label-dynamic" style="background:#74b9ff; color:white;">EQUIPE</div>
                    <div class="cartridge-grip-dynamic"></div>
                </div>
                <p style="font-family: 'Press Start 2P'; font-size: 8px; margin-top: 10px;">EQUIPE</p>
            </div>
        </div>
        <button id="close-cart-dyn" style="margin-top: 20px; width: 100%; padding: 10px; font-family: 'Press Start 2P'; font-size: 10px; cursor: pointer; background: #2f3542; color: white; border: none; border-radius: 5px;">FERMER</button>
    `;
    document.body.appendChild(modal);

    // 3. Logique de changement de cartouche
    const openModal = () => {
        modal.classList.add('active');
        overlay.classList.add('active');
    };
    const closeModal = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
    };

    slot.addEventListener('click', openModal);
    overlay.addEventListener('click', closeModal);
    document.getElementById('close-cart-dyn')?.addEventListener('click', closeModal);

    const activeCart = document.getElementById('active-cart-dyn');
    const screenDisplay = document.querySelector('.pixel-screen-display');

    let currentSlotIndex: number | null = null;

    const renderTeamMode = () => {
        if (!screenDisplay) return;
        const team = getTeam();
        
        screenDisplay.innerHTML = `
            <div id="team-mode-content">
                <div class="team-header">
                    <h1>VOTRE ÉQUIPE</h1>
                </div>
                <div class="team-grid">
                    ${team.map((pkm: any, index: number) => `
                        <div class="team-slot ${pkm ? 'filled' : ''}" data-index="${index}">
                            ${pkm ? `
                                <div class="remove-btn" data-index="${index}">X</div>
                                <div class="slot-left">
                                    <img src="${pkm.image}" alt="${pkm.name}">
                                    <p>${pkm.name}</p>
                                </div>

                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <!-- POPUP DE SÉLECTION -->
                <div id="selection-popup">
                    <div class="popup-search-bar">
                        <input type="text" class="popup-input" placeholder="NOM DU POKEMON...">
                        <button class="popup-close">X</button>
                    </div>
                    <div class="popup-results">
                        <div style="grid-column: span 3; display: flex; align-items: center; justify-content: center; font-size: 6px; color: #7f8c8d;">
                            TAPEZ POUR RECHERCHER
                        </div>
                    </div>
                </div>
            </div>
        `;

        const popup = document.getElementById('selection-popup');
        const popupInput = popup?.querySelector('.popup-input') as HTMLInputElement;
        const popupResults = popup?.querySelector('.popup-results');
        const popupClose = popup?.querySelector('.popup-close');

        popupClose?.addEventListener('click', () => {
            popup?.classList.remove('active');
        });

        let searchTimeout: any;
        popupInput?.addEventListener('input', async () => {
            clearTimeout(searchTimeout);
            const query = popupInput.value.toLowerCase().trim();
            
            if (query.length < 2) return;

            searchTimeout = setTimeout(async () => {
                if (popupResults) popupResults.innerHTML = '<div style="grid-column: span 3; text-align: center; font-size: 6px;">RECHERCHE...</div>';
                
                const allPkm = await chercherTousLesNoms();
                const filtered = allPkm.filter((p: any) => p.name.includes(query)).slice(0, 9);

                if (popupResults) {
                    if (filtered.length === 0) {
                        popupResults.innerHTML = '<div style="grid-column: span 3; text-align: center; font-size: 6px;">AUCUN RÉSULTAT</div>';
                        return;
                    }

                    popupResults.innerHTML = '';
                    for (const p of filtered) {
                        const details = await chercherDetails(p.url);
                        const item = document.createElement('div');
                        item.className = 'result-item';
                        item.innerHTML = `
                            <img src="${details.sprites.front_default}" alt="${p.name}">
                            <p>${p.name}</p>
                        `;
                        item.addEventListener('click', () => {
                            if (currentSlotIndex !== null) {
                                const team = getTeam();
                                team[currentSlotIndex] = {
                                    name: p.name,
                                    image: details.sprites.front_default,
                                    stats: details.stats
                                };
                                saveTeam(team);
                                popup?.classList.remove('active');
                                renderTeamMode();
                            }
                        });
                        popupResults.appendChild(item);
                    }
                }
            }, 500);
        });

        document.querySelectorAll('.team-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).classList.contains('remove-btn')) return;
                
                currentSlotIndex = parseInt(slot.getAttribute('data-index') || '0');
                popup?.classList.add('active');
                popupInput?.focus();
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index') || '0');
                const team = getTeam();
                team[index] = null;
                saveTeam(team);
                renderTeamMode();
            });
        });
    };

    document.querySelectorAll('.cartridge-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            const ver = opt.getAttribute('data-ver');
            if (activeCart && screenDisplay) {
                const label = activeCart.querySelector('.cartridge-label-dynamic') as HTMLElement;
                activeCart.className = 'cartridge-dynamic';
                
                if (ver === 'vert') {
                    activeCart.classList.add('v-green-dyn');
                    label.textContent = 'POKEDEX';
                    label.style.background = '#55efc4';
                    screenDisplay.innerHTML = '<ul id="pokemon-list" class="grid-10-pixels"></ul>';
                    window.dispatchEvent(new CustomEvent('pokedex-reload'));
                } else {
                    activeCart.classList.add('v-blue-dyn');
                    label.textContent = 'EQUIPE';
                    label.style.background = '#74b9ff';
                    renderTeamMode();
                }
            }
            closeModal();
        });
    });
}
