'use strict';
//(function(w) {
  var bucket = '';
  var region = '';
  var accessKeyId = '';
  var accessKeySecret = '';
  var uploader = {
    fileList: ''
  }; //上传实例对象
  var Buffer = OSS.Buffer;
  var OSS = OSS.Wrapper;
  var STS = OSS.STS;
  var totalFilesNum = 0;
  var totalFilesSize = 0;
  var client = new OSS({
    region: region,
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    bucket: bucket
  });
  var progressBar = 0;
  var progress = '';
  var $wrap = $('#uploader'),
          // 图片容器
      $queue = $( '<ul class="filelist"></ul>' ).appendTo( $wrap.find( '.queueList' ) ),
      $totalProgressbar = $("#totalProgressBar");

/*  var applyTokenDo = function (func) {
    var url = appServer;
    return $.ajax({
      url: url
    }).then(function (result) {
      var creds = result;
      var client = new OSS({
        region: region,
        accessKeyId: creds.AccessKeyId,
        accessKeySecret: creds.AccessKeySecret,
        stsToken: creds.SecurityToken,
        bucket: bucket
      });

      return func(client);
    });
  };*/

  var applyTokenDo = function () {
    return client;
  };
  var progress = function (p) { //p百分比 0~1
    return function (done) { 
      progressBar = (p * 100).toFixed(2) + '%';
      $totalProgressbar.css('width', progressBar)
                      .html(progressBar);
      done();
    }
  };
  function OssUpload() {
    var _this = this;
    _this.init = function () {
      _this.initPage();
      _this.bindEvent();
    };
    _this.initPage = function (){
      $("#statusBar").hide();
    };
  }
  OssUpload.prototype = {
    constructor: OssUpload,
    // 绑定事件
    bindEvent: function () {
      var _this = this;
      $("#chooseFile").click(function () {
        $('#js-file').off('change').on('change', function (e) {
            var files = uploader.fileList = e.target.files;
            var length = files.length;
            var file = null;
            $('#uploader .placeholder').hide();
            $("#statusBar").show();
            for (var i = 0; i < length; i++) {
                file = files[i];
                file.id = uploader.fileList[i].id = "WU_LI_" + (i + 1);
                _this.addFile(file); //添加到控件视图中
            }
        });
        setTimeout(function () {
            $('#js-file').click();
        }, 0);

        return false;
      });
      $("#startUpload").click(function () {
        _this.uploadFile();
      });
    },    
    // TODO 
    uploadFile: function () {
      var _this = this;
      var fileList = uploader.fileList;
      var length = totalFilesNum = fileList.length;
      var file, key;
      var client;
      var total = 0;
      var curFileSize = 0;
      for(var i = 0; i < length; i ++) {
        totalFilesSize += fileList[i].size;
      };
      console.log(totalFilesSize);
      for(var i = 0; i < length; i ++) {
        file = fileList[i];
        key = '/obj/' + file.name; //oss是对象存储, 没有path路径概念，不过个人认为这个可以当作路径比较好理解
        //console.log(file.name + ' => ' + key);
        client = applyTokenDo(); 
        (function (file){
          client.multipartUpload(key, file, {
            progress: progress
          })
          .then(function (res) {
           // console.log('upload success: %j', res);
            $("#" + file.id).children(".success-span").addClass("success");
            total ++;
            curFileSize += file.size;
            progressBar = (curFileSize/totalFilesSize).toFixed(2) * 100 + '%';            
            if(total == totalFilesNum) {
              console.log("upload success!");
              $("#startUpload").text('上传完成');
              $totalProgressbar.css('width', progressBar)
                              .html(progressBar);
            }
          });
        })(file);    
      }
    },

    // 当有文件添加进来时执行，负责view的创建
    addFile: function ( file ) {
      var $li = $( '<li id="' + file.id + '">' +
              '<p class="title">' + file.name + '</p>' +
              '<p class="imgWrap"></p>'+
              '<p class="progress"><span></span></p><span class="success-span"></span>' +
              '</li>' ),

          $btns = $('<div class="file-panel">' +
              '<span class="cancel">删除</span>' +
              '</div>').appendTo( $li ),
          $prgress = $li.find('p.progress span'),
          $wrap = $li.find( 'p.imgWrap' ),
          $info = $('<p class="error"></p>');
          var imageType = /^image\//;
          if ( imageType.test(file.type) ) {
              var img = document.createElement("img");
              img.classList.add("obj");
              img.file = file;
              img.style.width = "100%";
              img.style.height = "100%";
              $wrap.empty().append($(img));
              var reader = new FileReader();
              reader.onload = (function(aImg) {
                return function(e) {
                  aImg.src = e.target.result;
                };
              })(img);
              reader.readAsDataURL(file);
          }
      $li.appendTo( $queue );
    },
  }
  //w.OssUpload = OssUpload;
//})(window)
var ossUpload = '';
$(function() {
  ossUpload = new OssUpload();
  ossUpload.init();
});











