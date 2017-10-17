// Generated by CoffeeScript 1.12.7
(function() {
  var KeyHandlerMode, root,
    extend1 = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  KeyHandlerMode = (function(superClass) {
    extend1(KeyHandlerMode, superClass);

    KeyHandlerMode.prototype.setKeyMapping = function(keyMapping) {
      this.keyMapping = keyMapping;
      return this.reset();
    };

    KeyHandlerMode.prototype.setPassKeys = function(passKeys) {
      this.passKeys = passKeys;
      return this.reset();
    };

    KeyHandlerMode.prototype.setCommandHandler = function(commandHandler) {
      this.commandHandler = commandHandler;
    };

    KeyHandlerMode.prototype.reset = function(countPrefix) {
      this.countPrefix = countPrefix != null ? countPrefix : 0;
      return this.keyState = [this.keyMapping];
    };

    function KeyHandlerMode(options) {
      var ref, ref1;
      this.commandHandler = (ref = options.commandHandler) != null ? ref : (function() {});
      this.setKeyMapping((ref1 = options.keyMapping) != null ? ref1 : {});
      KeyHandlerMode.__super__.constructor.call(this, extend(options, {
        keydown: this.onKeydown.bind(this),
        blur: (function(_this) {
          return function(event) {
            return _this.alwaysContinueBubbling(function() {
              if (event.target === window) {
                return _this.keydownEvents = {};
              }
            });
          };
        })(this)
      }));
      if (options.exitOnEscape) {
        this.push({
          _name: "key-handler-escape-listener",
          keydown: (function(_this) {
            return function(event) {
              if (KeyboardUtils.isEscape(event) && !_this.isInResetState()) {
                _this.reset();
                return DomUtils.consumeKeyup(event);
              } else {
                return _this.continueBubbling;
              }
            };
          })(this)
        });
      }
    }

    KeyHandlerMode.prototype.onKeydown = function(event) {
      var digit, isEscape, keyChar;
      keyChar = KeyboardUtils.getKeyCharString(event);
      isEscape = KeyboardUtils.isEscape(event);
      if (isEscape && (this.countPrefix !== 0 || this.keyState.length !== 1)) {
        return DomUtils.consumeKeyup(event, (function(_this) {
          return function() {
            return _this.reset();
          };
        })(this));
      } else if (isEscape && (typeof HelpDialog !== "undefined" && HelpDialog !== null ? HelpDialog.isShowing() : void 0)) {
        return DomUtils.consumeKeyup(event, function() {
          return HelpDialog.toggle();
        });
      } else if (isEscape) {
        return this.continueBubbling;
      } else if (this.isMappedKey(keyChar)) {
        return DomUtils.consumeKeyup(event, (function(_this) {
          return function() {
            return _this.handleKeyChar(keyChar);
          };
        })(this));
      } else if (this.isCountKey(keyChar)) {
        digit = parseInt(keyChar);
        this.reset(this.keyState.length === 1 ? this.countPrefix * 10 + digit : digit);
        return this.suppressEvent;
      } else {
        if (keyChar) {
          this.reset();
        }
        return this.continueBubbling;
      }
    };

    KeyHandlerMode.prototype.isMappedKey = function(keyChar) {
      var mapping;
      return (((function() {
        var i, len, ref, results;
        ref = this.keyState;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          mapping = ref[i];
          if (keyChar in mapping) {
            results.push(mapping);
          }
        }
        return results;
      }).call(this))[0] != null) && !this.isPassKey(keyChar);
    };

    KeyHandlerMode.prototype.isCountKey = function(keyChar) {
      return keyChar && ((0 < this.countPrefix ? '0' : '1') <= keyChar && keyChar <= '9') && !this.isPassKey(keyChar);
    };

    KeyHandlerMode.prototype.isPassKey = function(keyChar) {
      var ref;
      return this.isInResetState() && indexOf.call((ref = this.passKeys) != null ? ref : "", keyChar) >= 0;
    };

    KeyHandlerMode.prototype.isInResetState = function() {
      return this.countPrefix === 0 && this.keyState.length === 1;
    };

    KeyHandlerMode.prototype.handleKeyChar = function(keyChar) {
      var command, count, mapping;
      bgLog("handle key " + keyChar + " (" + this.name + ")");
      if (!(keyChar in this.keyState[0])) {
        this.countPrefix = 0;
      }
      this.keyState = slice.call((function() {
          var i, len, ref, results;
          ref = this.keyState;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            mapping = ref[i];
            if (keyChar in mapping) {
              results.push(mapping[keyChar]);
            }
          }
          return results;
        }).call(this)).concat([this.keyMapping]);
      if (this.keyState[0].command != null) {
        command = this.keyState[0];
        count = 0 < this.countPrefix ? this.countPrefix : 1;
        bgLog("  invoke " + command.command + " count=" + count + " ");
        this.reset();
        this.commandHandler({
          command: command,
          count: count
        });
        if ((this.options.count != null) && --this.options.count <= 0) {
          this.exit();
        }
      }
      return this.suppressEvent;
    };

    return KeyHandlerMode;

  })(Mode);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.KeyHandlerMode = KeyHandlerMode;

}).call(this);
