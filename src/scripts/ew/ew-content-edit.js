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

  ContentEdit.TagNames.get().register(ContentEdit.Text, 'address', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a');

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
      img = "" + indent + "<img" + (this._attributesToString()) + ">";
      if (this.a) {
        attributes = ContentEdit.attributesToString(this.a);
        attributes = "" + attributes + " data-ce-tag=\"img\"";
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

    Image.placements = ['above', 'below', 'left', 'right', 'center'];

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
      return new this(attributes, a);
    };

    return Image;

  })(ContentEdit.ResizableElement);

  ContentEdit.TagNames.get().register(ContentEdit.Image, 'img');

})(this);