class ComponentStyler {
  container: HTMLElement;

  constructor(container?: HTMLElement) {
    this.container = container || document.createElement('div');
    this.init();
  }

  init(): void {
    this.container.querySelector('.editor-close-btn')?.addEventListener('click', () => {
      const drawer = this.container.querySelector('.editor-drawer') as HTMLElement
      if (drawer) {
        drawer.style.right = '-100vw';
        setTimeout(() => drawer.remove(), 300);
      }
    });
  }

  render(): void {
    // Código de renderização
  }
}


// Exportar DEPOIS da declaração da classe
export const componentStyler = new ComponentStyler();
export const COMPONENT_CSS = `...`;