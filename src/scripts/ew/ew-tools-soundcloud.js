
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
  }, hasProp = {}.hasOwnProperty;
  ContentTools.SoundcloudDialog = (function (superClass) {
    extend(WidgetIFrame, superClass);
    function WidgetIFrame() {
      WidgetIFrame.__super__.constructor.call(this, 'Insert widget iframe');
    }

    WidgetIFrame.prototype.clearPreview = function () {
      if (this._domPreview) {
        ContentEdit.addCSSClass(this._domButton, 'ct-control--muted');
        this._domPreview.parentNode.removeChild(this._domPreview);
        return this._domPreview = void 0;
      }
    };
    WidgetIFrame.prototype.mount = function () {
      var domControlGroup;
      WidgetIFrame.__super__.mount.call(this);
      ContentEdit.addCSSClass(this._domElement, 'ct-iframe-dialog');
      ContentEdit.addCSSClass(this._domView, 'ct-video-dialog__preview');
      domControlGroup = this.constructor.createDiv(['ct-control-group']);
      this._domControls.appendChild(domControlGroup);
      this._domInput = document.createElement('textarea');
      this._domInput.setAttribute('class', 'ct-iframe-dialog__input');
      this._domInput.setAttribute('name', 'url');
      this._domInput.setAttribute('placeholder', ContentEdit._('Paste widget embed code') + '...');
      this._domInput.setAttribute('type', 'text');
      domControlGroup.appendChild(this._domInput);
      this._domButton = this.constructor.createDiv(['ct-control', 'ct-control--text', 'ct-control--insert', 'ct-control--muted']);
      this._domButton.textContent = ContentEdit._('Insert');
      domControlGroup.appendChild(this._domButton);
      return this._addDOMEventListeners();
    };

    WidgetIFrame.prototype.parseInput = function (text) {
      var parser = document.createElement('div');
      parser.innerHTML = text;
      var widgetIFrame = parser.querySelector('iframe');
      this.clearPreview();

      if (!widgetIFrame)
        return;

      return {
        scrolling: widgetIFrame.getAttribute('scrolling'),
        height: widgetIFrame.getAttribute('height'),
        width: widgetIFrame.getAttribute('width'),
        src: widgetIFrame.getAttribute('src'),
        title: widgetIFrame.getAttribute('src').substr(0, 82)
      };
    };

    WidgetIFrame.prototype.preview = function (url) {
      var parser = document.createElement('div');
      parser.innerHTML = url;
      var widgetIFrame = parser.querySelector('iframe');
      this.clearPreview();

      if (!widgetIFrame)
        return;

      this._domPreview = document.createElement('iframe');
      this._domPreview.setAttribute('frameborder', '0');
      this._domPreview.setAttribute('scrolling', widgetIFrame.getAttribute('scrolling'));
      this._domPreview.setAttribute('height', widgetIFrame.getAttribute('height'));
      this._domPreview.setAttribute('src', widgetIFrame.getAttribute('src'));
      this._domPreview.setAttribute('width', '100%');
      ContentEdit.removeCSSClass(this._domButton, 'ct-control--muted');
      return this._domView.appendChild(this._domPreview);
    };
    WidgetIFrame.prototype.save = function () {
      var embedURL, videoURL;
      videoURL = this._domInput.value.trim();
      return this.trigger('save', this.parseInput(videoURL));
      //}
    };
    WidgetIFrame.prototype.show = function () {
      WidgetIFrame.__super__.show.call(this);
      return this._domInput.focus();
    };
    WidgetIFrame.prototype.unmount = function () {
      if (this.isMounted()) {
        this._domInput.blur();
      }
      WidgetIFrame.__super__.unmount.call(this);
      this._domButton = null;
      this._domInput = null;
      return this._domPreview = null;
    };
    WidgetIFrame.prototype._addDOMEventListeners = function () {
      var _this = this;
      WidgetIFrame.__super__._addDOMEventListeners.call(this);

      this._domInput.addEventListener('input', function (ev) {
        var updatePreview;
        if (_this._updatePreviewTimeout) {
          clearTimeout(_this._updatePreviewTimeout);
        }

        updatePreview = function () {
          var embedURL, soundcloudURL;
          soundcloudURL = _this._domInput.value.trim();
          embedURL = soundcloudURL;
          if (embedURL) {
            return _this.preview(embedURL);
          } else {
            return _this.clearPreview();
          }
        };

        return _this._updatePreviewTimeout = setTimeout(updatePreview, 500);
      });

      this._domInput.addEventListener('keypress', (function (_this) {
        return function (ev) {
          if (ev.keyCode === 13) {
            return _this.save();
          }
        };
      })(this));
      return this._domButton.addEventListener('click', (function (_this) {
        return function (ev) {
          var cssClass;
          ev.preventDefault();
          cssClass = _this._domButton.getAttribute('class');
          if (cssClass.indexOf('ct-control--muted') === -1) {
            return _this.save();
          }
        };
      })(this));
    };
    return WidgetIFrame;
  })(ContentTools.DialogUI);
  ContentTools.Tools.WidgetIFrameEmbed = (function (superClass) {
    extend(SoundcloudEmbed, superClass);
    function SoundcloudEmbed() {
      return SoundcloudEmbed.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(SoundcloudEmbed, 'widget-embed');
    SoundcloudEmbed.label = 'Widget iframe';
    SoundcloudEmbed.icon = 'iframe';
    SoundcloudEmbed.canApply = function (element, selection) {
      return true;
    };
    SoundcloudEmbed.apply = function (element, selection, callback) {
      var app, dialog, modal;
      if (element.storeState) {
        element.storeState();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI();
      dialog = new ContentTools.SoundcloudDialog();
      dialog.bind('cancel', (function (_this) {
        return function () {
          dialog.unbind('cancel');
          modal.hide();
          dialog.hide();
          if (element.restoreState) {
            element.restoreState();
          }
          return callback(false);
        };
      })(this));

      dialog.bind('save', (function (_this) {
        return function (videoURL) {
          var index, node, ref, video;
          dialog.unbind('save');
          if (videoURL) {
            video = new ContentEdit.Video('iframe', {
              'frameborder': 0,
              'height': videoURL.height,
              'src': videoURL.src,
              title: videoURL.title,
              'width': videoURL.width
            });
            ref = _this._insertAt(element), node = ref[0], index = ref[1];
            node.parent().attach(video, index);
            video.focus();
          } else {
            if (element.restoreState) {
              element.restoreState();
            }
          }
          modal.hide();
          dialog.hide();
          return callback(videoURL !== '');
        };
      })(this));
      app.attach(modal);
      app.attach(dialog);
      modal.show();
      return dialog.show();
    };
    return SoundcloudEmbed;
  })(ContentTools.Tool);
}).call(this);
