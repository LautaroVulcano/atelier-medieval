import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, inject, NgZone, PLATFORM_ID, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly mediaQuery = isPlatformBrowser(this.platformId)
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  protected menuOpen = false;
  protected isScrolled = false;
  private intersectionObserver?: IntersectionObserver;
  private reducedMotionListener?: () => void;

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

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId) || event.defaultPrevented) {
      return;
    }

    const anchor = (event.target as HTMLElement | null)?.closest('a[href^="#"]') as HTMLAnchorElement | null;

    if (!anchor) {
      return;
    }

    this.scrollToAnchor(event, anchor);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.setupMotion();
    });
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.reducedMotionListener?.();
  }

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.syncBodyMenuState();
  }

  protected closeMenuFromNav(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement | null)?.closest('a');

    if (anchor instanceof HTMLAnchorElement) {
      if (anchor.hash && anchor.getAttribute('href')?.startsWith('#')) {
        this.scrollToAnchor(event, anchor);
        return;
      }

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

  private scrollToAnchor(event: MouseEvent, anchor: HTMLAnchorElement): void {
    const hash = anchor.getAttribute('href');

    if (!hash || hash === '#') {
      return;
    }

    const target = this.document.querySelector(hash);

    if (!target) {
      return;
    }

    event.preventDefault();
    this.menuOpen = false;
    this.syncBodyMenuState();
    window.history.pushState(null, '', hash);
    target.classList.add('is-visible');
    target.closest('section')?.classList.add('is-visible');

    const scrollToTarget = () => {
      const header = this.document.querySelector('.site-header');
      const headerHeight = header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
      const top = window.scrollY + target.getBoundingClientRect().top - headerHeight - 12;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: this.mediaQuery?.matches ? 'auto' : 'smooth',
      });
    };

    setTimeout(scrollToTarget, 40);
    setTimeout(scrollToTarget, 360);
  }

  private setupMotion(): void {
    if (!this.isCoursePage) {
      return;
    }

    const body = this.document.body;
    const root = this.elementRef.nativeElement;
    const reduceMotion = () => this.mediaQuery?.matches ?? false;

    this.renderer.addClass(body, 'course-motion-ready');

    const syncReducedMotion = () => {
      if (reduceMotion()) {
        this.renderer.addClass(body, 'reduce-motion');
        return;
      }

      this.renderer.removeClass(body, 'reduce-motion');
    };

    syncReducedMotion();

    this.mediaQuery?.addEventListener('change', syncReducedMotion);
    this.reducedMotionListener = () => this.mediaQuery?.removeEventListener('change', syncReducedMotion);

    if (reduceMotion()) {
      Array.from(root.querySelectorAll(this.courseMotionSelector()) as NodeListOf<HTMLElement>).forEach((element) => {
        element.classList.add('is-visible');
      });
      return;
    }

    this.setupCourseSectionObserver(root);
  }

  private setupCourseSectionObserver(root: HTMLElement): void {
    const animatedElements = root.querySelectorAll(this.courseMotionSelector()) as NodeListOf<HTMLElement>;

    this.intersectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target as HTMLElement;
        element.classList.add('is-visible');
        observer.unobserve(element);
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.12
    });

    animatedElements.forEach((element) => {
      this.intersectionObserver?.observe(element);

      requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const viewport = window.innerHeight || 1;

        if (rect.top < viewport * 0.88 && rect.bottom > 0) {
          element.classList.add('is-visible');
          this.intersectionObserver?.unobserve(element);
        }
      });
    });
  }

  private courseMotionSelector(): string {
    return [
      '.course-hero',
      '.course-result',
      '.course-for-you',
      '.course-program',
      '.course-method',
      '.course-community',
      '.course-teacher',
      '.course-pricing',
      '.course-faq',
      '.site-footer'
    ].join(',');
  }
}
