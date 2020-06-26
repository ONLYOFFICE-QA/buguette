import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SettingsInterface {
  comment_and_creator?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public settingsData$: BehaviorSubject<SettingsInterface> = new BehaviorSubject({});
  constructor() {
    this.settingsData$.next(this.get_settings_from_storage());
  }

  public comment_and_creator_change(status: boolean): void {
    let _settings: SettingsInterface = this.get_settings_from_storage();
    _settings.comment_and_creator = status
    this.save_settings_from_storage(_settings);
  }

  private get_settings_from_storage(): SettingsInterface {
    const settings = localStorage.getItem('settings')
    if (!settings) {
      return {};
    }
    return JSON.parse(settings);
  }

  private save_settings_from_storage(settings: SettingsInterface): void {
    localStorage.setItem('settings', JSON.stringify(settings));
    this.settingsData$.next(settings);
  }
}
