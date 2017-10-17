// Generated by CoffeeScript 1.12.7
(function() {
  var Marks, root;

  Marks = {
    getLocationKey: function(markName) {
      return "vimiumGlobalMark|" + markName;
    },
    getBaseUrl: function(url) {
      return url.split("#")[0];
    },
    create: function(req, sender) {
      return chrome.storage.local.get("vimiumSecret", (function(_this) {
        return function(items) {
          var markInfo;
          markInfo = {
            vimiumSecret: items.vimiumSecret,
            markName: req.markName,
            url: _this.getBaseUrl(sender.tab.url),
            tabId: sender.tab.id,
            scrollX: req.scrollX,
            scrollY: req.scrollY
          };
          if ((markInfo.scrollX != null) && (markInfo.scrollY != null)) {
            return _this.saveMark(markInfo);
          } else {
            return chrome.tabs.sendMessage(sender.tab.id, {
              name: "getScrollPosition"
            }, function(response) {
              return _this.saveMark(extend(markInfo, {
                scrollX: response.scrollX,
                scrollY: response.scrollY
              }));
            });
          }
        };
      })(this));
    },
    saveMark: function(markInfo) {
      var item;
      item = {};
      item[this.getLocationKey(markInfo.markName)] = markInfo;
      return Settings.storage.set(item);
    },
    goto: function(req, sender) {
      return chrome.storage.local.get("vimiumSecret", (function(_this) {
        return function(items) {
          var key, vimiumSecret;
          vimiumSecret = items.vimiumSecret;
          key = _this.getLocationKey(req.markName);
          return Settings.storage.get(key, function(items) {
            var markInfo;
            markInfo = items[key];
            if (markInfo.vimiumSecret !== vimiumSecret) {
              return _this.focusOrLaunch(markInfo, req);
            } else {
              return chrome.tabs.get(markInfo.tabId, function(tab) {
                if (!chrome.runtime.lastError && (tab != null ? tab.url : void 0) && markInfo.url === _this.getBaseUrl(tab.url)) {
                  return _this.gotoPositionInTab(markInfo);
                } else {
                  return _this.focusOrLaunch(markInfo, req);
                }
              });
            }
          });
        };
      })(this));
    },
    gotoPositionInTab: function(arg) {
      var markName, scrollX, scrollY, tabId;
      tabId = arg.tabId, scrollX = arg.scrollX, scrollY = arg.scrollY, markName = arg.markName;
      return chrome.tabs.update(tabId, {
        active: true
      }, function() {
        return chrome.tabs.sendMessage(tabId, {
          name: "setScrollPosition",
          scrollX: scrollX,
          scrollY: scrollY
        });
      });
    },
    focusOrLaunch: function(markInfo, req) {
      var query, ref;
      query = (markInfo.scrollX === (ref = markInfo.scrollY) && ref === 0) ? markInfo.url + "*" : markInfo.url;
      return chrome.tabs.query({
        url: query
      }, (function(_this) {
        return function(tabs) {
          if (0 < tabs.length) {
            return _this.pickTab(tabs, function(tab) {
              return _this.gotoPositionInTab(extend(markInfo, {
                tabId: tab.id
              }));
            });
          } else {
            return TabOperations.openUrlInNewTab(extend(req, {
              url: _this.getBaseUrl(markInfo.url)
            }), function(tab) {
              return tabLoadedHandlers[tab.id] = function() {
                return _this.gotoPositionInTab(extend(markInfo, {
                  tabId: tab.id
                }));
              };
            });
          }
        };
      })(this));
    },
    pickTab: function(tabs, callback) {
      return chrome.windows.getCurrent(function(arg) {
        var id, tab, tabsInWindow;
        id = arg.id;
        tabsInWindow = tabs.filter(function(tab) {
          return tab.windowId === id;
        });
        if (0 < tabsInWindow.length) {
          tabs = tabsInWindow;
        }
        if (1 < tabs.length) {
          tabs = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = tabs.length; i < len; i++) {
              tab = tabs[i];
              if (!tab.active) {
                results.push(tab);
              }
            }
            return results;
          })();
        }
        tabs.sort(function(a, b) {
          return a.url.length - b.url.length;
        });
        return callback(tabs[0]);
      });
    }
  };

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Marks = Marks;

}).call(this);
