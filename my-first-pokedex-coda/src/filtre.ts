const initFilterMenu = () => {
    // 1. Création de la structure avec le titre et le trait (hr)
    const sidebar = document.createElement('div');
    sidebar.id = 'filterSidebar';
    sidebar.className = 'filter-sidebar';
    sidebar.innerHTML = `
        <h2 style="text-align:left; font-family: sans-serif; margin-bottom: 5px;">Filtres</h2>
        <hr>
        <p style="font-family: sans-serif; font-size: 14px; margin-bottom: 10px;">Éléments :</p>
        <div class="elements-grid" id="elementsGrid"></div>
    `;

    const burgerContainer = document.createElement('div');
    burgerContainer.className = 'burger-menu-container';
    burgerContainer.id = 'burgerToggle';
    burgerContainer.innerHTML = `
        <div class="burger-icon">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    document.body.appendChild(sidebar);
    document.body.appendChild(burgerContainer);

    const grid = document.getElementById('elementsGrid');

    // 2. Génération des 18 boutons "Élément"
    if (grid) {
        for (let i = 1; i <= 18; i++) {
            const btn = document.createElement('button');
            btn.className = 'element-btn';
            btn.type = 'button';
            btn.textContent = 'Élément';
            
            // Logique de bouton On/Off (Toggle)
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
                
                // Vérification de l'état pour ton futur code
                const isSelected = btn.classList.contains('selected');
                console.log(`Élément ${i} est ${isSelected ? 'activé' : 'désactivé'}`);
            });

            grid.appendChild(btn);
        }
    }

    // 3. Gestion de l'ouverture du menu
    const burgerBtn = document.getElementById('burgerToggle');
    const burgerIcon = burgerBtn?.querySelector('.burger-icon');

    burgerBtn?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        burgerIcon?.classList.toggle('open');
    });
};

// Lancement propre
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilterMenu);
} else {
    initFilterMenu();
}