import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  name = signal('');
  email = signal('');
  message = signal('');
  messageSent = signal(false);

  sendMessage() {
    if (this.name() && this.email() && this.message()) {
      const whatsappMessage = `Contact Form Submission:\nName: ${this.name()}\nEmail: ${this.email()}\nMessage: ${this.message()}`;
      const whatsappUrl = `https://wa.me/94707003722?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      
      this.messageSent.set(true);
      this.name.set('');
      this.email.set('');
      this.message.set('');
      
      setTimeout(() => this.messageSent.set(false), 3000);
    }
  }
}