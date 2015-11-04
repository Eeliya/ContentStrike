// Generated by CoffeeScript 1.10.0
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ContentTools.IgnitionUI = (function(superClass) {
    extend(IgnitionUI, superClass);

    function IgnitionUI() {
      IgnitionUI.__super__.constructor.call(this);
      this._busy = false;
    }

    IgnitionUI.prototype.busy = function(busy) {
      if (busy === void 0) {
        return this._busy;
      }
      if (this._busy === busy) {
        return;
      }
      this._busy = busy;
      if (busy) {
        return this.addCSSClass('ct-ignition--busy');
      } else {
        return this.removeCSSClass('ct-ignition--busy');
      }
    };

    IgnitionUI.prototype.changeState = function(state) {
      if (state === 'editing') {
        this.addCSSClass('ct-ignition--editing');
        return this.removeCSSClass('ct-ignition--ready');
      } else if (state === 'ready') {
        this.removeCSSClass('ct-ignition--editing');
        return this.addCSSClass('ct-ignition--ready');
      }
    };

    IgnitionUI.prototype.mount = function() {
      IgnitionUI.__super__.mount.call(this);
      this._domElement = this.constructor.createDiv(['ct-widget', 'ct-ignition', 'ct-ignition--ready']);
      this.parent().domElement().appendChild(this._domElement);
      this._domEdit = this.constructor.createDiv(['ct-ignition__button', 'ct-ignition__button--edit']);
      this._domElement.appendChild(this._domEdit);
      this._domConfirm = this.constructor.createDiv(['ct-ignition__button', 'ct-ignition__button--confirm']);
      this._domElement.appendChild(this._domConfirm);
      this._domCancel = this.constructor.createDiv(['ct-ignition__button', 'ct-ignition__button--cancel']);
      this._domElement.appendChild(this._domCancel);
      this._domBusy = this.constructor.createDiv(['ct-ignition__button', 'ct-ignition__button--busy']);
      this._domElement.appendChild(this._domBusy);
      return this._addDOMEventListeners();
    };

    IgnitionUI.prototype.unmount = function() {
      IgnitionUI.__super__.unmount.call(this);
      this._domEdit = null;
      this._domConfirm = null;
      return this._domCancel = null;
    };

    IgnitionUI.prototype._addDOMEventListeners = function() {
      this._domEdit.addEventListener('click', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          _this.addCSSClass('ct-ignition--editing');
          _this.removeCSSClass('ct-ignition--ready');
          return _this.trigger('start');
        };
      })(this));
      this._domConfirm.addEventListener('click', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          _this.removeCSSClass('ct-ignition--editing');
          _this.addCSSClass('ct-ignition--ready');
          return _this.trigger('stop', true);
        };
      })(this));
      return this._domCancel.addEventListener('click', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          _this.removeCSSClass('ct-ignition--editing');
          _this.addCSSClass('ct-ignition--ready');
          return _this.trigger('stop', false);
        };
      })(this));
    };

    return IgnitionUI;

  })(ContentTools.WidgetUI);

}).call(this);
