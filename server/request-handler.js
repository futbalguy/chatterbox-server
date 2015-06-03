var url = require('url');
var _ = require('underscore')

var storage = [];

var requestHandler = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

  var statusCode;
  var responseData;
  var roomName;

//queryData extracts relevant url path
  var queryData = url.parse(request.url, true);
  var path = decodeURIComponent(queryData.pathname);
  var room = path.slice()

  var pathPrefix = path.slice(0,9);
  if(pathPrefix !== '/classes/'){
    statusCode = 404;
    sendResponse(response, statusCode,responseData);
    return;
  }


  if (path.slice(9) === 'messages') {
    //do what we are already doing
  }
  else {
    roomName = path.slice(9);
  }

  if(request.method === "GET"){
    statusCode = 200
    responseData = handleGet(request, roomName)
  }
  else if (request.method === "POST"){
    statusCode = 201;
    handlePost(request, roomName);
  }
  else if (request.method === "OPTIONS") {
    console.log('!OPTIONS');
    statusCode = 200;
  }

  sendResponse(response, statusCode,responseData);

};

var unescape = function(obj){
  for (var item in obj){
    _.unescape(obj[item]);
  }
  return obj;
};

var sendResponse = function(response, statusCode,responseData) {
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "application/json";

  response.writeHead(statusCode, headers);

  response.end(JSON.stringify({results: responseData}));
}

//helper functions to compile POST data, and to serve back data on GET request
var handlePost = function(request, roomName){
  var postData = '';
  request.on('data', function(item){
    postData += item;
  });

  request.on('end', function(){
    var jsonData = JSON.parse(postData)
    unescape(jsonData);
    jsonData.roomname = _.unescape(roomName);
    storage.push(jsonData);
  })
};

var handleGet = function(request, roomName){
  if (!roomName) return storage
  else{
    roomName = _.unescape(roomName);
    var roomResults = [];
    for (var i=0; i<storage.length; i++){
      if(storage[i].roomname === roomName){
        roomResults.push(storage[i]);
      }
    }
    return roomResults;
  }


};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

//exports to basic-server.js
exports.requestHandler = requestHandler;

