import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Photo } from './photo';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) { }

  private async getLocation() {
    const location = await Geolocation.getCurrentPosition();
    return location.coords;
  }

  async takePhoto() {
    const { latitude, longitude } = await this.getLocation();
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100
    });

    await this.savePhoto(cameraPhoto.dataUrl, latitude, longitude);
  }

  /**
   *
   * Primeiro, criamos um aleatório namepara nossa foto e usamos o
   * putString método da storagevariável para fazer o upload para o
   * armazenamento do Firebase. Assim que o upload for concluído,
   * obteremos um URL para download usando o getDownloadURLmétodo,
   * que pode ser usado para acessar essa foto. Finalmente, usamos o
   * addmétodo para adicionar um novo Photoobjeto na collection
   * propriedade da firestorevariável. Utilizamos a collection
   * propriedade porque queremos trabalhar com uma lista de fotos
   * em nosso aplicativo.
   *
   * A firestore variável tbcontém uma doc propriedade que pode ser
   * usada quando queremos trabalhar com objetos únicos.
   * A collection propriedade mantém internamente uma lista de
   * doc objetos.
   */

  private async savePhoto(dataUrl: string, latitude: number, longitude: number) {
    const name = new Date().getUTCMilliseconds().toString();
    const upload = await this.storage.ref(name).putString(dataUrl, 'data_url');
    const photUrl = await upload.ref.getDownloadURL();

    await this.firestore.collection<Photo>('photos').add({
      url: photUrl,
      lat: latitude,
      lng: longitude
    });
  }

}
