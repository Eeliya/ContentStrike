// Generated by CoffeeScript 1.10.0
(function () {
  var extend = function (child, parent) {
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
          hasProp = {}.hasOwnProperty;

  ContentTools.ContentFieldDialog = (function (superClass) {
    extend(ContentFieldDialog, superClass);

    function ContentFieldDialog(initialValue) {
      if (initialValue == null) {
        initialValue = '';
      }
      ContentFieldDialog.__super__.constructor.call(this);
      this._initialValue = initialValue;
    }

    ContentFieldDialog.prototype.mount = function () {
      ContentFieldDialog.__super__.mount.call(this);
      this._domInput = document.createElement('input');
      this._domInput.setAttribute('class', 'ct-anchored-dialog__input');
      this._domInput.setAttribute('name', 'href');
      this._domInput.setAttribute('placeholder', ContentEdit._('Enter a identifier') + '...');
      this._domInput.setAttribute('type', 'text');
      this._domInput.setAttribute('value', this._initialValue);
      this._domElement.appendChild(this._domInput);
      this._domButton = this.constructor.createDiv(['ct-anchored-dialog__button']);
      this._domElement.appendChild(this._domButton);
      return this._addDOMEventListeners();
    };

    ContentFieldDialog.prototype.save = function () {
      if (!this.isMounted) {
        return this.trigger('save', '');
      }
      return this.trigger('save', this._domInput.value.trim());
    };

    ContentFieldDialog.prototype.show = function () {
      ContentFieldDialog.__super__.show.call(this);
      this._domInput.focus();
      if (this._initialValue) {
        return this._domInput.select();
      }
    };

    ContentFieldDialog.prototype.unmount = function () {
      if (this.isMounted()) {
        this._domInput.blur();
      }
      ContentFieldDialog.__super__.unmount.call(this);
      this._domButton = null;
      return this._domInput = null;
    };

    ContentFieldDialog.prototype._addDOMEventListeners = function () {
      this._domInput.addEventListener('keypress', (function (_this) {
        return function (ev) {
          if (ev.keyCode === 13) {
            return _this.save();
          }
        };
      })(this));
      return this._domButton.addEventListener('click', (function (_this) {
        return function (ev) {
          ev.preventDefault();
          return _this.save();
        };
      })(this));
    };

    return ContentFieldDialog;

  })(ContentTools.AnchoredDialogUI);

}).call(this);
