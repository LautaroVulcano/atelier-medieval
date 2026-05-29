import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);

  protected menuOpen = false;
  protected isScrolled = false;

  protected get isCoursePage(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return window.location.pathname.replace(/\/$/, '') === '/curso-lenceria';
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 16;
    }
  }

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.syncBodyMenuState();
  }

  protected closeMenuFromNav(event: MouseEvent): void {
    if (event.target instanceof HTMLAnchorElement) {
      this.menuOpen = false;
      this.syncBodyMenuState();
    }
  }

  private syncBodyMenuState(): void {
    const body = this.document.body;

    if (this.menuOpen) {
      this.renderer.addClass(body, 'menu-open');
      return;
    }

    this.renderer.removeClass(body, 'menu-open');
  }
}
