import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {VideoConversionService} from "./video-conversion.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ffmpeg-wasm-test';

  constructor(
    public videoConversionService: VideoConversionService) {
    this.videoConversionService.loadFFmpeg().catch();
  }

  loadAudio(): void {
    this.videoConversionService.convert().catch();
  }
}
