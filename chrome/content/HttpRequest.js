//
// HttpRequest Object
//

// constructor
onsip.HttpRequest = function(url, queryVars, responseHandler) {
  this.url = url;
  this.queryVars = queryVars;
  this.responseHandler = responseHandler;
}

// static properties
onsip.HttpRequest.GET = "GET";
onsip.HttpRequest.POST = "POST";

// a list of XMLHttpRequest-creation factory functions to try.
onsip.HttpRequest._factories =  [ function() { return new XMLHttpRequest(); },
                                  function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
                                  function() { return new ActiveXObject("Microsoft.XMLHTTP"); } 
                                ];

// when we find a factory that works, store it here.
onsip.HttpRequest._factory = null;

onsip.HttpRequest.prototype = {
  method: onsip.HttpRequest.GET,
  shouldEscapeVars: false,
  expectingXML: false,
  errorHandler: null,
  progressHandler: null,
  timeoutHandler: null,
  timeout: null,
  timedOut: false
}

// send a request
onsip.HttpRequest.prototype.send = function() {

  var xmlHttpRequest = onsip.HttpRequest.makeXMLHttpRequest();
  var httpRequest = this;

  var timer;

  if (this.timeout) {
    timer = setTimeout(function() {
      httpRequest.timedOut = true;
      xmlHttpRequest.abort();
    }, this.timeout);
  }
  
  var expectingXML = this.expectingXML;
  var responseHandler = this.responseHandler;
  var errorHandler = this.errorHandler;
  var progressHandler = this.progressHandler;
  var timeoutHandler = this.timeoutHandler;

  xmlHttpRequest.onreadystatechange = function() {
    onsip.log("HttpRequest::send onreadystatechange");
    try {
      if (httpRequest.timedOut) {
        if (timeoutHandler)
          timeoutHandler(httpRequest);
        return;
      }
      if (xmlHttpRequest.readyState == 4) {
        onsip.log("HttpRequest::send readystate 4");
        if (timer) clearTimeout(timer);
        if(xmlHttpRequest.status == 200) {
          if(expectingXML)
            responseHandler(httpRequest, xmlHttpRequest.responseXML);
          else
            responseHandler(httpRequest, xmlHttpRequest.responseText);
        }
        else if (errorHandler) {
          errorHandler(httpRequest, xmlHttpRequest.status, xmlHttpRequest.statusText);
        }
      }
      else if (progressHandler) {
        onsip.log("HttpRequest::send readystate " + xmlHttpRequest.readyState);
        progressHandler(httpRequest, xmlHttpRequest.readyState);
      }
      else {
        onsip.log("HttpRequest::send readystate " + xmlHttpRequest.readyState);
      }
    }
    catch(e) {
      if (e instanceof Error) {
        if (errorHandler)
          errorHandler(httpRequest, 400, e.message);
        else
          throw e;
      }
      else {
        if (errorHandler)
          errorHandler(httpRequest, 400, "An exception occured handling a response from the network. Are you disconnected from the network?");
        else
          throw new Error("onsip.HttpRequest::send: An exception occured handling a response from the network.");
      }
    }
  }
  
  var queryString = onsip.HttpRequest._createQueryString(this.queryVars, this.shouldEscapeVars);
  
  if(this.method == onsip.HttpRequest.POST) {
    xmlHttpRequest.open("POST", this.url);
    xmlHttpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
    xmlHttpRequest.send(queryString);
  }
  else if(this.method == onsip.HttpRequest.GET) {
    var target = this.url;
    if(queryString.length)
      target += "?" + queryString;
    xmlHttpRequest.open("GET", target);
    xmlHttpRequest.send(null);
  }
  else {
    throw new Error("onsip.HttpRequest::send: invalid method");
  }
}

// create and return a new XMLHttpRequest object.
onsip.HttpRequest.makeXMLHttpRequest = function() {
  if (onsip.HttpRequest._factory != null) return onsip.HttpRequest._factory();

  for(var i=0; i<onsip.HttpRequest._factories.length; i++) {
    try {
      var factory = onsip.HttpRequest._factories[i];
      var request = factory();
      if (request != null) {
        onsip.HttpRequest._factory = factory;
        return request;
      }
    }
    catch(e) {
      continue;
    }
  }
  
  // if we get here, none of the factory candidates succeeded.
  onsip.HttpRequest._factory = function() {
    throw new Error("onsip.HttpRequest::makeXMLHttpRequest : XMLHttpRequest not supported");
  }
  
  onsip.HttpRequest._factory(); // throw an error
  
  return null; //never reached
}

// create a query string
onsip.HttpRequest._createQueryString = function(vars, shouldEscapeVars) {
  var queryString = "";
  if(!vars)
    return queryString;
  var first = true;
  for( key in vars ) {
    var value = vars[key];
    if (shouldEscapeVars) {
      escapePlusRE =  new RegExp("\\\+");
      value = value.replace(escapePlusRE, "%2B");
    }
    first ? first = false : queryString += '&';
    queryString += key + '=' + value;
  }
  return queryString;
} 
