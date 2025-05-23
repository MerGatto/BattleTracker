import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  imports: [TranslateModule, NgbNavModule],
  providers: [NgbActiveModal],
})
export class ConfirmationDialogComponent {
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Yes';
  @Input() cancelText = 'No';

  constructor(public activeModal: NgbActiveModal) { }
}
