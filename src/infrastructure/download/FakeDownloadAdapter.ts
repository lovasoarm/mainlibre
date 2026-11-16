import type { DownloadPort } from '../../core/ports/ports';

export interface DownloadRecord {
  filename: string;
  content: string;
  mimeType: string;
}

export class FakeDownloadAdapter implements DownloadPort {
  readonly records: DownloadRecord[] = [];

  save(filename: string, content: string, mimeType: string): void {
    this.records.push({ filename, content, mimeType });
  }
}
