import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingUploadComponent } from './listing-upload/listing-upload.component';
import { ListingEditComponent } from './listing-edit/listing-edit.component';
import { ListingUploadDialogComponent } from './listing-upload/listing-upload-dialog.component';
import { ListingEditRoutingModule } from './listing-edit-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { NgxMaskModule } from 'ngx-mask'
import { RTEditorModule } from '../rich-text-editor/rich-text-editor.module';
import { ConfirmationDialogComponent } from './confirmation/confirmation-dialog.component';

@NgModule({
  declarations: [
    ListingUploadComponent,
    ListingUploadDialogComponent,
    ListingEditComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    ListingEditRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      extend: true
    }),
    NgxMaskModule.forChild(),
    RTEditorModule
  ],
  exports: [
    ListingUploadComponent,
    ListingEditComponent,
    ListingUploadDialogComponent,
    ConfirmationDialogComponent
  ]
})
export class ListingEditModule { }
