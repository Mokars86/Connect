export function renderProfileSelectorModal(container, { profiles, activeProfileId, onSelectProfile, onCreateProfile, onClose }) {
  container.innerHTML = `
    <div class="modal-overlay" id="profile-modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title">Select Active Profile</div>
          <button id="btn-close-profile-modal" class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="profile-card-list">
          ${profiles.map(p => `
            <div 
              class="profile-select-card ${p.id === activeProfileId ? 'active' : ''}" 
              data-profile-id="${p.id}">
              <div class="profile-card-info">
                <h4>
                  ${p.type || 'Profile'} Card
                  ${p.id === activeProfileId ? '<span class="sharing-badge">ACTIVE</span>' : ''}
                </h4>
                <p>${p.name || 'Unnamed Card'} (${p.phone || 'No phone'})</p>
                ${p.company ? `<p style="font-size: 11px; opacity: 0.7;">${p.company}</p>` : ''}
              </div>
              <div style="width: 20px; height: 20px; border-radius: 50%; background: ${p.color || '#00C9A7'}; border: 2px solid #FFF; box-shadow: 0 0 4px rgba(0,0,0,0.2);"></div>
            </div>
          `).join('')}

          <button id="btn-add-new-profile" class="btn-secondary-outlined" style="margin-top: 10px;">
            + CREATE NEW PROFILE CARD
          </button>
        </div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('profile-modal-overlay');

  const openModal = () => overlay?.classList.add('active');
  const closeModal = () => {
    overlay?.classList.remove('active');
    if (onClose) onClose();
  };

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.getElementById('btn-close-profile-modal')?.addEventListener('click', closeModal);

  // Profile item selection
  const profileCards = document.querySelectorAll('.profile-select-card');
  profileCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-profile-id');
      onSelectProfile(id);
      closeModal();
    });
  });

  // Create new profile button
  document.getElementById('btn-add-new-profile')?.addEventListener('click', () => {
    closeModal();
    onCreateProfile();
  });

  return { openModal, closeModal };
}
