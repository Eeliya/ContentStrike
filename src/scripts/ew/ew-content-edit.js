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

})(this);