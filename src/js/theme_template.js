(function () {
  [GLOW_SOURCE]
  const chromeStyles = [CHROME_STYLES_JSON];
  const scriptUrl = document.currentScript.src;
  const stateUrl = new URL('./gloria-state.json', scriptUrl);
  let settings = { enabled: false };
  let stopped = false;
  let refreshing = false;
  let frame;
  let workbench;
  const themeObserver = new MutationObserver(scheduleRender);

  function usingGloria() {
    return workbench && Array.from(workbench.classList).some(name =>
      /(?:^|-)gloria-color-theme-json$/i.test(name));
  }

  function clearStyles() {
    document.getElementById('gloria-theme-styles')?.remove();
  }

  function render() {
    frame = undefined;
    const currentWorkbench = document.querySelector('.monaco-workbench');
    if (currentWorkbench !== workbench) {
      themeObserver.disconnect();
      workbench = currentWorkbench;
      if (workbench) themeObserver.observe(workbench, { attributes: true, attributeFilter: ['class'] });
    }
    if (stopped || !settings.enabled || !usingGloria()) {
      clearStyles();
      return;
    }

    const rules = [];
    if (!settings.disableGlow && settings.brightness !== 0) {
      for (const element of document.querySelectorAll('.vscode-tokens-styles')) {
        // Add shadows only; native token and selection colors retain precedence.
        const pattern = /([^{}]+)\{([^{}]*)\}/g;
        let match;
        while ((match = pattern.exec(element.textContent))) {
          const color = /(?:^|;)\s*color:\s*#(fdfdfd|ff0000|ff0001|1e90ff)\s*(?:;|$)/i.exec(match[2]);
          if (!color) continue;
          const selectors = match[1].split(',').map(selector => `.monaco-workbench ${selector.trim()}`).join(',');
          rules.push(`${selectors}{text-shadow:${glowShadow(color[1].toLowerCase(), settings)};backface-visibility:hidden;}`);
        }
      }
    }
    const extraRules = [];
    if (settings.editorBackground && /^#[0-9a-f]{6,8}$/i.test(settings.editorBackground)) {
      extraRules.push(`.monaco-editor { background-color: ${settings.editorBackground} !important; }`);
    }
    if (settings.gutterBackground && /^#[0-9a-f]{6,8}$/i.test(settings.gutterBackground)) {
      extraRules.push(`.monaco-editor .margin { background: ${settings.gutterBackground} !important; background-color: ${settings.gutterBackground} !important; }`);
    }
    const extra = extraRules.length ? '\n' + extraRules.join('\n') : '';
    const css = rules.join('\n') + '\n' + chromeStyles + extra;
    let style = document.getElementById('gloria-theme-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'gloria-theme-styles';
      document.head.appendChild(style);
    }
    if (style.textContent !== css) style.textContent = css;
  }

  function scheduleRender() {
    if (!stopped && frame === undefined) frame = requestAnimationFrame(render);
  }

  async function refreshSettings() {
    if (stopped || document.hidden || refreshing) return;
    refreshing = true;
    let nextSettings;
    try {
      // Local workbench resource: no server or external network service.
      stateUrl.searchParams.set('t', Date.now());
      const response = await fetch(stateUrl.href, { cache: 'no-store' });
      if (!response.ok) {
        nextSettings = { enabled: false };
      } else {
        const state = await response.json();
        nextSettings = {
          ...normalizeGlowSettings(state),
          enabled: state.enabled === true,
          ...(state.editorBackground ? { editorBackground: state.editorBackground } : {}),
          ...(state.gutterBackground ? { gutterBackground: state.gutterBackground } : {})
        };
      }
    } catch {
      nextSettings = { enabled: false };
    } finally {
      refreshing = false;
    }
    if (!stopped && JSON.stringify(nextSettings) !== JSON.stringify(settings)) {
      settings = nextSettings;
      scheduleRender();
    }
  }

  const tokenObserver = new MutationObserver(mutations => {
    if (mutations.some(mutation => {
      const target = mutation.target.nodeType === 3 ? mutation.target.parentElement : mutation.target;
      return target?.id !== 'gloria-theme-styles';
    })) scheduleRender();
  });
  tokenObserver.observe(document.head, { childList: true, characterData: true, subtree: true });
  const bodyObserver = new MutationObserver(scheduleRender);
  bodyObserver.observe(document.body, { childList: true });
  const interval = setInterval(refreshSettings, 1000);
  document.addEventListener('visibilitychange', refreshSettings);
  window.addEventListener('beforeunload', () => {
    stopped = true;
    clearInterval(interval);
    if (frame !== undefined) cancelAnimationFrame(frame);
    tokenObserver.disconnect();
    themeObserver.disconnect();
    bodyObserver.disconnect();
    document.removeEventListener('visibilitychange', refreshSettings);
    clearStyles();
  }, { once: true });
  render();
  refreshSettings();
})();
