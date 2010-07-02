onsip.optionsDataBoolean = [];
onsip.optionsDataInteger = [];
onsip.optionsDataString  = [];

// Handles changing the options page
onsip.changePage = function (pageList) {
  onsip.storeOptions();

  document.getElementById("onsip-options-iframe").setAttribute("src", pageList.selectedItem.value);
};

// Initializes the options dialog
onsip.initializeOptions = function () {
  var pageDocument = document.getElementById("onsip-options-iframe").contentDocument;

  // If the from address preference is set
  if (onsip.optionsDataString["onsip.call.setup.from.address"]) {
    pageDocument.getElementById("onsip.call.setup.from.address").value = onsip.optionsDataString["onsip.call.setup.from.address"];
  } else if (onsip.isPreferenceSet("onsip.call.setup.from.address")) {
    pageDocument.getElementById("onsip.call.setup.from.address").value = onsip.getStringPreference("onsip.call.setup.from.address");
  }
};

// Saves the user's options
onsip.saveOptions = function () {
  var parentWindow = null;
  var option       = null;
  var optionValue  = null;
  
  // Make sure current page is stored
  onsip.storeOptions();
  
  // Loop through the boolean options
  for (option in onsip.optionsDataBoolean) {
    if (onsip.optionsDataBoolean.hasOwnProperty(option)) {
      onsip.setBooleanPreference(option, onsip.optionsDataBoolean[option]);
    }
  }
  
  // Loop through the integer options
  for (option in onsip.optionsDataInteger) {
    if (onsip.optionsDataInteger.hasOwnProperty(option)) {
      optionValue = onsip.optionsDataInteger[option];
    
      // If the option value is set
      if (optionValue) {
        onsip.setIntegerPreference(option, optionValue);
      } else if(onsip.isPreferenceSet(option)) {
        onsip.deletePreference(option);
      }
    }
  }
  
  // Loop through the string options
  for (option in onsip.optionsDataString) {
    if (onsip.optionsDataString.hasOwnProperty(option)) {
      optionValue = onsip.optionsDataString[option];
    
      // If the option value is set or the preference currently has a value
      if(optionValue || onsip.isPreferenceSet(option)) {
        onsip.setStringPreference(option, optionValue);
      }
    }
  }
};

// Stores the user's options to be saved later
onsip.storeOptions = function () {
  var iFrame       = document.getElementById("onsip-options-iframe");
  var pageDocument = iFrame.contentDocument;

  onsip.optionsDataString["onsip.call.setup.from.address"] = pageDocument.getElementById("onsip.call.setup.from.address").value;
  if (onsip.optionsDataString["onsip.call.setup.from.address"].indexOf("@") != -1) {
    onsip.optionsDataString["onsip.call.setup.to.domain"] = 
      onsip.optionsDataString["onsip.call.setup.from.address"].substring(onsip.optionsDataString["onsip.call.setup.from.address"].indexOf("@")+1);
  }    
};
