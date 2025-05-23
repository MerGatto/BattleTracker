import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  constructor(private modalService: NgbModal) {}

  confirm(
    message: string,
    title = 'Confirm',
    confirmText = 'Yes',
    cancelText = 'No'
  ): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.confirmText = confirmText;
    modalRef.componentInstance.cancelText = cancelText;

    return modalRef.result.then(
      (result) => !!result,
      () => false
    );
  }
}
