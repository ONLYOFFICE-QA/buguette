import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { AttachmentResponce, BugzillaService } from 'src/app/services/bugzilla.service';
import { FileHelperService } from 'src/app/services/file-helper.service';
import { Comment } from '../../models/comment';

@Component({
  selector: 'app-detail-attachment',
  templateUrl: './detail-attachment.component.html',
  styleUrls: ['./detail-attachment.component.scss']
})
export class DetailAttachmentComponent implements OnInit, OnChanges {
  @Input() id: number;
  @Input() bugData: Comment;
  @Input() imageAutoload: boolean;
  loading: boolean;
  images = {};

  constructor(private bugzilla: BugzillaService,
              private filehelper: FileHelperService) { }

  ngOnInit(): void {}

  ngOnChanges(changes: { id: SimpleChange, bugData: SimpleChange, imageAutoload: SimpleChange }) {
    if (this.bugData?.attachmentIsImage && changes.imageAutoload?.currentValue) {
      if (!this.images[this.bugData.attachmentId]) {
        this.images = {};
        this.download_image(this.bugData.attachmentId);
      }
    }
  }

  download_attachment(id: number): void {
    this.loading = true;
    this.bugzilla.get_attachment(id).subscribe((attachmentsResponce: AttachmentResponce) => {
      const data = attachmentsResponce.attachments[id].data;
      const type = attachmentsResponce.attachments[id].content_type;
      const name = attachmentsResponce.attachments[id].file_name;
      this.filehelper.download_file_by_base64(data, type, name);
      this.loading = false;
    });
  }

  download_image(id: number) {
    this.bugzilla.get_attachment(id).subscribe(result => {
      if (result.attachments[id].content_type.indexOf('image') >= 0) {
        this.images[id] = this.bugzilla.sanitizer_data(result.attachments[id]);
      }
    });
  }
}
