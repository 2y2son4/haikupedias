import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  onMarkdownReady(): void {
    setTimeout(() => {
      const container = document.querySelector('.project-container');
      if (!container) return;
      container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        if (!heading.id) {
          heading.id = this.slugify(heading.textContent ?? '');
        }
      });
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  handleAnchorClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    event.preventDefault();
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}
