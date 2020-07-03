import { Component, OnInit, Input } from '@angular/core';
import { AttachmentResponce, BugzillaService } from 'src/app/services/bugzilla.service';
import { FileHelperService } from 'src/app/services/file-helper.service';

@Component({
  selector: 'app-detail-attachment',
  templateUrl: './detail-attachment.component.html',
  styleUrls: ['./detail-attachment.component.scss']
})
export class DetailAttachmentComponent implements OnInit {
  @Input() id: number;
  @Input() bugData;
  loading: boolean;

  constructor( private bugzilla: BugzillaService, private filehelper: FileHelperService) { }

  ngOnInit(): void {
  }

  download_attachment(id: number) {
    this.loading = true;
    this.bugzilla.get_attachment(id).subscribe((attachmentsResponce: AttachmentResponce) => {
      let data = attachmentsResponce.attachments[id]["data"]
      let type = attachmentsResponce.attachments[id]["content_type"]
      let name = attachmentsResponce.attachments[id]["file_name"]
      this.filehelper.download_file_by_base64(data, type, name);
      this.loading = false;
    })
  }

}
