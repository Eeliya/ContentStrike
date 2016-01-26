// Generated by CoffeeScript 1.10.0
(function () {
  var CropMarksUI,
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
    hasProp = {}.hasOwnProperty;

  ContentTools.ImageDialog = (function (superClass) {
    extend(ImageDialog, superClass);

    function ImageDialog() {
      ImageDialog.__super__.constructor.call(this, 'Insert image');
      this._cropMarks = null;
      this._imageURL = null;
      this._imageSize = null;
      this._progress = 0;
      this._state = 'empty';
      if (ContentTools.IMAGE_UPLOADER) {
        ContentTools.IMAGE_UPLOADER(this);
      }
    }

    ImageDialog.prototype.cropRegion = function () {
      if (this._cropMarks) {
        return this._cropMarks.region();
      }
      return [
        0,
        0,
        1,
        1
      ];
    };

    ImageDialog.prototype.addCropMarks = function () {
      if (this._cropMarks) {
        return;
      }
      this._cropMarks = new CropMarksUI(this._imageSize);
      this._cropMarks.mount(this._domView);
      return ContentEdit.addCSSClass(this._domCrop, 'ct-control--active');
    };

    ImageDialog.prototype.clear = function () {
      if (this._domImage) {
        this._domImage.parentNode.removeChild(this._domImage);
        this._domImage = null;
      }
      this._imageURL = null;
      this._imageSize = null;
      return this.state('empty');
    };

    ImageDialog.prototype.mount = function () {
      var domActions, domProgressBar, domTools;
      ImageDialog.__super__.mount.call(this);
      ContentEdit.addCSSClass(this._domElement, 'ct-image-dialog');
      ContentEdit.addCSSClass(this._domElement, 'ct-image-dialog--empty');
      ContentEdit.addCSSClass(this._domView, 'ct-image-dialog__view');
      domTools = this.constructor.createDiv([
        'ct-control-group',
        'ct-control-group--left'
      ]);
      this._domControls.appendChild(domTools);
      this._domRotateCCW = this.constructor.createDiv([
        'ct-control',
        'ct-control--icon',
        'ct-control--rotate-ccw'
      ]);
      this._domRotateCCW.setAttribute('data-tooltip', ContentEdit._('Rotate') + ' -90Â°');
      domTools.appendChild(this._domRotateCCW);
      this._domRotateCW = this.constructor.createDiv([
        'ct-control',
        'ct-control--icon',
        'ct-control--rotate-cw'
      ]);
      this._domRotateCW.setAttribute('data-tooltip', ContentEdit._('Rotate') + ' 90Â°');
      domTools.appendChild(this._domRotateCW);
      this._domCrop = this.constructor.createDiv([
        'ct-control',
        'ct-control--icon',
        'ct-control--crop'
      ]);
      this._domCrop.setAttribute('data-tooltip', ContentEdit._('Crop marks'));
      domTools.appendChild(this._domCrop);
      domProgressBar = this.constructor.createDiv([
        'ct-progress-bar'
      ]);
      domTools.appendChild(domProgressBar);
      this._domProgress = this.constructor.createDiv([
        'ct-progress-bar__progress'
      ]);
      domProgressBar.appendChild(this._domProgress);
      domActions = this.constructor.createDiv([
        'ct-control-group',
        'ct-control-group--right'
      ]);
      this._domControls.appendChild(domActions);

      this._domURLInput = document.createElement('input');
      this._domURLInput.setAttribute('class', 'ct-image-dialog__input ct-control--fetch');
      this._domURLInput.setAttribute('name', 'url');
      this._domURLInput.setAttribute('placeholder', ContentEdit._('Or paste image URL') + '...');
      this._domURLInput.setAttribute('type', 'text');
      domActions.appendChild(this._domURLInput);

      this._domFetch = this.constructor.createDiv([
        'ct-control',
        'ct-control--text',
        'ct-control--fetch'
      ]);
      this._domFetch.textContent = ContentEdit._('Fetch');
      domActions.appendChild(this._domFetch);

      this._domUpload = this.constructor.createDiv([
        'ct-control',
        'ct-control--text',
        'ct-control--upload'
      ]);
      this._domUpload.textContent = ContentEdit._('Upload');
      domActions.appendChild(this._domUpload);

      this._domInput = document.createElement('input');
      this._domInput.setAttribute('class', 'ct-image-dialog__file-upload');
      this._domInput.setAttribute('name', 'file');
      this._domInput.setAttribute('type', 'file');
      this._domInput.setAttribute('accept', 'image/*');
      this._domUpload.appendChild(this._domInput);

      this._domInsert = this.constructor.createDiv([
        'ct-control',
        'ct-control--text',
        'ct-control--insert'
      ]);
      this._domInsert.textContent = ContentEdit._('Insert');
      domActions.appendChild(this._domInsert);
      this._domCancelUpload = this.constructor.createDiv([
        'ct-control',
        'ct-control--text',
        'ct-control--cancel'
      ]);
      this._domCancelUpload.textContent = ContentEdit._('Cancel');
      domActions.appendChild(this._domCancelUpload);
      this._domClear = this.constructor.createDiv([
        'ct-control',
        'ct-control--text',
        'ct-control--clear'
      ]);
      this._domClear.textContent = ContentEdit._('Clear');
      domActions.appendChild(this._domClear);
      this._addDOMEventListeners();
      return this.trigger('imageUploader.mount');
    };

    ImageDialog.prototype.populate = function (imageURL, imageSize) {
      this._imageURL = imageURL;
      this._imageSize = imageSize;
      if (!this._domImage) {
        this._domImage = this.constructor.createDiv([
          'ct-image-dialog__image'
        ]);
        this._domView.appendChild(this._domImage);
      }
      this._domImage.style['background-image'] = "url(" + imageURL + ")";
      return this.state('populated');
    };

    ImageDialog.prototype.progress = function (progress) {
      if (progress === void 0) {
        return this._progress;
      }
      this._progress = progress;
      if (!this.isMounted()) {
        return;
      }
      return this._domProgress.style.width = this._progress + "%";
    };

    ImageDialog.prototype.removeCropMarks = function () {
      if (!this._cropMarks) {
        return;
      }
      this._cropMarks.unmount();
      this._cropMarks = null;
      return ContentEdit.removeCSSClass(this._domCrop, 'ct-control--active');
    };

    ImageDialog.prototype.save = function (imageURL, imageSize, imageAttrs) {
      return this.trigger('save', imageURL, imageSize, imageAttrs);
    };

    ImageDialog.prototype.fetchImage = function (imageURL) {
      var _this = this;
      // Create image object in order to load image and determine its dimension
      var img = new Image();
      img.onerror = function (e) {
        alert(ContentEdit._('Image is invalid'));
      };

      img.onload = function () {
        _this._imageSize = [
          img.width,
          img.height
        ];
        _this._imageURL = img.src;
        _this.populate(_this._imageURL, _this._imageSize);
      };
      img.src = imageURL;
    };



    ImageDialog.prototype.state = function (state) {
      var prevState;
      if (state === void 0) {
        return this._state;
      }
      if (this._state === state) {
        return;
      }
      prevState = this._state;
      this._state = state;
      if (!this.isMounted()) {
        return;
      }
      ContentEdit.addCSSClass(this._domElement, "ct-image-dialog--" + this._state);
      return ContentEdit.removeCSSClass(this._domElement, "ct-image-dialog--" + prevState);
    };

    ImageDialog.prototype.unmount = function () {
      ImageDialog.__super__.unmount.call(this);
      this._domCancelUpload = null;
      this._domClear = null;
      this._domCrop = null;
      this._domInput = null;
      this._domInsert = null;
      this._domProgress = null;
      this._domRotateCCW = null;
      this._domRotateCW = null;
      this._domUpload = null;
      return this.trigger('imageUploader.unmount');
    };

    ImageDialog.prototype._addDOMEventListeners = function () {
      ImageDialog.__super__._addDOMEventListeners.call(this);

      // when user hit return 
      this._domURLInput.addEventListener('keydown', (function (_this) {
        return function (ev) {
          if (ev.keyCode !== 13 || !_this._domURLInput.value)
            return;

          _this.fetchImage(_this._domURLInput.value);

          return _this.trigger('imageUploader.fetchReady', {});
        };
      })(this));

      this._domFetch.addEventListener('click', (function (_this) {
        return function (ev) {
          if (!_this._domURLInput.value)
            return;

          _this.fetchImage(_this._domURLInput.value);

          return _this.trigger('imageUploader.fetchReady', {});
        };
      })(this));

      this._domInput.addEventListener('change', (function (_this) {
        return function (ev) {
          var file;
          file = ev.target.files[0];
          ev.target.value = '';
          if (ev.target.value) {
            ev.target.type = 'text';
            ev.target.type = 'file';
          }
          return _this.trigger('imageUploader.fileReady', file);
        };
      })(this));
      this._domCancelUpload.addEventListener('click', (function (_this) {
        return function (ev) {
          return _this.trigger('imageUploader.cancelUpload');
        };
      })(this));
      this._domClear.addEventListener('click', (function (_this) {
        return function (ev) {
          _this.removeCropMarks();
          _this.clear();
          return _this.trigger('imageUploader.clear');
        };
      })(this));
      this._domRotateCCW.addEventListener('click', (function (_this) {
        return function (ev) {
          _this.removeCropMarks();
          return _this.trigger('imageUploader.rotateCCW');
        };
      })(this));
      this._domRotateCW.addEventListener('click', (function (_this) {
        return function (ev) {
          _this.removeCropMarks();
          return _this.trigger('imageUploader.rotateCW');
        };
      })(this));
      this._domCrop.addEventListener('click', (function (_this) {
        return function (ev) {
          if (_this._cropMarks) {
            return _this.removeCropMarks();
          } else {
            return _this.addCropMarks();
          }
        };
      })(this));
      return this._domInsert.addEventListener('click', (function (_this) {
        return function (ev) {
          _this.save(_this._imageURL, _this._imageSize, {});
          return _this.trigger('imageUploader.save');
        };
      })(this));
    };

    return ImageDialog;

  })(ContentTools.DialogUI);

  CropMarksUI = (function (superClass) {
    extend(CropMarksUI, superClass);

    function CropMarksUI(imageSize) {
      CropMarksUI.__super__.constructor.call(this);
      this._bounds = null;
      this._dragging = null;
      this._draggingOrigin = null;
      this._imageSize = imageSize;
    }

    CropMarksUI.prototype.mount = function (domParent, before) {
      if (before == null) {
        before = null;
      }
      this._domElement = this.constructor.createDiv([
        'ct-crop-marks'
      ]);
      this._domClipper = this.constructor.createDiv([
        'ct-crop-marks__clipper'
      ]);
      this._domElement.appendChild(this._domClipper);
      this._domRulers = [
        this.constructor.createDiv([
          'ct-crop-marks__ruler',
          'ct-crop-marks__ruler--top-left'
        ]),
        this.constructor.createDiv([
          'ct-crop-marks__ruler',
          'ct-crop-marks__ruler--bottom-right'
        ])
      ];
      this._domClipper.appendChild(this._domRulers[0]);
      this._domClipper.appendChild(this._domRulers[1]);
      this._domHandles = [
        this.constructor.createDiv([
          'ct-crop-marks__handle',
          'ct-crop-marks__handle--top-left'
        ]),
        this.constructor.createDiv([
          'ct-crop-marks__handle',
          'ct-crop-marks__handle--bottom-right'
        ])
      ];
      this._domElement.appendChild(this._domHandles[0]);
      this._domElement.appendChild(this._domHandles[1]);
      CropMarksUI.__super__.mount.call(this, domParent, before);
      return this._fit(domParent);
    };

    CropMarksUI.prototype.region = function () {
      return [
        parseFloat(this._domHandles[0].style.top) / this._bounds[1],
        parseFloat(this._domHandles[0].style.left) / this._bounds[0],
        parseFloat(this._domHandles[1].style.top) / this._bounds[1],
        parseFloat(this._domHandles[1].style.left) / this._bounds[0]
      ];
    };

    CropMarksUI.prototype.unmount = function () {
      CropMarksUI.__super__.unmount.call(this);
      this._domClipper = null;
      this._domHandles = null;
      return this._domRulers = null;
    };

    CropMarksUI.prototype._addDOMEventListeners = function () {
      CropMarksUI.__super__._addDOMEventListeners.call(this);
      this._domHandles[0].addEventListener('mousedown', (function (_this) {
        return function (ev) {
          if (ev.button === 0) {
            return _this._startDrag(0, ev.clientY, ev.clientX);
          }
        };
      })(this));
      return this._domHandles[1].addEventListener('mousedown', (function (_this) {
        return function (ev) {
          if (ev.button === 0) {
            return _this._startDrag(1, ev.clientY, ev.clientX);
          }
        };
      })(this));
    };

    CropMarksUI.prototype._drag = function (top, left) {
      var height, minCrop, offsetLeft, offsetTop, width;
      if (this._dragging === null) {
        return;
      }
      ContentSelect.Range.unselectAll();
      offsetTop = top - this._draggingOrigin[1];
      offsetLeft = left - this._draggingOrigin[0];
      height = this._bounds[1];
      left = 0;
      top = 0;
      width = this._bounds[0];
      minCrop = Math.min(Math.min(ContentTools.MIN_CROP, height), width);
      if (this._dragging === 0) {
        height = parseInt(this._domHandles[1].style.top) - minCrop;
        width = parseInt(this._domHandles[1].style.left) - minCrop;
      } else {
        left = parseInt(this._domHandles[0].style.left) + minCrop;
        top = parseInt(this._domHandles[0].style.top) + minCrop;
      }
      offsetTop = Math.min(Math.max(top, offsetTop), height);
      offsetLeft = Math.min(Math.max(left, offsetLeft), width);
      this._domHandles[this._dragging].style.top = offsetTop + "px";
      this._domHandles[this._dragging].style.left = offsetLeft + "px";
      this._domRulers[this._dragging].style.top = offsetTop + "px";
      return this._domRulers[this._dragging].style.left = offsetLeft + "px";
    };

    CropMarksUI.prototype._fit = function (domParent) {
      var height, heightScale, left, ratio, rect, top, width, widthScale;
      rect = domParent.getBoundingClientRect();
      widthScale = rect.width / this._imageSize[0];
      heightScale = rect.height / this._imageSize[1];
      ratio = Math.min(widthScale, heightScale);
      width = ratio * this._imageSize[0];
      height = ratio * this._imageSize[1];
      left = (rect.width - width) / 2;
      top = (rect.height - height) / 2;
      this._domElement.style.width = width + "px";
      this._domElement.style.height = height + "px";
      this._domElement.style.top = top + "px";
      this._domElement.style.left = left + "px";
      this._domHandles[0].style.top = '0px';
      this._domHandles[0].style.left = '0px';
      this._domHandles[1].style.top = height + "px";
      this._domHandles[1].style.left = width + "px";
      this._domRulers[0].style.top = '0px';
      this._domRulers[0].style.left = '0px';
      this._domRulers[1].style.top = height + "px";
      this._domRulers[1].style.left = width + "px";
      return this._bounds = [
        width,
        height
      ];
    };

    CropMarksUI.prototype._startDrag = function (handleIndex, top, left) {
      var domHandle;
      domHandle = this._domHandles[handleIndex];
      this._dragging = handleIndex;
      this._draggingOrigin = [
        left - parseInt(domHandle.style.left),
        top - parseInt(domHandle.style.top)
      ];
      this._onMouseMove = (function (_this) {
        return function (ev) {
          return _this._drag(ev.clientY, ev.clientX);
        };
      })(this);
      document.addEventListener('mousemove', this._onMouseMove);
      this._onMouseUp = (function (_this) {
        return function (ev) {
          return _this._stopDrag();
        };
      })(this);
      return document.addEventListener('mouseup', this._onMouseUp);
    };

    CropMarksUI.prototype._stopDrag = function () {
      document.removeEventListener('mousemove', this._onMouseMove);
      document.removeEventListener('mouseup', this._onMouseUp);
      this._dragging = null;
      return this._draggingOrigin = null;
    };

    return CropMarksUI;

  })(ContentTools.AnchoredComponentUI);

}).call(this);
