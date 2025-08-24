import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  type: 'sent' | 'received';
}

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './chat.component.html',
  // styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked {
  messages: ChatMessage[] = [];
  inputMessage: string = '';

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  sendMessage() {
    const text = this.inputMessage.trim();
    if (!text) return;

    this.messages.push({ text, type: 'sent' });
    this.inputMessage = '';

    // Simulate a received reply after 1 second
    setTimeout(() => {
      this.messages.push({ text: 'Received: ' + text, type: 'received' });
    }, 1000);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }
}
