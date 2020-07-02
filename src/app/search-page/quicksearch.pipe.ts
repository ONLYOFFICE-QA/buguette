import { Pipe, PipeTransform } from '@angular/core';
import { Bug } from '../models/bug';
import { Subject } from 'rxjs';

@Pipe({
  name: 'quicksearch'
})
export class QuicksearchPipe implements PipeTransform {

  transform(value: Bug[], quicksearch: string, currentCount$: number): unknown {
    if (!quicksearch) {
      return value;
    } else {
      quicksearch = quicksearch.toLowerCase();
      let result = value.filter(bug => bug.summary.toLowerCase().indexOf(quicksearch) !== -1)
      // currentCount$.next(value.length - result.length);
      return result;
    }
  }

}
