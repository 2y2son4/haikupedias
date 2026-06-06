import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
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
  }

  closeMenu() {
    this.menuOpen = false;
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
