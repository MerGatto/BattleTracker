import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  constructor(
    private modalService: NgbModal,
    private translateService: TranslateService

  ) { }

  confirm(
    message: string,
    title = 'Confirm',
    confirmText = 'Yes',
    cancelText = 'No',
    translate = true
  ): Promise<boolean> {
    if (translate) {
      title = this.translateService.instant(title);
      confirmText = this.translateService.instant(confirmText);
      cancelText = this.translateService.instant(cancelText);
      message = this.translateService.instant(message);
    }
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

  simpleConfirm(
    message: string,
  ): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent);
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.title = this.translateService.instant("Confirm");
    modalRef.componentInstance.confirmText = this.translateService.instant("Yes");
    modalRef.componentInstance.cancelText = this.translateService.instant("No");

    return modalRef.result.then(
      (result) => !!result,
      () => false
    );
  }
}
