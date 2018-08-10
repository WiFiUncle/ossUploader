
# ossUploader #
阿里云OSS 对象云存储上传控件(仿*百度webuploader*) 
# 预览效果图 #
![gif](https://github.com/WiFiUncle/ossUploader/blob/master/%E9%A2%84%E8%A7%88%E5%9B%BE/oss%E4%B8%8A%E4%BC%A0.gif)
![gif](https://github.com/WiFiUncle/ossUploader/blob/master/%E9%A2%84%E8%A7%88%E5%9B%BE/oss%E4%B8%8A%E4%BC%A03.png)

# 使用说明 #
### 1. 首先在oss控制台中，开好跨域，(见预览图文件夹中跨域图片)详情见https://help.aliyun.com/document_detail/31870.html?spm=5176.8466029.cors-info-block.1.2ef2e958WLFFqQ
### 2. 本工程需要启动服务，不能直接file://这样子访问！！！！
### 3. 找后台要获取配置信息的接口，
   ```
   var applyTokenDo = function (func) {
       var url = appServer;// 请求后台获取授权地址url
       return $.ajax({
         url: url
       }).then(function (result) {
         var creds = result; //拿到相关信息，新建个client
         var client = new OSS({
           region: region,
           accessKeyId: creds.AccessKeyId,
           accessKeySecret: creds.AccessKeySecret,
           stsToken: creds.SecurityToken,
           bucket: bucket
         });
         return func(client);
       });
     };
   ```
   若暂无后台，前端自己调测上传功能，则见4，
### 4. 在代码中配置好bucket、region、accessKeyId、accessKeySecret。(仅限前端自己做测试)，
### 然后就可以上传啦！！
### 有问题，加群或者提issues

# 功能 #
- [x] 上传多个文件
- [x] 继续添加功能
- [x] 图片预览
- [ ] 文件MD5值计算
- [ ] ···


### 百度 webuploader ### 
https://github.com/fex-team/webuploader

#### 阿里云oss ### 
https://github.com/ali-sdk/ali-oss

群名称：ossUploader
群   号：516425821 (加群请备注，不然直接忽略。。。)

