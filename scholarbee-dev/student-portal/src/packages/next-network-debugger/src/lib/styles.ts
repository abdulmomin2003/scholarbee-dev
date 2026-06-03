export const DEBUGGER_CSS = `
  .nnd-root *, .nnd-root *::before, .nnd-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .nnd-root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #e2e8f0;
  }

  .nnd-fab {
    position: fixed;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background: #0f172a;
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.2);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
    cursor: pointer;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background 0.2s;
  }

  .nnd-fab:hover {
    transform: translateY(-2px);
    background: #1e293b;
    border-color: #38bdf8;
  }

  .nnd-dot {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
    animation: nnd-pulse 2s infinite;
  }

  @keyframes nnd-pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }

  .nnd-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99998;
    animation: nnd-fade-in 0.2s ease-out;
  }

  .nnd-drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 700px;
    max-width: 100vw;
    background: #020617;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 24px rgba(0,0,0,0.5);
    border-left: 1px solid rgba(255,255,255,0.05);
  }

  .nnd-left { left: 0; border-left: none; border-right: 1px solid rgba(255,255,255,0.05); animation: nnd-slide-in-left 0.3s ease-out; }
  .nnd-right { right: 0; animation: nnd-slide-in-right 0.3s ease-out; }

  @keyframes nnd-slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes nnd-slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes nnd-fade-in { from { opacity: 0; } to { opacity: 1; } }

  .nnd-header {
    padding: 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(16px);
  }

  .nnd-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    background: #020617;
  }

  .nnd-row { display: flex; align-items: center; }
  .nnd-row-between { display: flex; align-items: center; justify-content: space-between; width: 100%; }

  .nnd-title { font-size: 18px; font-weight: 700; color: #f8fafc; }
  .nnd-subtitle { font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.1em; }

  .nnd-icon-btn {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
  }

  .nnd-icon-btn:hover { background: rgba(255,255,255,0.05); color: #f8fafc; }
  .nnd-danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

  .nnd-tabs {
    display: flex;
    gap: 4px;
    background: #0f172a;
    padding: 4px;
    border-radius: 10px;
  }

  .nnd-tab {
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .nnd-tab.active {
    background: var(--nnd-tab-bg, #1e293b);
    color: var(--nnd-tab-color, white);
  }

  .nnd-badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 800;
  }

  .nnd-log {
    border-radius: 12px;
    margin-bottom: 8px;
    border: 1px solid rgba(255,255,255,0.04);
    background: #0f172a;
    overflow: hidden;
    transition: border-color 0.2s, background 0.2s;
  }

  .nnd-log:hover {
    border-color: rgba(56, 189, 248, 0.3);
    background: #11192d;
  }

  .nnd-log-header {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .nnd-log-status { display: flex; flex-direction: column; min-width: 50px; }
  .nnd-log-status-code { font-weight: 900; font-size: 13px; line-height: 1; }
  .nnd-log-status-ms { font-size: 9px; font-weight: 800; color: #475569; margin-top: 2px; }

  .nnd-log-url {
    font-size: 13px;
    font-weight: 600;
    color: #f1f5f9;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nnd-log-expand {
    color: #334155;
    transition: transform 0.2s;
  }

  .nnd-log-expand.open { transform: rotate(180deg); }

  .nnd-log-details {
    padding: 20px;
    background: #020617;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .nnd-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }

  .nnd-separator {
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  .nnd-url-display { color: #38bdf8; font-size: 12px; word-break: break-all; }
  .nnd-page-display { color: #94a3b8; font-size: 12px; word-break: break-all; }

  .nnd-section-label {
    color: #475569;
    font-weight: 900;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .nnd-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .nnd-section-icon-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nnd-section-box {
    padding: 12px;
    border-radius: 8px;
    background: rgba(255,255,255,0.01);
    border: 1px solid rgba(255,255,255,0.03);
    max-height: 400px;
    overflow-y: auto;
  }

  .nnd-error-box {
    padding: 16px;
    background: rgba(244, 63, 94, 0.03);
    border: 1px solid rgba(244, 63, 94, 0.2);
    border-radius: 10px;
  }

  .nnd-error-title { color: #f43f5e; font-size: 12px; font-weight: 700; margin-bottom: 4px; }

  .nnd-json-toggle {
    display: inline-flex;
    align-items: center;
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background 0.1s;
    gap: 4px;
  }

  .nnd-json-toggle:hover { background: rgba(255,255,255,0.05); }

  .nnd-json-summary { color: #e2e8f0; font-size: 12px; }
  .nnd-json-key { color: #818cf8; font-weight: 600; }
  .nnd-json-string { color: #34d399; }
  .nnd-json-number { color: #fbbf24; }
  .nnd-json-boolean { color: #f472b6; }
  .nnd-json-null { color: #94a3b8; font-style: italic; }

  .nnd-json-children { border-left: 1px dashed rgba(255,255,255,0.1); margin-left: 8px; padding-left: 12px; }
  .nnd-size-hint { font-size: 10px; color: #475569; margin-left: 6px; font-weight: 500; }

  .nnd-source-btn {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent;
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nnd-source-btn.active {
    background: rgba(56, 189, 248, 0.1);
    color: #38bdf8;
    border-color: #38bdf8;
  }

  .nnd-search-container {
    margin-bottom: 12px;
    position: relative;
  }

  .nnd-search-input {
    width: 100%;
    background: #1e293b;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    padding: 8px 12px 8px 36px;
    color: white;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
  }

  .nnd-search-input:focus { border-color: #4f46e5; }

  .nnd-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
  }

  .nnd-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #475569;
    gap: 16px;
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
`;
