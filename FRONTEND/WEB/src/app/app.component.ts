import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ChatComponent } from './shared/components/chat/chat.component';

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
}
