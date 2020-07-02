import { Pipe, PipeTransform } from '@angular/core';
import { Bug } from '../models/bug';

@Pipe({
  name: 'quicksearch'
})
export class QuicksearchPipe implements PipeTransform {

  transform(value: Bug[], quicksearch: string): unknown {
    if (!quicksearch) {
      return value;
    } else {
      quicksearch = quicksearch.toLowerCase();
      let result = value.filter(bug => bug.summary.toLowerCase().indexOf(quicksearch) !== -1)
      return result;
    }
  }

}
