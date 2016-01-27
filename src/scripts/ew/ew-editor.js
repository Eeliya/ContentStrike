// Generated by CoffeeScript 1.10.0
(function () {
  var _EditorApp,
    extend = function (child, parent) {
      for (var key in parent) {
        if (hasProp.call(parent, key))
          child[key] = parent[key];
      }
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    },
    hasProp = {}.hasOwnProperty,
    slice = [
    ].slice;

  _EditorApp = (function (superClass) {
    extend(_EditorApp, superClass);

    function _EditorApp() {
      _EditorApp.__super__.constructor.call(this);
      this.history = null;
      this._state = ContentTools.EditorApp.DORMANT;
      this._regions = null;
      this._orderedRegions = null;
      this._rootLastModified = null;
      this._regionsLastModified = {};
      this._ignition = null;
      this._inspector = null;
      this._toolbox = null;
      this._updatePositionInterval = null;
      this._editorContainer = null;
      this._contentContainer = null;
      this.oldRect = {};
    }

    _EditorApp.prototype.ctrlDown = function () {
      return this._ctrlDown;
    };

    _EditorApp.prototype.domRegions = function () {
      return this._domRegions;
    };

    _EditorApp.prototype.orderedRegions = function () {
      var name;
      return (function () {
        var j, len, ref, results;
        ref = this._orderedRegions;
        results = [
        ];
        for (j = 0, len = ref.length; j < len; j++) {
          name = ref[j];
          results.push(this._regions[name]);
        }
        return results;
      }).call(this);
    };

    _EditorApp.prototype.regions = function () {
      return this._regions;
    };

    _EditorApp.prototype.shiftDown = function () {
      return this._shiftDown;
    };

    _EditorApp.prototype.busy = function (busy) {
      //return this._ignition.busy(busy);
      return false;
    };

    _EditorApp.prototype.init = function (queryOrDOMElements, namingProp) {
      if (namingProp == null) {
        namingProp = 'id';
      }
      this._namingProp = namingProp;
      if (queryOrDOMElements.length > 0 && queryOrDOMElements[0].nodeType === Node.ELEMENT_NODE) {
        this._domRegions = queryOrDOMElements;
      } else {
        this._domRegions = document.querySelectorAll(queryOrDOMElements);
      }
      if (this._domRegions.length === 0) {
        return;
      }
      this.mount();
      this._toolbox = new ContentTools.ToolboxUI(ContentTools.DEFAULT_TOOLS);
      this.attach(this._toolbox);
      this._inspector = new ContentTools.InspectorUI();
      this.attach(this._inspector);
      this._state = ContentTools.EditorApp.READY;

      ContentEdit.Root.get().unbind('detach');
      ContentEdit.Root.get().unbind('paste');
      ContentEdit.Root.get().unbind('next-region');
      ContentEdit.Root.get().unbind('previous-region');

      ContentEdit.Root.get().bind('detach', (function (_this) {
        return function (element) {
          return _this._preventEmptyRegions();
        };
      })(this));
      ContentEdit.Root.get().bind('paste', (function (_this) {
        return function (element, ev) {
          return _this.paste(element, ev.clipboardData);
        };
      })(this));
      ContentEdit.Root.get().bind('next-region', (function (_this) {
        return function (region) {
          var child, element, index, j, len, ref, regions;
          regions = _this.orderedRegions();
          index = regions.indexOf(region);
          if (index >= (regions.length - 1)) {
            return;
          }
          region = regions[index + 1];
          element = null;
          ref = region.descendants();
          for (j = 0, len = ref.length; j < len; j++) {
            child = ref[j];
            if (child.content !== void 0) {
              element = child;
              break;
            }
          }
          if (element) {
            element.focus();
            element.selection(new ContentSelect.Range(0, 0));
            return;
          }
          return ContentEdit.Root.get().trigger('next-region', region);
        };
      })(this));
      return ContentEdit.Root.get().bind('previous-region', (function (_this) {
        return function (region) {
          var child, descendants, element, index, j, len, length, regions;
          regions = _this.orderedRegions();
          index = regions.indexOf(region);
          if (index <= 0) {
            return;
          }
          region = regions[index - 1];
          element = null;
          descendants = region.descendants();
          descendants.reverse();
          for (j = 0, len = descendants.length; j < len; j++) {
            child = descendants[j];
            if (child.content !== void 0) {
              element = child;
              break;
            }
          }
          if (element) {
            length = element.content.length();
            element.focus();
            element.selection(new ContentSelect.Range(length, length));
            return;
          }
          return ContentEdit.Root.get().trigger('previous-region', region);
        };
      })(this));
    };

    _EditorApp.prototype.destroy = function () {
      return this.unmount();
    };

    _EditorApp.prototype.highlightRegions = function (highlight) {
      var domRegion, j, len, ref, results;
      ref = this._domRegions;
      results = [
      ];
      for (j = 0, len = ref.length; j < len; j++) {
        domRegion = ref[j];
        if (highlight) {
          results.push(ContentEdit.addCSSClass(domRegion, 'ct--highlight'));
        } else {
          results.push(ContentEdit.removeCSSClass(domRegion, 'ct--highlight'));
        }
      }
      return results;
    };

    _EditorApp.prototype.mount = function () {
      var _this = this;
      this._domElement = this.constructor.createDiv([
        'ct-app'
      ]);
      this._domElement.style.display = "none";
      this._domElement.style.position = "absolute";

      if (this._domRegions.length === 1) {
        this._editorContainer = this._domRegions[0];
        var html = this._editorContainer.innerHTML;

        ContentEdit.addCSSClass(this._editorContainer, 'ct-editor-container');

        this._editorContainer.innerHTML = '';
        this._editorContainer.appendChild(this._domElement);

        this._contentContainer = this.constructor.createDiv([
          'ct-content-container'
        ]);
        this._contentContainer.innerHTML = html;

        this._editorContainer.appendChild(this._contentContainer);

        this._domRegions = [
          this._contentContainer
        ];
        this.oldRect = {};
        this._updatePositionInterval = setInterval(function () {
          _this.updateToolboxPosition();
        }, 300);

      } else {
        document.body.insertBefore(this._domElement, null);
      }
      return this._addDOMEventListeners();
    };

    _EditorApp.prototype.updateToolboxPosition = function () {
      if (!this._domRegions) {
        return;
      }

      var rect = this._editorContainer.getBoundingClientRect();
      //console.log(this._domElement, this._contentContainer);
      if (rect.width <= 0 || rect.height <= 0) {
        this._domElement.style.display = "none";
        return;
      }

      this._domElement.style.display = "";
      var toolBarRect = this._domElement.getBoundingClientRect();

      if ((this.oldRect.top === toolBarRect.top && this.oldRect.height === toolBarRect.height) || toolBarRect.height <= 0) {
        return;
      }

      this._contentContainer.style.marginTop = toolBarRect.height + 'px';
      this._domElement.style.width = rect.width + 'px';
      /*this._domElement.style.top = rect.top + 'px';*/
      this.oldRect = toolBarRect;
      ContentEdit.Root.get().trigger('update-position', this);
    };

    _EditorApp.prototype.paste = function (element, clipboardData) {
      var className, content, cursor, encodeHTML, i, insertAt, insertIn, insertNode, item, itemText, j, lastItem, len, line, lineLength, lines, selection, tail, tip;
      content = clipboardData.getData('text/plain');
      lines = content.split('\n');
      lines = lines.filter(function (line) {
        return line.trim() !== '';
      });
      if (!lines) {
        return;
      }
      encodeHTML = HTMLString.String.encode;
      className = element.constructor.name;
      if ((lines.length > 1 || !element.content) && className !== 'PreText') {
        if (className === 'ListItemText') {
          insertNode = element.parent();
          insertIn = element.parent().parent();
          insertAt = insertIn.children.indexOf(insertNode) + 1;
        } else {
          insertNode = element;
          if (insertNode.parent().constructor.name !== 'Region') {
            insertNode = element.closest(function (node) {
              return node.parent().constructor.name === 'Region';
            });
          }
          insertIn = insertNode.parent();
          insertAt = insertIn.children.indexOf(insertNode) + 1;
        }
        for (i = j = 0, len = lines.length; j < len; i = ++j) {
          line = lines[i];
          line = encodeHTML(line);
          if (className === 'ListItemText') {
            item = new ContentEdit.ListItem();
            itemText = new ContentEdit.ListItemText(line);
            item.attach(itemText);
            lastItem = itemText;
          } else {
            item = new ContentEdit.Text('p', {}, line);
            lastItem = item;
          }
          insertIn.attach(item, insertAt + i);
        }
        lineLength = lastItem.content.length();
        lastItem.focus();
        return lastItem.selection(new ContentSelect.Range(lineLength, lineLength));
      } else {
        content = encodeHTML(content);
        content = new HTMLString.String(content, className === 'PreText');
        selection = element.selection();
        cursor = selection.get()[0] + content.length();
        tip = element.content.substring(0, selection.get()[0]);
        tail = element.content.substring(selection.get()[1]);
        element.content = tip.concat(content);
        element.content = element.content.concat(tail, false);
        element.updateInnerHTML();
        element.taint();
        selection.set(cursor, cursor);
        return element.selection(selection);
      }
    };

    _EditorApp.prototype.unmount = function () {
      if (!this.isMounted()) {
        return;
      }
      clearInterval(this._updatePositionInterval);
      this._domElement.parentNode.removeChild(this._domElement);
      this._domElement = null;
      this._removeDOMEventListeners();
      this._ignition = null;
      this._inspector = null;
      return this._toolbox = null;
    };

    _EditorApp.prototype.revert = function () {
      var confirmMessage;
      confirmMessage = ContentEdit._('Your changes have not been saved, do you really want to lose them?');
      if (ContentEdit.Root.get().lastModified() > this._rootLastModified && !window.confirm(confirmMessage)) {
        return false;
      }
      this.revertToSnapshot(this.history.goTo(0), false);
      return true;
    };

    _EditorApp.prototype.revertToSnapshot = function (snapshot, restoreEditable) {
      var domRegion, i, j, len, name, ref, ref1, region;
      if (restoreEditable == null) {
        restoreEditable = true;
      }
      ref = this._regions;
      for (name in ref) {
        region = ref[name];
        region.domElement().innerHTML = snapshot.regions[name];
      }
      if (restoreEditable) {
        this._regions = {};
        ref1 = this._domRegions;
        for (i = j = 0, len = ref1.length; j < len; i = ++j) {
          domRegion = ref1[i];
          name = domRegion.getAttribute(this._namingProp);
          if (!name) {
            name = i;
          }
          this._regions[name] = new ContentEdit.Region(domRegion);
        }
        this.history.replaceRegions(this._regions);
        return this.history.restoreSelection(snapshot);
      }
    };

    _EditorApp.prototype.save = function () {
      var args, child, html, modifiedRegions, name, passive, ref, region, root;
      passive = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [
      ];
      root = ContentEdit.Root.get();
      if (root.lastModified() === this._rootLastModified && passive) {
        return;
      }
      modifiedRegions = {};
      ref = this._regions;
      for (name in ref) {
        region = ref[name];
        html = region.html();
        if (region.children.length === 1) {
          child = region.children[0];
          if (child.content && !child.content.html()) {
            html = '';
          }
        }
        if (!passive) {
          region.domElement().innerHTML = html;
        }
        if (region.lastModified() === this._regionsLastModified[name]) {
          continue;
        }
        modifiedRegions[name] = html;
      }
      return this.trigger.apply(this, [
        'save',
        modifiedRegions
      ].concat(slice.call(args)));
    };

    _EditorApp.prototype.setRegionOrder = function (regionNames) {
      return this._orderedRegions = regionNames.slice();
    };

    _EditorApp.prototype.start = function () {
      var domRegion, i, j, len, name, ref;
      this.busy(true);
      this._regions = {};
      this._orderedRegions = [
      ];
      ref = this._domRegions;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        domRegion = ref[i];
        name = domRegion.getAttribute(this._namingProp);
        if (!name) {
          name = i;
        }
        this._regions[name] = new ContentEdit.Region(domRegion);
        this._orderedRegions.push(name);
        this._regionsLastModified[name] = this._regions[name].lastModified();
      }
      this._preventEmptyRegions();
      this._rootLastModified = ContentEdit.Root.get().lastModified();
      this.history = new ContentTools.History(this._regions);
      this.history.watch();
      this._state = ContentTools.EditorApp.EDITING;
      this._toolbox.show();
      this._inspector.show();
      return this.busy(false);
    };

    _EditorApp.prototype.stop = function () {
      if (ContentEdit.Root.get().focused()) {
        ContentEdit.Root.get().focused().blur();
      }
      clearInterval(this._updatePositionInterval);
      this.history.stopWatching();
      this.history = null;
      this._toolbox.hide();
      this._inspector.hide();
      this._regions = {};
      this._domRegions[0].style.marginTop = '';

      return this._state = ContentTools.EditorApp.READY;
    };

    _EditorApp.prototype._addDOMEventListeners = function () {
      this._handleHighlightOn = (function (_this) {
        return function (ev) {
          var ref;
          if ((ref = ev.keyCode) === 17 || ref === 224) {
            _this._ctrlDown = true;
            return;
          }
          if (ev.keyCode === 16) {
            if (_this._highlightTimeout) {
              return;
            }
            _this._shiftDown = true;
            return _this._highlightTimeout = setTimeout(function () {
              return _this.highlightRegions(true);
            }, ContentTools.HIGHLIGHT_HOLD_DURATION);
          }
        };
      })(this);
      this._handleHighlightOff = (function (_this) {
        return function (ev) {
          var ref;
          if ((ref = ev.keyCode) === 17 || ref === 224) {
            _this._ctrlDown = false;
            return;
          }
          if (ev.keyCode === 16) {
            _this._shiftDown = false;
            if (_this._highlightTimeout) {
              clearTimeout(_this._highlightTimeout);
              _this._highlightTimeout = null;
            }
            return _this.highlightRegions(false);
          }
        };
      })(this);
      document.addEventListener('keydown', this._handleHighlightOn);
      document.addEventListener('keyup', this._handleHighlightOff);
      window.onbeforeunload = (function (_this) {
        return function (ev) {
          if (ContentEdit.Root.get().lastModified() > _this._rootLastModified && _this._state === ContentTools.EditorApp.EDITING) {
            return ContentEdit._('Your changes have not been saved, do you really want to lose them?');
          }
        };
      })(this);
      return window.addEventListener('unload', (function (_this) {
        return function (ev) {
          return _this.destroy();
        };
      })(this));
    };

    _EditorApp.prototype._preventEmptyRegions = function () {
      var name, placeholder, ref, region, results;
      ref = this._regions;
      results = [
      ];
      for (name in ref) {
        region = ref[name];
        if (region.children.length > 0) {
          continue;
        }
        placeholder = new ContentEdit.Text('p', {}, '');
        region.attach(placeholder);
        results.push(region.commit());
      }
      return results;
    };

    _EditorApp.prototype._removeDOMEventListeners = function () {
      window.onbeforeunload = null;
      document.removeEventListener('keydown', this._handleHighlightOn);
      return document.removeEventListener('keyup', this._handleHighlightOff);
    };

    return _EditorApp;

  })(ContentTools.ComponentUI);

  ContentTools.EditorApp = (function () {
    var instance;

    function EditorApp() {
    }

    EditorApp.DORMANT = 'dormant';

    EditorApp.READY = 'ready';

    EditorApp.EDITING = 'editing';

    instance = null;

    EditorApp.get = function () {
      var cls;
      cls = ContentTools.EditorApp.getCls();
      return instance != null ? instance : instance = new cls();
    };

    EditorApp.getNew = function () {
      var cls;
      cls = ContentTools.EditorApp.getCls();
      ContentEdit.Root.reset();
      instance = new cls();
      return instance;
    };

    EditorApp.getCls = function () {
      return _EditorApp;
    };

    return EditorApp;
  })();

}).call(this);