onsip.isPreferenceSet = function (preference) {
  if (preference) {
    return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).prefHasUserValue(preference);
  }

  return false;
};

onsip.deletePreference = function (preference) {
  if (onsip.isPreferenceSet(preference)) {
    Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).clearUserPref(preference);
  }
};

onsip.deletePreferenceBranch = function (branch) {
  if (branch) {
    Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).deleteBranch(branch);
  }
};

onsip.getBooleanPreference = function (preference) {
  if (onsip.isPreferenceSet(preference)) {
    try {
      return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getBoolPref(preference);
    } catch(exception) {}
  }

  return false;
};

onsip.getIntegerPreference = function (preference) {
  if (onsip.isPreferenceSet(preference)) {
    try {
      return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getIntPref(preference);
    } catch(exception) {}
  }

  return 0;
};

onsip.getStringPreference = function (preference) {
  if (onsip.isPreferenceSet(preference)) {
    try {
      return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getCharPref(preference);
    } catch(exception) {}
  }

  return null;
};

onsip.setBooleanPreference = function (preference, value) {
  if (preference) {
    Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).setBoolPref(preference, value);
  }
};

onsip.setBooleanPreferenceIfNotSet = function (preference, value) {
  if (!onsip.isPreferenceSet(preference)) {
    Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).setBoolPref(preference, value);
  }
};

onsip.setIntegerPreference = function (preference, value) {
  if (preference) {
    Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).setIntPref(preference, value);
  }
};

onsip.setIntegerPreferenceIfNotSet = function (preference, value) {
  if (!onsip.isPreferenceSet(preference)) {
    onsip.setIntegerPreference(preference, value);
  }
};

onsip.setStringPreference = function (preference, value) {
  if (preference) {
    Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).setCharPref(preference, value);
  }
};

onsip.setStringPreferenceIfNotSet = function (preference, value) {
  if (!onsip.isPreferenceSet(preference)) {
    onsip.setStringPreference(preference, value);
  }
};
