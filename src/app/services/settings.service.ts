import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './bugzilla.service';

export interface SettingsInterface {
  comment_and_creator?: boolean;
  autoload_images?: boolean;
  hidden_products?: string[];
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

  public autoload_images_change(status: boolean): void {
    let _settings: SettingsInterface = this.get_settings_from_storage();
    _settings.autoload_images = status
    this.save_settings_from_storage(_settings);
  }

  public product_visibility_change(product: Product): void {
    let _settings: SettingsInterface = this.get_settings_from_storage();
    if (!_settings.hidden_products) {
      _settings.hidden_products = [product.realName];
    } else if (_settings.hidden_products.indexOf(product.realName) >= 0) {
      _settings.hidden_products = _settings.hidden_products.filter(productName => productName !== product.realName)
    } else {
      _settings.hidden_products.push(product.realName);
    }
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
