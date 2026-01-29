import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./componnents/header/header";
import { Footer } from "./componnents/footer/footer";

@Component({
  selector: 'app-root',
  imports: [ Header, Footer, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-project');
}
