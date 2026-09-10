import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {

  @Input() title = '';

  @Input() subtitle = '';

  @Input() width = '560px';

  @Input() show = false;

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}