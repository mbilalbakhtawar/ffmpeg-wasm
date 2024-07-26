import { Injectable } from '@angular/core';
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { BehaviorSubject } from "rxjs";
import { FFMessageLoadConfig } from "@ffmpeg/ffmpeg/dist/esm/types";

@Injectable({ providedIn: 'root' })
export class VideoConversionService {
  message = new BehaviorSubject('');
  conversionTime = new BehaviorSubject('');
  convertedAudioSrc = new BehaviorSubject('');
  ffmpeg!: FFmpeg;

  conversionInProgress = false;

  async loadFFmpeg() {
    this.ffmpeg = new FFmpeg();
    this.ffmpeg.on('log', ({ message }) => {
      // this.message.next( message)
    });
    const config = await this.getMultiThreadConfig();
    try {
      await this.ffmpeg.load(config);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async getMultiThreadConfig(): Promise<FFMessageLoadConfig> {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    return {
      coreURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        'text/javascript'
      ),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
      classWorkerURL: 'assets/ffmpeg/worker.js'
    };
  }

  async convert() {
    this.convertedAudioSrc.next('');
    if (!this.checkIfFmpegLoaded()) {
      return;
    }
    this.conversionInProgress = true;

    const file = await fetch('assets/unplayable.spx');
    const blob = await file.blob();

    const name = 'input.webm';

    await this.ffmpeg.writeFile(name, await fetchFile(blob));
    const startTime = performance.now();

    await this.ffmpeg.exec([
      '-i',
      name, // Input file
      'output.mp3' // Output file
    ]);
    this.message.next(  'Conversion completed.');

    const endTime = performance.now();
    const diffTime = ((endTime - startTime) / 1000).toFixed(2);
    this.conversionTime.next(  ` ${diffTime} s`);

    const data = (await this.ffmpeg.readFile('output.mp3')) as any;
    this.convertedAudioSrc.next( URL.createObjectURL(
      new Blob([data.buffer], { type: 'audio/mp3' })
    ));
    this.conversionInProgress = false;
  }

  private checkIfFmpegLoaded() {
    if (this.ffmpeg.loaded) {
      this.message.next('FFmpeg is loaded and ready to use.');
      return true;
    } else {
      this.message.next('FFmpeg failed to load.');
      return false;
    }
  }
}
