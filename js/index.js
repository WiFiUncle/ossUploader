/**
 * Created By WiFi ON 2017/11/25 16:31
 * github: https://github.com/WiFiUncle/ossUploader
 */


'use strict';
//(function(w) {
/**
 * 以上四个参数，是从后台获取的。bucket和region可以写在前台，但为了以后方便管理，建议统一从后台获取。
 * 后面两个千万不能写在js中!
 * **/
  var bucket = 'wifi-uncle'; //前端做测试上传，先自己写死。工程中，这些找后台拿
  var region = 'oss-cn-shenzhen'; //同上
  var accessKeyId = '***************'; //同上
  var accessKeySecret = '***************'; //同上

  /**
  *  上传文件对象
  *  fileStats: 文件统计
   * filePath: 上传文件的地址，
   *
   * * */
  var uploader = {
      fileList: [],
      fileStats: {
          totalFilesNum: 0,
          totalFilesSize: 0,
          uploadFinishedFilesNum: 0,
          curFileSize: 0,
      },
      filePath: "test/"
  }; //上传实例对象
  var Buffer = OSS.Buffer;
  var OSS = OSS.Wrapper;
  var STS = OSS.STS;

  //新建一个client
  //前端自己上传到oss，不经过后台拿相关信息。只做测试，工程中不能这样！
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
/**
 * 方法二:
 * 实际生产中，用这个。
 * 先往后台获取授权，再生成client
 */

/*var applyTokenDo = function (func) {
    var url = appServer;// 请求后台获取授权地址url
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
  /**
   *  前端自己测试用，
   *  不用请求后台授权，直接写死数据。
  * */
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
  /**
   *  TODO 下载OSS中文件的流程:
   *  1. 创建个client对象
   *  2. 获取该文件的路径，须带文件名，也就是下面的object。
   *  3. 该文件的文件名
   *  4. 获取到这三个参数后，直接用client调singnatureURL方法，如下：
   *
   * */
  var downloadFile = function () {
    var client = applyTokenDo();
    var object = 'obj/1.jpg'; //测试数据，自行删除
    var filename = '1.jpg'; //测试数据，自行删除
    console.log(object + ' => ' + filename);
    var result = client.signatureUrl(object, {
      response: { //这里为啥会有response，具体看官方文档。
        'content-disposition': 'attachment; filename="' + filename + '"'
      }
    });
    window.location = result; //这里是直接下载文件
    return result; //返回url
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
      $("#chooseFile, #addBtn").click(function () {
        $('#js-file').off('change').on('change', function (e) {
            var files = e.target.files;
            var curIndex = uploader.fileList.length; //插件中已有的文件长度，追加
            var length = files.length;
            var file = null;
            $('#uploader .placeholder').hide();
            $("#statusBar").show();
            for (var i = 0; i < length; i++) {
                file = files[i];
                uploader.fileList[curIndex + i] = file;
                file.id = uploader.fileList[curIndex + i].id = "WU_LI_" + (curIndex + i + 1); //给每个文件加id
                uploader.fileStats.totalFilesSize += file.size; //统计文件大小
                _this.addFile(file); //添加到控件视图中
            }
            uploader.fileStats.totalFilesNum = uploader.fileList.length;
        });
        setTimeout(function () {
            $('#js-file').click();
        }, 0);
        return false;
      });
      $("#startUpload").click(function () {
        var length = uploader.fileStats.totalFilesNum;
        var filePath = uploader.filePath;//可以自行调整上传位置
        var file;
        for(var i = 0; i < length; i++) {
          file = uploader.fileList[i];
            _this.uploadFile(file, filePath);
        }

      });
      $(".queueList .filelist").delegate('li span.cancel', 'click', function () {
        var $this = $(this);
        var $li = $this.parent().parent();
        var id = $li.attr('id');
        var list = uploader.fileList;
        var len = list.length;
        for(var i = 0; i < len; i ++) {
          if(uploader.fileList[i].id == id) {
            uploader.fileList.splice(i, 1); //从文件列表中删除文件
            break ;
          }
        }
        $li.remove();
      });
    },
      /***
       *  上传文件
       * @param file 需要上传的文件
       * @param filePath 上传文件到哪个位置。按官方说法就是key
       * oss是对象存储, 没有path路径概念，不过个人认为这个可以当作路径比较好理解
       */
    uploadFile: function (file, filePath) {
      var client;
      var total = 0;
          filePath += file.name;
      client = applyTokenDo();
          client.multipartUpload(filePath, file, {
            progress: progress
          })
          .then(function (res) {
            $("#" + file.id).children(".success-span").addClass("success");
            uploader.fileStats.uploadFinishedFilesNum ++; //已成功上传数 + 1/
            uploader.fileStats.curFileSize += file.size; //当前已上传的文件大小
              /**
               * 这里有个一个问题:
               *  这是在成功回调中计算文件的大小，并不是实时的。
               *  举个栗子，你上传一个100M文件，得等到它全部上传完成后，你才知道它上传完，中间进度你并不知道。
               *  上面那个上传的process 中貌似是[0,1], 还得计算当前文件的大小乘以当前进度算出这个文件已经上传了多少。
               *
               */
            progressBar = (uploader.fileStats.curFileSize / uploader.fileStats.totalFilesSize).toFixed(2) * 100 + '%';

            if(total == uploader.fileStats.totalFilesNum) {
              console.log("upload success!");
              $("#startUpload").text('上传完成');
            }
            $totalProgressbar.css('width', progressBar)
                  .html(progressBar);
          });
    },

      /**
       * TODO 当有文件添加进来时执行，负责view的创建
       * 百度webuploader界面的
       */

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
  $("#dl-button").click(function() {
    downloadFile();
  });
});











