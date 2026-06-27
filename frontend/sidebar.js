(function() {
  const token   = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (!token || !usuario) { window.location.href = 'login.html'; return; }

  const esAdmin      = usuario.rol === 'Admin';
  const paginaActual = window.location.pathname.split('/').pop() || 'dashboard.html';

  if (['usuarios.html'].includes(paginaActual) && !esAdmin) {
    window.location.href = 'dashboard.html'; return;
  }

  const navAdmin = esAdmin ? `
    <div class="nav-label">Administración</div>
    <a href="usuarios.html" class="${paginaActual === 'usuarios.html' ? 'active' : ''}" onclick="cerrarSidebar()">
      <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
      Usuarios
    </a>` : '';

  const cosechasLink = esAdmin ? `
    <a href="cosechas.html" class="${paginaActual === 'cosechas.html' ? 'active' : ''}" onclick="cerrarSidebar()">
      <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
      Cosechas
    </a>` : '';

  // Insertar estilos del sidebar
  const style = document.createElement('style');
  style.textContent = `
    :root { --sidebar-w: 240px; }
    .sidebar { width:var(--sidebar-w); background:#085041; display:flex; flex-direction:column; position:fixed; top:0; left:0; height:100vh; z-index:200; transition:transform .28s cubic-bezier(.4,0,.2,1); }
    .sidebar-brand { padding:1.4rem 1.2rem 1rem; border-bottom:1px solid rgba(255,255,255,.1); }
    .sidebar-brand .icon { width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:.6rem; }
    .sidebar-brand .icon svg { width:20px;height:20px;fill:#fff; }
    .sidebar-brand h2 { color:#fff;font-size:.95rem;font-weight:700; }
    .sidebar-brand p  { color:rgba(255,255,255,.5);font-size:.72rem;margin-top:.1rem; }
    .nav { flex:1;padding:.75rem 0;overflow-y:auto; }
    .nav-label { color:rgba(255,255,255,.35);font-size:.67rem;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:.9rem 1.2rem .3rem; }
    .nav a { display:flex;align-items:center;gap:.65rem;padding:.55rem 1.2rem;color:rgba(255,255,255,.7);text-decoration:none;font-size:.875rem;border-left:3px solid transparent;transition:background .15s; }
    .nav a:hover { background:rgba(255,255,255,.07);color:#fff; }
    .nav a.active { background:rgba(255,255,255,.12);color:#fff;border-left-color:#5DCAA5; }
    .nav a svg { width:18px;height:18px;flex-shrink:0; }
    .sidebar-footer { padding:.9rem 1.2rem;border-top:1px solid rgba(255,255,255,.1); }
    .user-info { display:flex;align-items:center;gap:.6rem; }
    .sb-avatar { width:32px;height:32px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.8rem;font-weight:700;flex-shrink:0; }
    .user-info .info { flex:1;min-width:0; }
    .user-info .name { color:#fff;font-size:.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .user-info .role { color:rgba(255,255,255,.45);font-size:.7rem; }
    .btn-logout { background:none;border:none;cursor:pointer;color:rgba(255,255,255,.45);padding:4px;display:flex;align-items:center; }
    .btn-logout:hover { color:#fff; }
    .btn-logout svg { width:16px;height:16px; }

    /* HAMBURGUESA */
    .hamburger { display:none;position:fixed;top:.75rem;left:.75rem;z-index:300;background:#085041;border:none;border-radius:8px;padding:.5rem;cursor:pointer;color:#fff; }
    .hamburger svg { width:22px;height:22px;display:block; }
    .sidebar-overlay { display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:199; }

    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .hamburger { display:flex; }
      .sidebar-overlay.show { display:block; }
      .main { margin-left: 0 !important; }
      .topbar { padding-left: 3.5rem !important; }
    }
  `;
  document.head.appendChild(style);

  const container = document.getElementById('sidebar-container');
  if (container) {
    container.innerHTML = `
      <button class="hamburger" id="hamburgerBtn" onclick="toggleSidebar()">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="sidebar-overlay" id="sidebarOverlay" onclick="cerrarSidebar()"></div>
      <aside class="sidebar" id="mainSidebar">
        <div class="sidebar-brand">
          <div class="icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.6 2.8 1.6 3.8C5.8 12 5 13.9 5 16c0 3.3 2.7 6 6 6 1.8 0 3.4-.8 4.5-2 .6.1 1.3.2 2 .2 1.7 0 3.2-.5 4.5-1.4l-1.4-1.4c-.9.6-2 .9-3.1.9-.3 0-.6 0-.9-.1C17.5 17.4 18 16.2 18 15c0-2.2-1.4-4.1-3.4-4.8C15.4 9.3 16 8.2 16 7c0-2.8-1.8-5-4-5zm0 2c1.1 0 2 1.3 2 3s-.9 3-2 3-2-1.3-2-3 .9-3 2-3zm0 8c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z"/></svg></div>
          <h2>Sistema Cosecha</h2>
          <p>Proyección</p>
        </div>
        <nav class="nav">
          <div class="nav-label">Principal</div>
          <a href="dashboard.html" class="${paginaActual === 'dashboard.html' ? 'active' : ''}" onclick="cerrarSidebar()">
            <svg fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Inicio
          </a>
          ${cosechasLink}
          ${navAdmin}
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="sb-avatar">${(usuario.nombre||'A')[0].toUpperCase()}</div>
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
  }

  window._usuario     = usuario;
  window._esAdmin     = esAdmin;
  window._token       = token;
  window._authHeader  = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

  window.toggleSidebar  = () => {
    document.getElementById('mainSidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('show');
  };
  window.cerrarSidebar  = () => {
    document.getElementById('mainSidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('show');
  };
})();