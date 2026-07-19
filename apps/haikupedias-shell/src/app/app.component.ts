import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private logoTitleObserver: IntersectionObserver | null = null;
  private navigationSubscription: Subscription | null = null;

  @ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('closeMenuButton')
  private closeMenuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('menuContent') private menuContent?: ElementRef<HTMLElement>;

  menuOpen = false;
  showLogoText = true;

  ngAfterViewInit() {
    this.attachLogoTitleObserver();
    this.navigationSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.attachLogoTitleObserver());
  }

  ngOnDestroy() {
    this.disconnectLogoTitleObserver();
    this.navigationSubscription?.unsubscribe();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;

    if (this.menuOpen) {
      setTimeout(() => this.closeMenuButton?.nativeElement.focus());
      return;
    }

    this.menuButton?.nativeElement.focus();
  }

  closeMenu() {
    if (!this.menuOpen) {
      return;
    }

    this.menuOpen = false;
    this.menuButton?.nativeElement.focus();
  }

  onMenuKeydown(event: KeyboardEvent) {
    if (!this.menuOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
      return;
    }

    if (event.key !== 'Tab' || !this.menuContent) {
      return;
    }

    const focusable =
      this.menuContent.nativeElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private attachLogoTitleObserver() {
    this.disconnectLogoTitleObserver();

    const homeTitle = document.getElementById('home-main-title');

    if (!homeTitle) {
      this.showLogoText = true;
      return;
    }

    this.logoTitleObserver = new IntersectionObserver(
      ([entry]) => {
        this.showLogoText = !entry.isIntersecting;
      },
      {
        threshold: 0.1,
      },
    );

    this.logoTitleObserver.observe(homeTitle);
  }

  private disconnectLogoTitleObserver() {
    this.logoTitleObserver?.disconnect();
    this.logoTitleObserver = null;
  }
}
