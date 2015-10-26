angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $cordovaToast, $cordovaFile, $cordovaDevice, $cordovaFileTransfer) {
  document.addEventListener('deviceready', function () {    
    $cordovaFile.getFreeDiskSpace()
      .then(function (success) {
        if (success >= 5000) {
          if($cordovaDevice.getPlatform() === "Android") {
            $cordovaFile.checkDir(cordova.file.externalRootDirectory, "recording")
            .then(function (success) {
              $cordovaFile.createFile(cordova.file.externalRootDirectory, "recording/prueba.amr", true)
                .then(function (success) {
                }, function (error) {
              });              
            }, function (error) {
              $cordovaFile.createDir(cordova.file.externalRootDirectory, "recording", false)
                .then(function (success) {
                  $cordovaFile.createFile(cordova.file.externalRootDirectory, "recording/prueba.amr", true)
                    .then(function (success) {
                    }, function (error) {
                    });
                }, function (error) {
                });
            });
          } else {
            $cordovaFile.checkDir(cordova.file.documentsDirectory, "recording")
            .then(function (success) {
              $cordovaFile.createFile(cordova.file.documentsDirectory, "recording/prueba.amr", true)
                .then(function (success) {
                }, function (error) {
              });              
            }, function (error) {
              $cordovaFile.createDir(cordova.file.documentsDirectory, "recording", false)
                .then(function (success) {
                  $cordovaFile.createFile(cordova.file.documentsDirectory, "recording/prueba.amr", true)
                    .then(function (success) {
                    }, function (error) {
                    });
                }, function (error) {
                });
            });
          }
        } else {
          $cordovaToast
            .show('Espacio insuficiente, necesita al menos 5 MB', 'long', 'center');
        }        
      }, function (error) {
      });
    
   //subir archivo
    $scope.upload = function() {
      var server = "http://localhost:8080/upload/amr";
      var fileURL = cordova.file.externalRootDirectory+"recording/prueba.amr";      
      var options = {};
      options.fileKey = "audio";
      options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
      options.mimeType = "multipart/form-data";
      $cordovaFile.checkFile(cordova.file.externalRootDirectory, "recording/prueba.amr")
      .then(function (success) {
        // success
        $cordovaFileTransfer.upload(server, fileURL, options)
        .then(function(result) {
          // Success!
          console.dir(result);
          $cordovaToast
            .show(result.response, 'long', 'center');
        }, function(err) {
          // Error
          console.dir(err);
        }, function (progress) {
          // constant progress updates
          console.dir(progress);
        });
      }, function (error) {
        console.dir(error);
        $cordovaToast
            .show('archivo no existe', 'long', 'center');
      });
    };  
  });
  
})
  .controller('recordCtrl', function($scope, $timeout, $cordovaDevice, $cordovaFile, $cordovaMedia) {
  document.addEventListener('deviceready', function () {
  //TIEMPO::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    function empezar() {
      emp=new Date(); //fecha inicial (en el momento de pulsar)
      elcrono=setInterval(tiempo,10); //poner en marcha el temporizador.
      marcha=1; //indicamos que se ha puesto en marcha.
    }
    
    
    //función del temporizador	
    function tiempo() { 
      actual=new Date(); //fecha a cada instante	
      //tiempo del crono (cro) = fecha instante (actual) - fecha inicial (emp)	
      cro=actual-emp; //milisegundos transcurridos.	
      cr=new Date(); //pasamos el num. de milisegundos a objeto fecha.	
      cr.setTime(cro); 
      //obtener los distintos formatos de la fecha:	
      cs=cr.getMilliseconds(); //milisegundos 	
      cs=cs/10; //paso a centésimas de segundo.	
      cs=Math.round(cs); //redondear las centésimas	
      sg=cr.getSeconds(); //segundos 	
      mn=cr.getMinutes(); //minutos 	
      ho=cr.getHours()-1; //horas 	
      //poner siempre 2 cifras en los números			 
      if (cs<10) {cs="0"+cs;} 
      if (sg<10) {sg="0"+sg;} 
      if (mn<10) {mn="0"+mn;} 
      //llevar resultado al visor.			 
      document.getElementById('duracion').innerHTML="Duración: "+(mn - 30)+" min. "+sg+" seg.";
      $scope.duracion = "Duración: "+sg+" "+cs;
    }
    
    
    //parar el cronómetro
    function parar() { 
      clearInterval(elcrono); //parar el crono
      marcha=0; //indicar que está parado.
    }
//TIEPO:::::::::::::::::::::::::::::::::::::::::::::
    
    function fail(e) {
        console.log("FileSystem Error");
        console.dir(e);
    }

    function gotFile(fileEntry) {
        fileEntry.file(function(file) {
            document.getElementById('resultado').innerHTML = 'Peso del archivo: ' + Math.round(file.size / 1024) + ' KB';
        });
    }  
    var src = "recording/prueba.amr";
    var media;
    function getMedia(reset) {
      if (media === undefined || media.media === undefined) {
        media =  $cordovaMedia.newMedia(src);
      }
      if (reset) {
        media._duration = -1;
        media._position = -1;
      }
      return media;
    }

    $scope.play = function() {
      document.getElementById('resultado').innerHTML = 'reproduciendo ...';
      getMedia().play();
    };
    $scope.record = function() {
      if($cordovaDevice.getPlatform() === "Android") {
        $cordovaFile.createFile(cordova.file.externalRootDirectory, "recording/prueba.amr", true)
      } else {
        $cordovaFile.createFile(cordova.file.documentsDirectory, "recording/prueba.amr", true)
      }
      document.getElementById('resultado').innerHTML = 'Grabando ...';
      getMedia().stopRecord();
      getMedia().stop();
      getMedia().release();

      getMedia(true).startRecord();
      empezar();
    };
    $scope.stop = function() {
      document.getElementById('resultado').innerHTML = 'detenido';
      
      getMedia().stopRecord();
      getMedia().stop();
      getMedia().release();
      window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + "recording/prueba.amr", gotFile, fail);
      parar();
    };

    $scope.pause = function() {
      getMedia().pause();
    };     
  });  
  })

  .controller('pictureCtrl', function($scope, $cordovaCamera ) {
    document.addEventListener("deviceready", function () {
      
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 300,
        targetHeight: 500,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
      
      $scope.getPhoto = function() {
        $cordovaCamera.getPicture(options).then(function(imageData) {
          $scope.lastPhoto = "data:image/jpeg;base64," + imageData;
        }, function(err) {
          console.log('getPicture',err);
        });
      }
    })

  });
