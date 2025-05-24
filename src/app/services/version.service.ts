import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VersionService {
  version = '';

  constructor(private http: HttpClient) {}

  async loadVersion() {
    this.version = await firstValueFrom(this.http.get('assets/version.txt', { responseType: 'text' }));
  }
}
