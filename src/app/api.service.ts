import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private actividadesUrl = 'https://apiresources-production-ba1f.up.railway.app/api/actividades';
  private videosUrl = 'https://apiresources-production-ba1f.up.railway.app/api/videos';
  private librosUrl='https://apiresources-production-ba1f.up.railway.app/api/libros';
  private userUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getActividades(): Observable<any> {
    return this.http.get<any>(this.actividadesUrl);
  }

  getVideos(): Observable<any> {
    return this.http.get<any>(this.videosUrl);
  }

  getLibros(): Observable<any>{
    return this.http.get<any>(this.librosUrl);
  }
  /*---------------MARIA------------------------*/
  postUsers(userData: any): Observable<any> {
    return this.http.post(`${this.userUrl}/users`, userData);
  }

  postUsersLogin(userData: any): Observable<any> {
    return this.http.post(`${this.userUrl}/login`, userData);
  }
  /*--------------------------------------------*/
}
