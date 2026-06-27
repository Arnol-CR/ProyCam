// ============================================================
//  sidebar.js — Sidebar compartido + control de permisos
// ============================================================
(function() {
  const token   = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (!token || !usuario) {
    window.location.href = 'login.html';
    return;
  }

  const esAdmin = usuario.rol === 'Admin';
  const paginaActual = window.location.pathname.split('/').pop();

  // Redirigir si no es Admin e intenta entrar a páginas restringidas
  const soloAdmin = ['usuarios.html'];
  if (soloAdmin.includes(paginaActual) && !esAdmin) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Inyectar sidebar en el elemento #sidebar-container
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const navAdmin = esAdmin ? `
    <div class="nav-label">Administración</div>
    <a href="usuarios.html" class="${paginaActual === 'usuarios.html' ? 'active' : ''}">
      <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
      Usuarios
    </a>` : '';

  const botonNuevaCosecha = (esAdmin && paginaActual === 'cosechas.html')
    ? `<button class="btn-primary" onclick="abrirModal()">
         <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
         Nueva cosecha
       </button>`
    : '';

  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="icon">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.6 2.8 1.6 3.8C5.8 12 5 13.9 5 16c0 3.3 2.7 6 6 6 1.8 0 3.4-.8 4.5-2 .6.1 1.3.2 2 .2 1.7 0 3.2-.5 4.5-1.4l-1.4-1.4c-.9.6-2 .9-3.1.9-.3 0-.6 0-.9-.1C17.5 17.4 18 16.2 18 15c0-2.2-1.4-4.1-3.4-4.8C15.4 9.3 16 8.2 16 7c0-2.8-1.8-5-4-5zm0 2c1.1 0 2 1.3 2 3s-.9 3-2 3-2-1.3-2-3 .9-3 2-3zm0 8c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z"/></svg>
        </div>
        <h2>Sistema Cosecha</h2>
        <p>Pronóstico de camarón</p>
      </div>
      <nav class="nav">
        <div class="nav-label">Principal</div>
        <a href="dashboard.html" class="${paginaActual === 'dashboard.html' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Inicio
        </a>
        ${esAdmin ? `<a href="cosechas.html" class="${paginaActual === 'cosechas.html' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
          Cosechas
        </a>` : ''}
        ${navAdmin}
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">${(usuario.nombre || 'A')[0].toUpperCase()}</div>
          <div class="info">
            <div class="name">${usuario.nombre}</div>
            <div class="role">${usuario.rol}</div>
          </div>
          <button class="btn-logout" onclick="localStorage.clear();window.location.href='login.html'" title="Cerrar sesión">
            <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>
  `;

  // Exponer variables globales útiles
  window._usuario = usuario;
  window._esAdmin = esAdmin;
  window._token   = token;
  window._authHeader = () => ({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
})();
