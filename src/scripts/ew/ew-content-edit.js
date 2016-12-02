/*
 * Overwrite Region to add `region-ready` event
 */
(function () {
  var __hasProp = {}.hasOwnProperty,
          __extends = function (child, parent) {
            for (var key in parent) {
              if (__hasProp.call(parent, key))
                child[key] = parent[key];
            }
            function ctor() {
              this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
          };

  ContentEdit.ElementCollection.prototype.html = function (indent) {
    var c, children;
    if (indent == null) {
      indent = '';
    }

    var _i, _len, _ref, _results;
    _ref = this.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      if (c._domElement.hasAttribute('edit-mode-only')) {
        continue;
      }

      _results.push(c.html(indent + ContentEdit.INDENT));
    }

    return ("" + indent + "<" + (this.tagName()) + (this._attributesToString()) + ">\n") + ("" + (_results.join('\n')) + "\n") + ("" + indent + "</" + (this.tagName()) + ">");
  };

  ContentEdit.Region = (function (_super) {
    __extends(Region, _super);

    function Region(domElement) {
      var c, childNode, childNodes, cls, element, tagNames, _i, _len;
      Region.__super__.constructor.call(this);
      this._domElement = domElement;
      tagNames = ContentEdit.TagNames.get();
      childNodes = (function () {
        var _i, _len, _ref, _results;
        _ref = this._domElement.childNodes;
        _results = [
        ];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c);
        }
        return _results;
      }).call(this);
      for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
        childNode = childNodes[_i];
        if (childNode.nodeType !== 1) {
          continue;
        }
        if (childNode.getAttribute("data-ce-tag")) {
          cls = tagNames.match(childNode.getAttribute("data-ce-tag"));
        } else {
          cls = tagNames.match(childNode.tagName);
        }
        element = cls.fromDOMElement(childNode);
        this._domElement.removeChild(childNode);
        if (element) {
          this.attach(element);
        }
      }
      ContentEdit.Root.get().trigger('region-ready', this);
    }

    Region.prototype.domElement = function () {
      return this._domElement;
    };

    Region.prototype.isMounted = function () {
      return true;
    };

    Region.prototype.type = function () {
      return 'Region';
    };

    Region.prototype.html = function (indent) {
      var c;
      if (indent == null) {
        indent = '';
      }
      return ((function () {
        var _i, _len, _ref, _results;
        _ref = this.children;
        _results = [
        ];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c.html(indent));
        }
        return _results;
      }).call(this)).join('\n').trim();
    };

    return Region;

  })(ContentEdit.NodeCollection);



  ContentEdit.Image = (function (_super) {
    __extends(Image, _super);

    function Image(attributes, a) {
      var size;

      Image.__super__.constructor.call(this, 'img', attributes);
      this.a = a ? a : null;
      size = this.size();
      this._aspectRatio = size[1] / size[0];
    }

    Image.prototype.cssTypeName = function () {
      return 'image';
    };

    Image.prototype.type = function () {
      return 'Image';
    };

    Image.prototype.typeName = function () {
      return 'Image';
    };

    Image.prototype.createDraggingDOMElement = function () {
      var helper;
      if (!this.isMounted()) {
        return;
      }
      helper = Image.__super__.createDraggingDOMElement.call(this);
      helper.style.backgroundImage = "url(" + this._attributes['src'] + ")";
      return helper;
    };

    Image.prototype.html = function (indent) {
      var attributes, img;
      if (indent == null) {
        indent = '';
      }
      this._attributes['alt'] = this._attributes['alt'] || '';

      img = "" + indent + "<img" + (this._attributesToString()) + ">";
      if (this.a) {
        this.a['data-ce-tag'] = 'img';
        if (this._attributes['content-field']) {
          this.a['content-field'] = this._attributes['content-field'];
        }

        var newAttributes = {};
        for (var attr in this._attributes) {
          if (this._attributes.hasOwnProperty(attr) && attr !== 'content-field') {
            newAttributes[attr] = this._attributes[attr];
          }
        }

        img = "" + indent + "<img " + ContentEdit.attributesToString(newAttributes) + ">";
        attributes = ContentEdit.attributesToString(this.a);
        attributes = "" + attributes;
        return ("" + indent + "<a " + attributes + ">\n") + ("" + ContentEdit.INDENT + img + "\n") + ("" + indent + "</a>");
      } else {
        return img;
      }
    };

    Image.prototype.mount = function () {
      var classes, style;

      this._domElement = document.createElement('div');
      if (this._attributes['content-field']) {
        this._domElement.setAttribute('content-field', this._attributes['content-field']);
      }
      var img = document.createElement('img');

      img.style.display = 'block';
      //img.style.height = '100%';

      classes = '';
      if (this.a && this.a['class']) {
        classes += ' ' + this.a['class'];
      }
      if (this._attributes['class']) {
        classes += ' ' + this._attributes['class'];
      }
      this._domElement.setAttribute('class', classes);
      style = this._attributes['style'] ? this._attributes['style'] : '';
      //style += "background-image:url(" + this._attributes['src'] + ");";
      if (this._attributes['width']) {
        style += "width:" + this._attributes['width'] + "px;";
      }
      if (this._attributes['height']) {
        //style += "height:" + this._attributes['height'] + "px;";
      }
      this._domElement.setAttribute('style', style);
      img.src = this._attributes['src'];
      this._domElement.appendChild(img);
      return Image.__super__.mount.call(this);
    };

    Image.droppers = {
      'Image': ContentEdit.Element._dropBoth,
      'PreText': ContentEdit.Element._dropBoth,
      'Static': ContentEdit.Element._dropBoth,
      'Text': ContentEdit.Element._dropBoth
    };

    Image.placements = ['above',
      'below',
      'left',
      'right',
      'center'];

    Image.fromDOMElement = function (domElement) {
      var a, attributes, c, childNode, childNodes, _i, _len;
      a = null;
      if (domElement.tagName.toLowerCase() === 'a') {
        a = this.getDOMElementAttributes(domElement);
        childNodes = (function () {
          var _i, _len, _ref, _results;
          _ref = domElement.childNodes;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            _results.push(c);
          }
          return _results;
        })();
        for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
          childNode = childNodes[_i];
          if (childNode.nodeType === 1 && childNode.tagName.toLowerCase() === 'img') {
            domElement = childNode;
            break;
          }
        }
        if (domElement.tagName.toLowerCase() === 'a') {
          domElement = document.createElement('img');
        }
      }
      attributes = this.getDOMElementAttributes(domElement);
      if (attributes['width'] === void 0) {
        if (attributes['height'] === void 0) {
          attributes['width'] = domElement.naturalWidth;
        } else {
          attributes['width'] = domElement.clientWidth;
        }
      }
      if (attributes['height'] === void 0) {
        if (attributes['width'] === void 0) {
          attributes['height'] = domElement.naturalHeight;
        } else {
          attributes['height'] = domElement.clientHeight;
        }
      }

      if (a && a['content-field']) {
        attributes['content-field'] = a['content-field'];
        delete a['content-field'];
      }

      return new this(attributes, a);
    };

    return Image;

  })(ContentEdit.ResizableElement);

  ContentEdit.TagNames.get().register(ContentEdit.Image, 'img');

  // ------ //

  ContentEdit.Text = (function (_super) {
    __extends(Text, _super);

    function Text(tagName, attributes, content) {
      Text.__super__.constructor.call(this, tagName, attributes);
      if (content instanceof HTMLString.String) {
        this.content = content;
      } else {
        this.content = new HTMLString.String(content).trim();
      }
    }

    Text.prototype.cssTypeName = function () {
      return 'text';
    };

    Text.prototype.type = function () {
      return 'Text';
    };

    Text.prototype.typeName = function () {
      return 'Text';
    };

    Text.prototype.blur = function () {
      var error;
      if (this.isMounted()) {
        this._syncContent();
      }
      if (this.content.isWhitespace()) {
        if (this.parent()) {
          this.parent().detach(this);
        }
      } else if (this.isMounted()) {
        try {
          this._domElement.blur();
        } catch (_error) {
          error = _error;
        }
        this._domElement.removeAttribute('contenteditable');
      }
      return Text.__super__.blur.call(this);
    };

    Text.prototype.createDraggingDOMElement = function () {
      var helper, text;
      if (!this.isMounted()) {
        return;
      }
      helper = Text.__super__.createDraggingDOMElement.call(this);
      text = HTMLString.String.encode(this._domElement.textContent);
      if (text.length > ContentEdit.HELPER_CHAR_LIMIT) {
        text = text.substr(0, ContentEdit.HELPER_CHAR_LIMIT);
      }
      helper.innerHTML = text;
      return helper;
    };

    Text.prototype.drag = function (x, y) {
      this.storeState();
      this._domElement.removeAttribute('contenteditable');
      return Text.__super__.drag.call(this, x, y);
    };

    Text.prototype.drop = function (element, placement) {
      Text.__super__.drop.call(this, element, placement);
      return this.restoreState();
    };

    Text.prototype.focus = function (supressDOMFocus) {
      if (this.isMounted()) {
        this._domElement.setAttribute('contenteditable', '');
      }
      return Text.__super__.focus.call(this, supressDOMFocus);
    };

    Text.prototype.html = function (indent) {
      var content;
      if (indent == null) {
        indent = '';
      }
      if (!this._lastCached || this._lastCached < this._modified) {
        content = this.content.copy().trim();
        content.optimize();
        this._lastCached = Date.now();
        this._cached = content.html();
      }

      if (!this._cached || this._cached.length === 0) {
        return '';
      }

      return ("" + indent + "<" + this._tagName + (this._attributesToString()) + ">\n") + ("" + indent + ContentEdit.INDENT + this._cached + "\n") + ("" + indent + "</" + this._tagName + ">");
    };

    Text.prototype.mount = function () {
      var name, value, _ref;
      this._domElement = document.createElement(this._tagName);
      this._domElement.setAttribute('dir', 'auto');
      _ref = this._attributes;
      for (name in _ref) {
        value = _ref[name];
        this._domElement.setAttribute(name, value);
      }
      this.updateInnerHTML();
      return Text.__super__.mount.call(this);
    };

    Text.prototype.restoreState = function () {
      if (!this._savedSelection) {
        return;
      }
      if (!(this.isMounted() && this.isFocused())) {
        this._savedSelection = void 0;
        return;
      }
      this._domElement.setAttribute('contenteditable', '');
      this._addCSSClass('ce-element--focused');
      if (document.activeElement !== this.domElement()) {
        this.domElement().focus();
      }
      this._savedSelection.select(this._domElement);
      return this._savedSelection = void 0;
    };

    Text.prototype.selection = function (selection) {
      if (selection === void 0) {
        if (this.isMounted()) {
          return ContentSelect.Range.query(this._domElement);
        } else {
          return new ContentSelect.Range(0, 0);
        }
      }
      return selection.select(this._domElement);
    };

    Text.prototype.storeState = function () {
      if (!(this.isMounted() && this.isFocused())) {
        return;
      }
      return this._savedSelection = ContentSelect.Range.query(this._domElement);
    };

    Text.prototype.updateInnerHTML = function () {
      this._domElement.innerHTML = this.content.html();
      ContentSelect.Range.prepareElement(this._domElement);
      return this._flagIfEmpty();
    };

    Text.prototype._onKeyDown = function (ev) {
      switch (ev.keyCode) {
        case 40:
          return this._keyDown(ev);
        case 37:
          return this._keyLeft(ev);
        case 39:
          return this._keyRight(ev);
        case 38:
          return this._keyUp(ev);
        case 9:
          return this._keyTab(ev);
        case 8:
          return this._keyBack(ev);
        case 46:
          return this._keyDelete(ev);
        case 13:
          return this._keyReturn(ev);
      }
    };

    Text.prototype._onKeyUp = function (ev) {
      Text.__super__._onKeyUp.call(this, ev);
      return this._syncContent();
    };

    Text.prototype._onMouseDown = function (ev) {
      Text.__super__._onMouseDown.call(this, ev);
      clearTimeout(this._dragTimeout);
      this._dragTimeout = setTimeout((function (_this) {
        return function () {
          return _this.drag(ev.pageX, ev.pageY);
        };
      })(this), ContentEdit.DRAG_HOLD_DURATION);
      if (this.content.length() === 0 && ContentEdit.Root.get().focused() === this) {
        ev.preventDefault();
        if (document.activeElement !== this._domElement) {
          this._domElement.focus();
        }
        return new ContentSelect.Range(0, 0).select(this._domElement);
      }
    };

    Text.prototype._onMouseMove = function (ev) {
      if (this._dragTimeout) {
        clearTimeout(this._dragTimeout);
      }
      return Text.__super__._onMouseMove.call(this, ev);
    };

    Text.prototype._onMouseOut = function (ev) {
      if (this._dragTimeout) {
        clearTimeout(this._dragTimeout);
      }
      return Text.__super__._onMouseOut.call(this, ev);
    };

    Text.prototype._onMouseUp = function (ev) {
      if (this._dragTimeout) {
        clearTimeout(this._dragTimeout);
      }
      return Text.__super__._onMouseUp.call(this, ev);
    };

    Text.prototype._keyBack = function (ev) {
      var previous, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(selection.get()[0] === 0 && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      previous = this.previousContent();
      this._syncContent();
      if (previous) {
        return previous.merge(this);
      }
    };

    Text.prototype._keyDelete = function (ev) {
      var next, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(this._atEnd(selection) && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      next = this.nextContent();
      if (next) {
        return this.merge(next);
      }
    };

    Text.prototype._keyDown = function (ev) {
      return this._keyRight(ev);
    };

    Text.prototype._keyLeft = function (ev) {
      var previous, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(selection.get()[0] === 0 && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      previous = this.previousContent();
      if (previous) {
        previous.focus();
        selection = new ContentSelect.Range(previous.content.length(), previous.content.length());
        return selection.select(previous.domElement());
      } else {
        return ContentEdit.Root.get().trigger('previous-region', this.closest(function (node) {
          return node.type() === 'Region';
        }));
      }
    };

    Text.prototype._keyReturn = function (ev) {
      var element, insertAt, lineBreakStr, selection, tail, tip;
      ev.preventDefault();
      if (this.content.isWhitespace()) {
        return;
      }
      ContentSelect.Range.query(this._domElement);
      selection = ContentSelect.Range.query(this._domElement);
      tip = this.content.substring(0, selection.get()[0]);
      tail = this.content.substring(selection.get()[1]);
      if (ev.shiftKey) {
        insertAt = selection.get()[0];
        lineBreakStr = '<br>';
        if (this.content.length() === insertAt) {
          if (!this.content.characters[insertAt - 1].isTag('br')) {
            lineBreakStr = '<br><br>';
          }
        }
        this.content = this.content.insert(insertAt, new HTMLString.String(lineBreakStr, true), true);
        this.updateInnerHTML();
        insertAt += 1;
        selection = new ContentSelect.Range(insertAt, insertAt);
        selection.select(this.domElement());
        return;
      }
      this.content = tip.trim();
      this.updateInnerHTML();
      element = new this.constructor('p', {}, tail.trim());
      this.parent().attach(element, this.parent().children.indexOf(this) + 1);
      if (tip.length()) {
        element.focus();
        selection = new ContentSelect.Range(0, 0);
        selection.select(element.domElement());
      } else {
        selection = new ContentSelect.Range(0, tip.length());
        selection.select(this._domElement);
      }
      return this.taint();
    };

    Text.prototype._keyRight = function (ev) {
      var next, selection;
      selection = ContentSelect.Range.query(this._domElement);
      if (!(this._atEnd(selection) && selection.isCollapsed())) {
        return;
      }
      ev.preventDefault();
      next = this.nextContent();
      if (next) {
        next.focus();
        selection = new ContentSelect.Range(0, 0);
        return selection.select(next.domElement());
      } else {
        return ContentEdit.Root.get().trigger('next-region', this.closest(function (node) {
          return node.type() === 'Region';
        }));
      }
    };

    Text.prototype._keyTab = function (ev) {
      return ev.preventDefault();
    };

    Text.prototype._keyUp = function (ev) {
      return this._keyLeft(ev);
    };

    Text.prototype._atEnd = function (selection) {
      var atEnd;
      atEnd = selection.get()[0] === this.content.length();
      if (selection.get()[0] === this.content.length() - 1 && this.content.characters[this.content.characters.length - 1].isTag('br')) {
        atEnd = true;
      }
      return atEnd;
    };

    Text.prototype._flagIfEmpty = function () {
      if (this.content.length() === 0) {
        return this._addCSSClass('ce-element--empty');
      } else {
        return this._removeCSSClass('ce-element--empty');
      }
    };

    Text.prototype._syncContent = function (ev) {
      var newSnapshot, snapshot;
      snapshot = this.content.html();
      this.content = new HTMLString.String(this._domElement.innerHTML, this.content.preserveWhitespace());
      newSnapshot = this.content.html();
      if (snapshot !== newSnapshot) {
        this.taint();
      }
      return this._flagIfEmpty();
    };

    Text.droppers = {
      'Static': ContentEdit.Element._dropVert,
      'Text': ContentEdit.Element._dropVert
    };

    Text.mergers = {
      'Text': function (element, target) {
        var offset;
        offset = target.content.length();
        if (element.content.length()) {
          target.content = target.content.concat(element.content);
        }
        if (target.isMounted()) {
          target.updateInnerHTML();
        }
        target.focus();
        new ContentSelect.Range(offset, offset).select(target._domElement);
        if (element.parent()) {
          element.parent().detach(element);
        }
        return target.taint();
      }
    };

    Text.fromDOMElement = function (domElement) {
      return new this(domElement.tagName, this.getDOMElementAttributes(domElement), domElement.innerHTML.replace(/^\s+|\s+$/g, ''));
    };

    return Text;

  })(ContentEdit.Element);

  ContentEdit.TagNames.get().register(ContentEdit.Text, 'address', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a');

  function Resizable(element) {
    var _this = this;
    _this.element = element;
    _this.resizing = false;
    _this.threshold = 10;
    _this.counter = 0;

    this.resizerTool = document.createElement('span');
    this.resizerTool.classList.add('inline-tool--div-resize');

    element.appendChild(this.resizerTool);

    this.resizerTool.addEventListener('mousedown', function (event) {
      _this.start(event.x, event.y);
    });

    window.addEventListener('mousemove', _this.move.bind(this));

    window.addEventListener('mouseup', function (event) {
      _this.stop();
    });
  }

  Resizable.prototype.start = function (x, y) {
    var _this = this;
    this.oldX = this.startX = x;
    this.starty = y;

    var defaultWidth = this.element.clientWidth;
    this.element.style.width = '100%';

    window.requestAnimationFrame(function () {
      _this.maxWidth = _this.element.clientWidth;
      _this.element.style.width = defaultWidth + 'px';

      var width = Math.round((defaultWidth * 100) / _this.maxWidth);

      if (_this.orginalWidth !== width) {
        _this.orginalWidth = width;
        _this.element.style.width = _this.orginalWidth + '%';
      }

      _this.resizing = true;
    });

  };

  Resizable.prototype.move = function (event) {
    if (!this.resizing) {
      return;
    }

    this.oldX = event.x;
    var newWidth = this.orginalWidth + (Math.round(((event.x - this.startX) * 100) / this.maxWidth));

    if (this.oldWidth !== newWidth && newWidth >= 1 && newWidth <= 100) {
      this.element.style.width = newWidth + '%';
    }
  };

  Resizable.prototype.stop = function (x, y) {
    this.resizing = false;
  };

  ContentEdit.Div = (function (_super) {
    __extends(Div, _super);

    function Div(attributes, child) {
      Div.__super__.constructor.call(this, 'div', attributes);
      this.child = child;
//      this.content = new HTMLString.String('').trim();

      if (child) {
        var content = new ContentEdit.Text('p');
        this.attach(content);
      }
    }

    Div.prototype.setupTools = function () {
//      new Resizable(this._domElement, this.parent()._domElement);
      var _this = this;

      var toolsBar = document.createElement('div');
      toolsBar.setAttribute('edit-mode-only', true);
      toolsBar.classList.add('ce-element-tools-bar');
      toolsBar.addEventListener('click', function () {
        var root;
        root = ContentEdit.Root.get();
        if (_this.isFocused()) {
          return;
        }
        if (root.focused()) {
          root.focused().blur();
        }
        _this._addCSSClass('ce-element--focused');
        root._focused = _this;

        root.trigger('focus', _this);
      });

      var remove = document.createElement('button');
      remove.className = 'btn i-remove';
      remove.type = 'button';
      remove.addEventListener('click', function () {
        _this._parent.detach(_this);
      });
      toolsBar.appendChild(remove);

      if (this._domElement.classList.contains('flex-box')) {
        var direction = document.createElement('button');
        direction.innerText = 'Row';
        direction.className = 'btn btn-text';
        direction.type = 'button';
        direction.addEventListener('click', function () {
          if (_this._domElement.classList.contains('flex-box-column')) {
            _this.removeCSSClass('flex-box-column');
            _this.addCSSClass('flex-box-row');
            direction.innerText = 'Row';
          } else {
            _this.removeCSSClass('flex-box-row');
            _this.addCSSClass('flex-box-column');
            direction.innerText = 'Column';
          }
        });
        toolsBar.appendChild(direction);
      }

      this._domElement.insertBefore(toolsBar, this._domElement.firstChild);
      this._toolsBar = toolsBar;
    };

    Div.prototype.cssTypeName = function () {
      return 'div';
    };

    Div.prototype.type = function () {
      return 'Div';
    };

    Div.prototype.typeName = function () {
      return 'Div';
    };

    Div.prototype.mount = function () {
      Div.__super__.mount.call(this);

      if (!this._parent._domElement.classList.contains('flex-box')) {
        this.addCSSClass('flex-box');
      }

      this.setupTools();
    };


    Div.fromDOMElement = function (dom) {
      var div = new Div(this.getDOMElementAttributes(dom));

      var childNode, childNodes, cls, element, tagNames, _i, _len;
      tagNames = ContentEdit.TagNames.get();
      childNodes = dom.childNodes || [];

      for (_i = 0, _len = childNodes.length; _i < _len; _i++) {
        childNode = childNodes[_i];
        if (childNode.nodeType !== 1) {
          continue;
        }
        if (childNode.getAttribute("data-ce-tag")) {
          cls = tagNames.match(childNode.getAttribute("data-ce-tag"));
        } else {
          cls = tagNames.match(childNode.tagName);
        }
        element = cls.fromDOMElement(childNode);
        //this._domElement.removeChild(childNode);
        if (element) {
          div.attach(element);
        }
      }

      return div;
    };

    Div.prototype.focus = function () {
      var root;
      var _this = this;
      root = ContentEdit.Root.get();

      if (_this.isFocused()) {
        return;
      }

      if (root._focused && _this._domElement.contains(root._focused._domElement)) {
        return;
      }

      if (root.focused()) {
        root.focused().blur();
      }

      _this._addCSSClass('ce-element--focused');
      root._focused = _this;

      if (_this.isMounted()) {
        _this.domElement().focus();
      }

      return root.trigger('focus', _this);
    };

    Div.prototype.blur = function (param) {
      var root;
      root = ContentEdit.Root.get();
      if (this.isFocused()) {
        this._removeCSSClass('ce-element--focused');
        root._focused = null;
        return root.trigger('blur', this);
      }
    };

    Div.prototype._onMouseDown = function (ev) {
      if (ev.target !== this._domElement && ev.target !== this._toolsBar) {
        return;
      }

      clearTimeout(this._dragTimeout);
      this._dragTimeout = setTimeout((function (_this) {
        return function () {
          return _this.drag(ev.pageX, ev.pageY);
        };
      })(this), ContentEdit.DRAG_HOLD_DURATION);
    };

    Div.prototype._onMouseUp = function (ev) {
      Div.__super__._onMouseDown.call(this, ev);
      clearTimeout(this._dragTimeout);
    };

    Div.droppers = {
      'Static': ContentEdit.Element._dropVert,
      'Text': ContentEdit.Element._dropVert,
      'Div': ContentEdit.Element._dropVert,
      'Image': ContentEdit.Element._dropVert
    };

    Div.prototype.createDraggingDOMElement = function () {
      var helper, text;
      if (!this.isMounted()) {
        return;
      }
      helper = Div.__super__.createDraggingDOMElement.call(this);
      text = this._domElement.textContent;
      if (text.length > ContentEdit.HELPER_CHAR_LIMIT) {
        text = text.substr(0, ContentEdit.HELPER_CHAR_LIMIT);
      }
      helper.innerHTML = text;
      return helper;
    };

    Div.prototype._onOver = function (ev) {
      var dragging, root;
      this._addCSSClass('ce-element--over');
      root = ContentEdit.Root.get();
      dragging = root.dragging();
      if (!dragging) {
        return;
      }

      if (dragging === this || dragging._parent === this) {
        return;
      }

      if (root._dropTarget) {
        return;
      }

      if (this.constructor.droppers[dragging.type()] || dragging.constructor.droppers[this.type()]) {
        this._addCSSClass('ce-element--drop');
        return root._dropTarget = this;
      }
    };

    return Div;

  })(ContentEdit.ElementCollection);

  ContentEdit.TagNames.get().register(ContentEdit.Div, 'div');

})(this);