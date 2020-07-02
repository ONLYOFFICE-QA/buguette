import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileHelperService {

  constructor() { }

  public base64ToBlob(b64Data: string, contentType = '', sliceSize = 512) {
    b64Data = b64Data.replace(/\s/g, ''); //IE compatibility...
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  download_file_by_base64(data: string, type: string, name: string) {
    var blob = this.base64ToBlob(data, type);
    var link = document.createElement("a");
    var url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = name;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
