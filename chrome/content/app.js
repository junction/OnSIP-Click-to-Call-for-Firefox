//
// App Object
//

// this is the name of the attribute in the span elements containing
// any numbers we find it stores a "cleaned up" version of the number
// which we can use to setup a call
onsip.App.NUMBER_ATTRIBUTE = "onsip_number";

onsip.App.addObjectEventListener = function (element, eventtype,
                                             listener, captures) {
  element.addEventListener(eventtype,
                           function (event) { listener.handleEvent(event); },
                           captures);
};

onsip.App.prototype = {
  // the URL of the Junction Networks API
  apiUrl: "http://www.jnctn.com/restapi",

  // the value of the Action parameter
  apiAction: "CallSetup",

  animateRequestNode: false,

  start: function () {
    onsip.log("App::start");
    this.initialize();
  },

  stop: function () {
    onsip.log("App::stop");
  },

  initialize: function () {
    onsip.log("App::initialize");

    this.setupOptions();
    this.callSetupInProgress = false;
    this.disabled = onsip.getBooleanPreference("onsip.disabled");
    this.callSetupTimeout = onsip.getIntegerPreference("onsip.call.setup.timeout");
    this.fromAddress = onsip.getStringPreference("onsip.call.setup.from.address");
    this.toDomain = onsip.getStringPreference("onsip.call.setup.to.domain");
    this.appContent = document.getElementById("appcontent");
    this.statusBar = document.getElementById("onsip-panel");
    this.status = document.defaultView.status;
    if (this.disabled) {
      this.statusBar.setAttribute("disabled", "true");
    }
    onsip.App.addObjectEventListener(this.appContent, "load", this, true);
  },

  setupOptions: function () {
    onsip.setBooleanPreferenceIfNotSet("onsip.disabled", false);
    onsip.setIntegerPreferenceIfNotSet("onsip.call.setup.timeout", 30000);
    onsip.setStringPreferenceIfNotSet("onsip.call.setup.from.address",
                                      "you@yourdomain.onsip.com");
    onsip.setStringPreferenceIfNotSet("onsip.call.setup.to.domain",
                                      "yourdomain.onsip.com");
  },

  getDisabled: function () {
    return this.disabled;
  },

  setDisabled: function (disabled) {
    onsip.log("App::setDisabled: " + disabled);
    this.disabled = disabled;
    this.statusBar.setAttribute("disabled", this.disabled);
    onsip.setBooleanPreference("onsip.disabled", this.disabled);
    if (!this.disabled) {
      onsip.App.parseDOM(document.body);
    }
  },

  toggleDisabled: function () {
    this.setDisabled(!this.getDisabled());
  },

  getCallSetupInProgress: function () {
    return this.callSetupInProgress;
  },

  setCallSetupInProgress: function (callSetupInProgress) {
    onsip.log("App::setCallSetupInProgress: " + callSetupInProgress);
    this.callSetupInProgress = callSetupInProgress;
    if (this.callSetupInProgress) {
      this.startCallSetupProgressDisplay();
    } else {
      this.stopCallSetupProgressDisplay();
    }

    if (!this.callSetupInProgress) {
      this.requestNode.ownerDocument.defaultView.status = null;
      this.requestNode.ownerDocument.defaultView.defaultStatus = null;
    }
  },

  setCallSetupInProgressState: function (state) {
    onsip.log("App::setCallSetupInProgressState: " + state);
    switch(state) {
    case 1:
    case 2:
    case 3:
      this.requestNode.ownerDocument.defaultView.defaultStatus = 
        "OnSIP setting up call to " + this.requestNumber + "@" + this.toDomain + "...";
      this.requestNode.ownerDocument.defaultView.status = null;
      break;
    default:
      break;
    }
  },

  startCallSetupProgressDisplay: function () {
    onsip.log("App::startCallSetupProgressDisplay");
    if (this.animateRequestNode) {
      if (this.callSetupProgressDisplayIntervalId) {
        return;
      }

      if (this.requestNode) {
        var node = this.requestNode;
        var on = false;

        this.callSetupProgressDisplayIntervalId = setInterval(function () {
          if (on) {
            node.style.setProperty("border", "solid transparent 1px", "");
          } else {
            node.style.setProperty("border", "solid red 1px", "");
          }

          on = !on;
        }, 100);
      }
    }
    if (this.requestNode) {
      this.requestNode.style.setProperty("cursor", "wait", "");
      onsip.Fat.fade_element(this.requestNode);
    }
  },

  stopCallSetupProgressDisplay: function () {
    onsip.log("App::stopCallSetupProgressDisplay");
    if (this.animateRequestNode) {
      if (this.callSetupProgressDisplayIntervalId) {
        clearInterval(this.callSetupProgressDisplayIntervalId);
        this.callSetupProgressDisplayIntervalId = null;
      }
      if (this.requestNode) {
        this.requestNode.style.removeProperty("border");
      }
    }
    if (this.requestNode) {
      this.requestNode.style.setProperty("cursor", "pointer", "");
    }
  },

  handleEvent: function (event) {
    onsip.log("App::handleEvent: " + event.type);
    switch (event.type) {
    case "load":
      return this.handleLoadEvent(event);
    case "DOMNodeInserted":
      return this.handleNodeInsert(event);
    case "mouseover":
      return this.handleMouseOverEvent(event);
    case "mouseout":
      return this.handleMouseOutEvent(event);
    case "click":
      return this.handleMouseClickEvent(event);
    default:
      return null;
    }
  },

  handleLoadEvent: function (event) {
    onsip.log("App::handleLoadEvent");

    var node = event.originalTarget;
    if (node.nodeName != "#document" || this.getDisabled())  {
      return;
    }
    onsip.App.parseDOM(node.body);
    onsip.App.addObjectEventListener(node, "DOMNodeInserted", this, true);
  },

  handleNodeInsert: function (event) {
    onsip.log("App::handleNodeInsert (enabled)");

    // Turn off updates while we're updating.
    this.handleNodeInsert = function () {
      onsip.log("App::handleNodeInsert (disabled)");
    };

    onsip.log("DEBUG: innerHTML: " + event.relatedNode.innerHTML);
    // Attempt parse after the node has been inserted.
    var elt = this;
    var node = event.relatedNode;
    var oldHandler = arguments.callee;
    setTimeout(function () {
      try {
        onsip.log("DEBUG: node: " + node.innerHTML);
        onsip.App.parseDOM(node);
      } catch (e) {
        onsip.log("ERROR: Parsing updated node: " + e);
      }

      // Restore updates after we've parsed.
      elt.handleNodeInsert = oldHandler;
    }, 10);
  },

  handleMouseOverEvent: function (event) {
    onsip.log("App::handleMouseOverEvent");
    if (this.getDisabled()) {
      return;
    }
    event.target.style.setProperty("color", "blue", "");
    event.target.style.setProperty("border-bottom", "solid blue 1px", "");
    event.target.ownerDocument.defaultView.status = 
      "onsip:" + event.target.getAttribute(onsip.App.NUMBER_ATTRIBUTE) + "@" + this.toDomain;

    if (this.getCallSetupInProgress()) {
      event.target.style.setProperty("cursor", "wait", "");
    } else {
      event.target.style.setProperty("cursor", "pointer", "");
    }
  },

  handleMouseOutEvent: function (event) {    
    onsip.log("App::handleMouseOutEvent");
    event.target.style.removeProperty("color");
    event.target.style.removeProperty("border-bottom");
    event.target.style.removeProperty("cursor");
    event.target.ownerDocument.defaultView.status = null;
  },

  handleMouseClickEvent: function (event) {
    onsip.log("App::handleMouseClickEvent");
    if (this.getDisabled() || this.getCallSetupInProgress()) {
      return;
    }

    this.setupCall(event.target);
  },

  setupCall: function (node) {
    onsip.log("App::setupCall: " + node);
    if (this.getDisabled() || this.getCallSetupInProgress()) {
      return;
    }

    var number = node.getAttribute(onsip.App.NUMBER_ATTRIBUTE);
    if (!number) {
      return;
    }

    this.requestNode = node;
    this.requestNumber = node.getAttribute(onsip.App.NUMBER_ATTRIBUTE);
    this.callSetupTimeout = onsip.getIntegerPreference("onsip.call.setup.timeout");
    this.fromAddress = onsip.getStringPreference("onsip.call.setup.from.address");
    this.toDomain = onsip.getStringPreference("onsip.call.setup.to.domain");
    
    var queryVars = {
      Action: this.apiAction,
      FromAddress: this.fromAddress,
      ToAddress: this.requestNumber + '@' + this.toDomain,
      Timeout: this.callSetupTimeout
    };

    var request = new onsip.HttpRequest(this.apiUrl, queryVars);
    request.responseHandler = function (request, response) {
      onsip.theApp.handleCallSetupResponse(request, response);
    };
    request.errorHandler = function (request, status, statusText) {
      onsip.theApp.handleCallSetupError(request, status, statusText);
    };
    request.progressHandler = function (request, state) {
      onsip.theApp.handleCallSetupProgress(request, state);
    };
    request.timeoutHandler = function (request) {
      onsip.theApp.handleCallSetupTimeout(request);
    };
    request.timeout = this.callSetupTimeout;
    request.method = onsip.HttpRequest.POST;
    request.expectingXML = true;

    request.method = onsip.HttpRequest.GET;

    this.setCallSetupInProgress(true);

    request.send();
  },

  handleCallSetupResponse: function (request, responseXML) {
    var message, i, j;

    onsip.log("App::handleCallSetupResponse: " + request.url);

    this.setCallSetupInProgress(false);

    var doc = new onsip.JnDocument(responseXML);

    // check for an Exception
    if (doc.isException) {
      message = "OnSIP Exception: ";
      message += doc.exception;
      alert(message);
      return;
    }

    // check for Errors
    if (!doc.response.context.action.isCompleted) {
      message = "OnSIP Request Error: ";
      // if valid, then look for action errors
      if (doc.response.context.request.isValid) {
        if (doc.response.context.action.errors.length) {
          var actionErrors = doc.response.context.action.errors;
          for (i = 0; i < actionErrors.length; i++) {
            message += actionErrors[i].parameter + ": " + actionErrors[i].message + "\n";
          }
        }
      } else {
        if (doc.response.context.request.errors.length) {
          var requestParameters = doc.response.context.request.parameters;
          var requestErrors = doc.response.context.request.errors;
          for (i = 0; i < requestErrors.length; i++) {
            var parameterValue = "";
            for (j = 0; j<requestParameters.length; j++) {
              if (requestParameters[j].name == requestErrors[i].parameter) {
                parameterValue = requestParameters[j].value;
              }
            }
            message += requestErrors[i].parameter + " = " + parameterValue + " : " + requestErrors[i].message + "\n";
          }
        }
      }

      alert(message);
      return;
    }

    // check for a proper result
    if (doc.response.result.resultType != "CallSetup") {
      message = "OnSIP Result != CallSetup";
      alert(message);
      return;
    }

    // check final response code other than 200
    if (doc.response.result.callSetup.finalResponse.code != "200") {
      message = "OnSIP Call Setup Failure: ";
      message += doc.response.result.callSetup.finalResponse.message;
      alert(message);
      return;
    }
  },

  handleCallSetupError: function (request, status, statusText) {
    onsip.log("App::handleCallSetupError " + status + ": " + statusText);
    this.setCallSetupInProgress(false);
    alert("OnSIP Network Error: call setup response code " + status + ". " + statusText);
  },

  handleCallSetupProgress: function (request, state) {
    onsip.log("App::handleCallSetupProgress: " + state);
    this.setCallSetupInProgressState(state);
  },

  handleCallSetupTimeout: function (request) {
    onsip.log("App::handleCallSetupTimeout: " + request.url);
    this.setCallSetupInProgress(false);
    alert("OnSIP Request Timeout: timeout trying to setup call. Did you pickup your phone when it rang?");
  }
};

onsip.App.parseDOM = function (node) {
  onsip.log("App.parseDom : nodeName = " + node.nodeName);
  
  if (node.nodeName == "SCRIPT" || node.nodeName == "A" ||
      node.nodeName == "SELECT" || node.nodeName == "INPUT" ||
      node.nodeName == "TEXTAREA") {
    return 0;
  }

  for (var i = 0; i < node.childNodes.length; i++) {
    i += onsip.App.parseDOM(node.childNodes[i]);
  }

  if (node.nodeType == Node.TEXT_NODE) {
    return onsip.App.checkPhoneNumber(node);
  }
  return 0;	
};

onsip.App.checkPhoneNumber = function (node) {	
  onsip.log("App.checkPhoneNumber: nodeValue = " + node.nodeValue);

  // eliminate the obvious cases
  if (!node || node.nodeValue.length < 10 ||
      node.nodeValue.search(/\d/) == -1) {
    return 0;
  }

  var phoneNumber = /((((\+|(00))[1-9]\d{0,3}[\s\-.]?)?\d{2,4}[\s\/\-.]?)|21)\d{5,9}/;
  var phoneNumberNorthAmerica = /\+?(1[\s-.])?((\(\d{3}\))|(\d{3}))[\s.\-]\d{3}[\s.\-]\d{4}/;
  var phoneNumberDelimiter = /[\s.,;:|]/;

  var text = node.nodeValue;
  var offset = 0;
  var number = "";
  var found = false;
  var foundNorthAmerica = false;

  // find the first phone number in the text node
  while (!found) {
    var result = text.match(phoneNumberNorthAmerica);
    if (result) {
      foundNorthAmerica = true;
    } else {
      foundNorthAmerica = false;
    }

    if (!result) {
      return 0;
    }

    onsip.log("App.checkPhoneNumber: found = " + result[0] + " at index " + result.index);
    var pos = result.index;
    offset += pos;
    number = result[0];

    // make sure we have a resonable delimiters around our matching number
    if (pos && !text.substr(pos-1,1).match(phoneNumberDelimiter) ||
        pos+number.length < text.length &&
        !text.substr(pos+number.length,1).match(phoneNumberDelimiter)) {
      offset += number.length;
      text = text.substr(pos + number.length);
      continue;
    }

    // looks like we found a phone number
    found = true;
  }

  // wrap the phone number in a span tag
  var spanNode;
  if (node.nodeValue.length === number.length &&
      node.parentNode.childNodes.length === 0) {
    spanNode = node.parentNode;
  } else {
    spanNode = node.ownerDocument.createElement("span");
    var range = node.ownerDocument.createRange();
    range.setStart(node, offset);
    range.setEnd(node, offset+number.length);
    var docfrag = range.extractContents();
    var before = range.startContainer.splitText(range.startOffset);
    var parent = before.parentNode;
    spanNode.appendChild(docfrag);
    parent.insertBefore(spanNode, before);
  }

  // add a cleaned up version of the phone number as an attribute of the span
  var cleanNumber = "";
  for (var i=0; i < number.length; i++) {
    if (number.charAt(i).match(/\d/)) {
      cleanNumber += number.charAt(i);
    }
  }
  if (foundNorthAmerica && cleanNumber.length == 10) {
    cleanNumber = "1" + cleanNumber;
  }

  onsip.log("App.checkPhoneNumber: setting attribute " + onsip.App.NUMBER_ATTRIBUTE + " = " + cleanNumber);
  spanNode.setAttribute(onsip.App.NUMBER_ATTRIBUTE, cleanNumber);

  // add event listeners to the span
  onsip.App.addObjectEventListener(spanNode, "mouseover", onsip.theApp, false);
  onsip.App.addObjectEventListener(spanNode, "mouseout", onsip.theApp, false);
  onsip.App.addObjectEventListener(spanNode, "click", onsip.theApp, false);

  return 1;
};
