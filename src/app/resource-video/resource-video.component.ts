import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ResourceMenuComponent } from '../resource-menu/resource-menu.component';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoListModel, VideoModel } from '../models/video.model';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { ColeccionesComponent } from '../colecciones/colecciones.component';
//import { VideosService } from '../services/recursos.services';


@Component({
  selector: 'app-resource-video',
  standalone: true,
  imports: [RouterLink, ResourceVideoComponent, ResourceMenuComponent, CommonModule, FormsModule,MatDialogModule],
  templateUrl: './resource-video.component.html',
  styleUrl: './resource-video.component.css'
})
export class ResourceVideoComponent implements OnInit {

  @Output() nivelLoaded: EventEmitter<string> = new EventEmitter<string>();
  @Input() mostrarVideos: boolean = false;
  @Input() materiaId: number | undefined;
  @Input() nivel: string | undefined;
  @Input() materia: string | undefined;

  videos: VideoModel[] = [];
  videosMostrados: VideoModel[] = [];
  videosPaginados: VideoModel[] = [];
  filtroBusqueda: string = '';
  sanitizedUrls: { [key: string]: SafeResourceUrl } = {};

  videosPorPagina: number = 5;
  paginaActualVideos: number = 1;

  constructor(private apiService: ApiService, private http: HttpClient, private sanitizer: DomSanitizer,public dialog: MatDialog) { }

  ngOnInit(): void {
    this.fetchVideos();
  }

  fetchVideos(): void {
    this.apiService.getVideos().subscribe(
      (response: VideoModel[]) => {
        console.log('Response from API:', response);
        this.videos = response.filter(video => video.materia_id === this.materiaId);
        this.sanitizeUrls();
        this.videosMostrados = this.videos;
        this.actualizarVideosPaginados();
        if (this.videos.length === 0) {
          console.log('No se encontraron videos para este materia_id.');
        } else {
          const firstVideo = this.videos[0];
          this.nivel = firstVideo.nivel;
          this.materia = firstVideo.materia;
        }
      },
      error => {
        if (!error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          console.error('Error al recuperar los videos:', error.message);
        }
      }
    );
  }

  private sanitizeUrls() {
    this.videos.forEach(video => {
      this.sanitizedUrls[video.video_id] = this.sanitizer.bypassSecurityTrustResourceUrl(video.url);
    });
}

getSafeUrl(url: string): SafeResourceUrl | undefined {
    const videoId = this.videos.find(video => video.url === url)?.video_id;
    return videoId ? this.sanitizedUrls[videoId] : undefined;
}

isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/');
}

isMp4Url(url: string): boolean {
    return url.endsWith('.mp4');
}

getFullVideoUrl(url: string): string {
    return `http://localhost:3000${url}`;
}


  /*fetchVideos(): void {
    this.apiService.getVideos().subscribe(
      (response: VideoModel[]) => {
        console.log('Response from API:', response);
        this.videos = response.filter(video => video.materia_id === this.materiaId);
        this.sanitizeUrls();
        this.videosMostrados = this.videos;
        this.actualizarVideosPaginados();
        if (this.videos.length === 0) {
          console.log('No se encontraron videos para este materia_id.');
        } else {
          const firstVideo = this.videos[0];
          this.nivel = firstVideo.nivel;
          this.materia = firstVideo.materia;
        }
      },
      error => {
        if (!error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          console.error('Error al recuperar los videos:', error.message);
        }
        //console.error('Error al recuperar los videos:', error.message);
      }
    );
  }

  private sanitizeUrls() {
    this.videos.forEach(video => {
      this.sanitizedUrls[video.video_id] = this.sanitizer.bypassSecurityTrustResourceUrl(video.url);
    });
  }

  getSafeUrl(video_id: number): SafeResourceUrl | undefined {
    return this.sanitizedUrls[video_id];
  }*/

  scrollToTop(): void {
    //window.scrollTo({ top: 50, behavior: 'smooth' });
    const offset = 290;
    const halfWindowHeight = window.innerHeight / 2;
    const scrollToPosition = halfWindowHeight + offset;
    window.scrollTo({ top: scrollToPosition, behavior: 'smooth' });
  }

  filtrarRecursos(): void {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    if (filtro === '') {
      this.restablecerRecursos();
    } else {
      this.videosMostrados = this.filtrarPorTituloYDescripcion(this.videos, filtro);
      this.actualizarVideosPaginados();
    }

    this.paginaActualVideos = 1;
  }

  private filtrarPorTituloYDescripcion(recursos: any[], filtro: string): any[] {
    return recursos.filter(recurso => {
      const titulo = recurso.titulo ? recurso.titulo.toLowerCase() : '';
      const descripcion = recurso.descripcion ? recurso.descripcion.toLowerCase() : '';
      return titulo.includes(filtro) || descripcion.includes(filtro);
    });
  }

  private actualizarVideosPaginados() {
    const startIndex = (this.paginaActualVideos - 1) * this.videosPorPagina;
    this.videosPaginados = this.videosMostrados.slice(startIndex, startIndex + this.videosPorPagina);
  }

  get numeroTotalPaginasVideos(): number {
    return Math.ceil(this.videosMostrados.length / this.videosPorPagina);
  }

  paginaAnteriorVideos() {
    if (this.paginaActualVideos > 1) {
      this.paginaActualVideos--;
      this.actualizarVideosPaginados();
    }
  }

  paginaSiguienteVideos() {
    if (this.paginaActualVideos * this.videosPorPagina < this.videosMostrados.length) {
      this.paginaActualVideos++;
      this.actualizarVideosPaginados();
    }
  }

  restablecerRecursos(): void {
    this.videosMostrados = this.videos.slice();
    this.actualizarVideosPaginados();
  }

  openDialog(event: Event) {
    event.preventDefault();
    const dialogRef = this.dialog.open(ColeccionesComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
