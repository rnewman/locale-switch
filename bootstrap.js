const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

var gNativeWindow;
var gBrowserApp;
var gCrashesMenuId;
var gHealthMenuId;

function LOG(msg) {
  Services.console.logStringMessage("About Pages Add-On -- " + msg);
}

function aboutHealth() {
  gBrowserApp.addTab("about:healthreport");
}

function aboutCrashes() {
  gBrowserApp.addTab("about:crashes");
}

function loadIntoWindow(window) {
  gNativeWindow = window.NativeWindow;
  gBrowserApp = window.BrowserApp;

  gHealthMenuId = gNativeWindow.menu.add({
    name: "about:healthreport",
    callback: aboutHealth,
    parent: gNativeWindow.menu.toolsMenuID
  });

  gCrashesMenuId = gNativeWindow.menu.add({
    name: "about:crashes",
    callback: aboutCrashes,
    parent: gNativeWindow.menu.toolsMenuID
  });
}

function unloadFromWindow(window) {
  gNativeWindow.menu.remove(gCrashesMenuId);
  gNativeWindow.menu.remove(gHealthMenuId);
}

/**
 * bootstrap.js API
 */
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  
  onCloseWindow: function(aWindow) {
  },
  
  onWindowTitleChange: function(aWindow, aTitle) {
  }
};

function startup(aData, aReason) {
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

  // Load into any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

  // Stop listening for new windows
  wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
