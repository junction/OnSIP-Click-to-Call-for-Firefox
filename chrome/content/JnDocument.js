//
// Object Rep of the XML Response Document from the Junction Networks API
//

onsip.JnParameter = function(elementNode) {
  this.elementNode = elementNode;
  var nodeList;
  nodeList = this.elementNode.getElementsByTagName("Name");
  if(nodeList.length)
    this.name = nodeList[0].childNodes[0].nodeValue;
  nodeList = this.elementNode.getElementsByTagName("Value");
  if(nodeList.length)
    this.value = nodeList[0].childNodes[0].nodeValue;
}

onsip.JnError = function(elementNode) {
  this.elementNode = elementNode;
  var nodeList;
  nodeList = this.elementNode.getElementsByTagName("Parameter");
  if(nodeList.length)
    this.parameter = nodeList[0].childNodes[0].nodeValue;
  nodeList = this.elementNode.getElementsByTagName("Code");
  if(nodeList.length)
    this.code = nodeList[0].childNodes[0].nodeValue;
  nodeList = this.elementNode.getElementsByTagName("Message");
  if(nodeList.length)
    this.message = nodeList[0].childNodes[0].nodeValue;
}

onsip.JnAction = function(elementNode) {
  this.elementNode = elementNode;
  for(var i=0; i<this.elementNode.childNodes.length; i++) {
    // skip non-element nodes
    if(this.elementNode.childNodes[i].nodeType != 1) continue;
    switch(this.elementNode.childNodes[i].nodeName) {
    case "IsCompleted":
      if(this.elementNode.childNodes[i].childNodes[0].nodeValue == "true")
        this.isCompleted = true;
      else
        this.isCompleted = false;
      break;
    case "Errors":
      var errorsNode = this.elementNode.childNodes[i];
      var errorNodeList = errorsNode.getElementsByTagName("Error");
      for(var j=0; j<errorNodeList.length; j++)
        this.errors[j] = new onsip.JnError(errorNodeList[j]);
      break;
    default:
      break;
    }
  }
}

onsip.JnRequest = function(elementNode) {
  this.elementNode = elementNode;
  this.parameters = new Array();
  this.errors = new Array();
  for(var i=0; i<this.elementNode.childNodes.length; i++) {
    // skip non-element nodes
    if(this.elementNode.childNodes[i].nodeType != 1) continue;
    switch(this.elementNode.childNodes[i].nodeName) {
    case "IsValid":
      if(this.elementNode.childNodes[i].childNodes[0].nodeValue == "true")
        this.isValid = true;
      else
        this.isValid = false;
      break;
    case "Parameters":
      var parametersNode = this.elementNode.childNodes[i];
      var parameterNodeList = parametersNode.getElementsByTagName("Parameter");
      for(var j=0; j<parameterNodeList.length; j++)
        this.parameters[j] = new onsip.JnParameter(parameterNodeList[j]);
      break;
    case "Errors":
      var errorsNode = this.elementNode.childNodes[i];
      var errorNodeList = errorsNode.getElementsByTagName("Error");
      for(var j=0; j<errorNodeList.length; j++)
        this.errors[j] = new onsip.JnError(errorNodeList[j]);
      break;
    default:
      break;
    }
  }  
}

onsip.JnSession = function(elementNode) {
  this.elementNode = elementNode;
}

onsip.JnContext = function(elementNode) {
  this.elementNode = elementNode;
  for(var i=0; i<this.elementNode.childNodes.length; i++) {
    // skip non-element nodes
    if(this.elementNode.childNodes[i].nodeType != 1) continue;
    switch(this.elementNode.childNodes[i].nodeName) {
    case "Action":
      this.action = new onsip.JnAction(this.elementNode.childNodes[i]);
      break;
    case "Request":
      this.request = new onsip.JnRequest(this.elementNode.childNodes[i]);
      break;
    case "Session":
      this.session = new onsip.JnSession(this.elementNode.childNodes[i]);
      break;
    default:
      break;
    }
  }  
}

onsip.JnFinalResponse = function(elementNode) {
  this.elementNode = elementNode;
  var nodeList;
  nodeList = this.elementNode.getElementsByTagName("Code");
  if(nodeList.length)
    this.code = nodeList[0].childNodes[0].nodeValue;
  nodeList = this.elementNode.getElementsByTagName("Message");
  if(nodeList.length)
    this.message = nodeList[0].childNodes[0].nodeValue;
}

onsip.JnCallSetup = function(elementNode) {
  this.elementNode = elementNode;
  var nodeList;
  nodeList = this.elementNode.getElementsByTagName("FinalResponse");
  if(nodeList.length)
    this.finalResponse = new onsip.JnFinalResponse(nodeList[0]);
}

onsip.JnResult = function(elementNode) {
  this.elementNode = elementNode;
  for(var i=0; i<this.elementNode.childNodes.length; i++) {
    // skip non-element nodes
    if(this.elementNode.childNodes[i].nodeType != 1) continue;
    switch(this.elementNode.childNodes[i].nodeName) {
    case "CallSetup":
      this.resultType = "CallSetup";
      this.callSetup = new onsip.JnCallSetup(this.elementNode.childNodes[i]);
      break;
    default:
      break;
    }
  }  
}

onsip.JnResponse = function(elementNode) {
  this.elementNode = elementNode;
  for(var i=0; i<this.elementNode.childNodes.length; i++) {
    // skip non-element nodes
    if(this.elementNode.childNodes[i].nodeType != 1) continue;
    switch(this.elementNode.childNodes[i].nodeName) {
    case "Context":
      this.context = new onsip.JnContext(this.elementNode.childNodes[i]);
      break;
    case "Result":
      this.result = new onsip.JnResult(this.elementNode.childNodes[i]);
      break;
    default:
      break;
    }
  }  
}

onsip.JnDocument = function(document) {
  this.document = document;
  if(this.document.childNodes[0].nodeName == "Exception") {
    this.isException = true;
    this.exception = this.document.childNodes[0].nodeValue;
  }
  else {
    this.isException = false;
    this.response = new onsip.JnResponse(this.document.childNodes[0]);
  }
}

