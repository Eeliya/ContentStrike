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

  ContentTools.Tool = (function () {
    function Tool() {}

    Tool.label = 'Tool';

    Tool.icon = 'tool';

    Tool.canApply = function (element, selection) {
      return false;
    };

    Tool.isApplied = function (element, selection) {
      return false;
    };

    Tool.apply = function (element, selection, callback) {
      throw new Error('Not implemented');
    };

    Tool._insertAt = function (element) {
      var insertIndex, insertNode;
      insertNode = element;
      if (insertNode.parent().type() !== 'Region') {
        insertNode = element.closest(function (node) {
          return node.parent().type() === 'Region';
        });
      }
      insertIndex = insertNode.parent().children.indexOf(insertNode) + 1;
      return [
        insertNode,
        insertIndex
      ];
    };

    return Tool;

  })();

  ContentTools.Tools.Heading = (function (superClass) {
    extend(Heading, superClass);

    function Heading() {
      return Heading.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Heading, 'heading');

    Heading.label = 'Heading';

    Heading.icon = 'heading';

    Heading.tagName = 'h1';

    Heading.canApply = function (element, selection) {
      return element.content !== void 0 && element.parent().type() === 'Region';
    };

    Heading.isApplied = function (element, selection) {
      return element._tagName === this.tagName;
    };

    Heading.apply = function (element, selection, callback) {
      var content, insertAt, parent, textElement;
      element.storeState();
      if (element.type() === 'PreText') {
        content = element.content.html().replace(/&nbsp;/g, ' ');
        textElement = new ContentEdit.Text(this.tagName, {}, content);
        parent = element.parent();
        insertAt = parent.children.indexOf(element);
        parent.detach(element);
        parent.attach(textElement, insertAt);
        element.blur();
        textElement.focus();
        textElement.selection(selection);
      } else {
        element.tagName(this.tagName);
        element.restoreState();
      }
      return callback(true);
    };

    return Heading;

  })(ContentTools.Tool);

  ContentTools.Tools.HeadingTwo = (function (superClass) {
    extend(HeadingTwo, superClass);

    function HeadingTwo() {
      return HeadingTwo.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(HeadingTwo, 'heading2');

    HeadingTwo.label = 'Subheading';

    HeadingTwo.icon = 'heading-2';

    HeadingTwo.tagName = 'h2';

    return HeadingTwo;

  })(ContentTools.Tools.Heading);

  ContentTools.Tools.LinkBlock = (function (superClass) {
    extend(LinkBlock, superClass);

    function LinkBlock() {
      return LinkBlock.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(LinkBlock, 'link-block');

    LinkBlock.label = 'Link';
    LinkBlock.icon = 'link';
    LinkBlock.tagName = 'a';

    LinkBlock.canApply = function (element, selection) {
      return element._domElement.getElementsByTagName("a").length ? false : true;
    };

    LinkBlock.apply = function (element, selection, callback) {
      var content, insertAt, parent, textElement;
      element.storeState();
      if (element.type() === 'PreText') {
        content = element.content.html().replace(/&nbsp;/g, ' ');
        textElement = new HTMLString.Tag(this.tagName, {
          href: ""
        });
        parent = element.parent();
        insertAt = parent.children.indexOf(element);
        parent.detach(element);
        parent.attach(textElement, insertAt);
        element.blur();
        textElement.focus();
        textElement.selection(selection);
      } else {
        element.tagName(this.tagName);
        element.restoreState();
        ContentTools.Tools.Link.apply(element, selection, callback);
      }
      return callback(true);
    };

    return LinkBlock;
  })(ContentTools.Tools.Heading);

  ContentTools.Tools.Paragraph = (function (superClass) {
    extend(Paragraph, superClass);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Paragraph, 'paragraph');

    Paragraph.label = 'Paragraph';

    Paragraph.icon = 'paragraph';

    Paragraph.tagName = 'p';

    Paragraph.canApply = function (element, selection) {
      return element !== void 0;
    };

    Paragraph.apply = function (element, selection, callback) {
      var app, forceAdd, paragraph, region;
      app = ContentTools.EditorApp.get();
      forceAdd = app.ctrlDown();
      if (ContentTools.Tools.Heading.canApply(element) && !forceAdd) {
        return Paragraph.__super__.constructor.apply.call(this, element, selection, callback);
      } else {
        if (element.parent().type() !== 'Region') {
          element = element.closest(function (node) {
            return node.parent().type() === 'Region';
          });
        }
        region = element.parent();
        paragraph = new ContentEdit.Text('p');
        region.attach(paragraph, region.children.indexOf(element) + 1);
        paragraph.focus();
        return callback(true);
      }
    };

    return Paragraph;

  })(ContentTools.Tools.Heading);

// content-fields

  ContentTools.Tools.ContentFields = (function (superClass) {
    extend(ContentField, superClass);

    function ContentField() {
      return ContentField.__super__.constructor.apply(this, arguments);
    }

    var setImage = function (element, callback) {
      var app, forceAdd, paragraph, region;
      app = ContentTools.EditorApp.get();
      var imageChooserDialog = EW.createModal({
        autoOpen: false,
        class: "center"
      });
      //imageChooserDialog.append("<div class='form-content grid tabs-bar no-footer'></div>");
      $.post("~admin/html/content-management/link-chooser-media.php", {
        callback: ""
      }, function (data) {
        imageChooserDialog.html(data);
        //imageChooserDialog.prepend("<div class='header-pane tabs-bar row'><h1 class='form-title'>Media</h1></div>");
        var ref = ContentField._insertAt(element), node = ref[0], index = ref[1];
//        imageChooserDialog[0].selectMedia = function (image) {
//          var image = new ContentEdit.Image(image);
//          node.parent().attach(image, index);
//          node.parent().detach(element);
//          toContentField(image, element.attr('content-field'));
//          imageChooserDialog.dispose();
//        };
        imageChooserDialog[0].selectMedia = function (item) {
          var selectedItem = System.entity('services/media_chooser').selectItem(item);

          switch (selectedItem.type) {
            case 'text':
              var text = new ContentEdit.Text('p', {}, selectedItem.text);
              if (node.parent()) {
                node.parent().attach(text, index);
              } else {
                var firstRegion = app.orderedRegions()[0];
                firstRegion.attach(text, index);
              }
              toContentField(text, element.attr('content-field'));
              text.focus();

              break;

            case 'image':
              var image = new ContentEdit.Image({
                src: selectedItem,
                width: selectedItem.width,
                hight: selectedItem.height
              });
              if (node.parent()) {
                node.parent().attach(image, index);
              } else {
                var firstRegion = app.orderedRegions()[0];
                firstRegion.attach(image, index);
              }
              toContentField(image, element.attr('content-field'));
              image.focus();

              break;
          }

          imageChooserDialog.dispose();
        };
      });

      imageChooserDialog.open();
      //return callback(true);
    };

    ContentTools.ToolShelf.stow(ContentField, 'content-field');

    ContentField.label = 'Content Field';
    ContentField.icon = 'content-field';

    ContentEdit.Root.get().bind('mount', function (element) {
      if (element.attr("content-field")) {
        toContentField(element, element.attr("content-field"));
      }
    });

    ContentEdit.Root.get().bind('unmount', function (element) {
      if (element._contentField && element._contentField.element.parentNode) {
        element._contentField.element.parentNode.removeChild(element._contentField.element);
      }
    });

    var toContentField = function (element, initValue) {
      var container = document.createElement("span"),
              input = document.createElement("input"),
              removeButton = document.createElement("button"),
              img = document.createElement("button"),
              title = document.createElement("p");

      var ewContentField = {
        element: container,
        input: input,
        title: title
      };

      container.className = "ew-content-field__bar";
      container.setAttribute("contenteditable", false);
      title.className = "ew-content-field__title";
      input.className = "ew-content-field__input";
      input.value = element.attr("content-field");
      removeButton.className = "ew-content-field__remove btn btn-danger";
      img.className = 'ew-content-field__img-btn btn btn-default';
      img.innerHTML = 'M';
      img.type = 'button';

      container.appendChild(input);
      container.appendChild(removeButton);
      container.appendChild(img);

      img.addEventListener('click', function (e) {
        setImage(element);
      });

      input.addEventListener("keydown", function (e) {
        if (e.keyCode === 32) {
          e.preventDefault();
          e.target.value += '-';
        } else if (String.fromCharCode(e.keyCode).match(/[A-Z]/) && e.shiftKey) {
          e.preventDefault();
          e.target.value += String.fromCharCode(e.keyCode).toLowerCase();
        } else if (e.keyCode === 13) {
          e.preventDefault();
          input.blur();
          var l = element.content.length();
          element.selection(new ContentSelect.Range(l, l));
          element.focus();
        }
        e.stopPropagation();
      });

      input.addEventListener("blur", function (e) {
        if (!input.value) {
          var d = new Date();
          var id = "cf-" + d.getMinutes() + d.getSeconds() + d.getMilliseconds();
          input.value = id;
        }
        element.attr("content-field", input.value);

        e.preventDefault();
      });

      removeButton.addEventListener("click", function () {
        //oldContentField = element.attr("content-field");
        element.removeAttr("content-field");
        element.removeCSSClass("ew-content-field");
        container.parentNode.removeChild(container);
      });
      input.value = title.innerHTML = initValue;
      element.attr("content-field", initValue);
      element.addCSSClass("ew-content-field");

      container.style.position = "absolute";
      var app = ContentTools.EditorApp.get();
      app._contentContainer.appendChild(container);

      var parentRect = app._contentContainer.getBoundingClientRect(),
              rect = element._domElement.getBoundingClientRect();

      container.style.top = rect.top - parentRect.top + "px";
      container.style.left = rect.left - parentRect.left + "px";
      container.style.width = rect.width + "px";

      var oldRect = {};
      var cache = {};
      element.updatePosition = function () {
        cache = element._domElement.getBoundingClientRect();

        if (oldRect.left !== cache.left) {
          parentRect = app._contentContainer.getBoundingClientRect();
          container.style.left = cache.left - parentRect.left + "px";
          oldRect.left = cache.left - parentRect.left;
        }

        if (oldRect.width !== cache.width) {
          container.style.width = cache.width + "px";
          oldRect.width = cache.width;
        }

        if (oldRect.top !== cache.top + (app._contentContainer.scrollTop - parentRect.top)) {
          parentRect = app._contentContainer.getBoundingClientRect();
          container.style.top = cache.top + (app._contentContainer.scrollTop - parentRect.top) + "px";
          oldRect.top = cache.top + (app._contentContainer.scrollTop - parentRect.top);
        }

        setTimeout(function () {
          if (element._domElement && app._domElement) {
            element.updatePosition();
          }
        }, 100);

      };

      element.updatePosition();

      element._contentField = ewContentField;

      return input;
    };

    ContentField.canApply = function (element, selection) {
      return element.parent().constructor.name === 'Region';
    };

    //var oldContentField = null;
    ContentField.apply = function (element, selection, callback) {
      if (element.attr("content-field")) {

      } else {
        toContentField(element, "").focus();
      }
    };

    ContentField.isApplied = function (element, selection) {
      return element.attr("content-field") ? true : false;
    };

    return ContentField;

  })(ContentTools.Tool);

  ContentTools.Tools.EWMedia = (function (superClass) {
    extend(EWMedia, superClass);

    function EWMedia() {
      return EWMedia.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(EWMedia, 'ew-media');

    EWMedia.label = 'EW Media';

    EWMedia.icon = 'ew-media';

    EWMedia.tagName = 'p';

    EWMedia.canApply = function (element, selection) {
      return true;
    };

    EWMedia.apply = function (element, selection, callback) {
      var app, forceAdd, paragraph, region, _this = this;
      app = ContentTools.EditorApp.get();
      var imageChooserDialog = EW.createModal({
        autoOpen: false,
        class: "center"
      });
      //imageChooserDialog.append("<div class='form-content grid tabs-bar no-footer'></div>");
      $.post("~admin/html/content-management/link-chooser-media.php", {
        callback: ""
      }, function (data) {
        //imageChooserDialog.find(".form-content:first").append(data);
        //imageChooserDialog.prepend("<div class='header-pane tabs-bar row'><h1 class='form-title'>Media</h1></div>");
        imageChooserDialog.html(data);
        var ref = _this._insertAt(element), node = ref[0], index = ref[1];
        imageChooserDialog[0].selectMedia = function (item) {
          var element = System.entity('services/media_chooser').selectItem(item);

          switch (element.type) {
            case 'text':
              var text = new ContentEdit.Text('p', {}, element.text);
              if (node.parent()) {
                node.parent().attach(text, index);
              } else {
                var firstRegion = app.orderedRegions()[0];
                firstRegion.attach(text, index);
              }
              text.focus();

              break;

            case 'image':
              var image = new ContentEdit.Image({
                src: element.src,
                width: element.width,
                hight: element.height
              });
              if (node.parent()) {
                node.parent().attach(image, index);
              } else {
                var firstRegion = app.orderedRegions()[0];
                firstRegion.attach(image, index);
              }
              image.focus();

              break;
          }

          imageChooserDialog.dispose();
        };
      });

      imageChooserDialog.open();
      return callback(true);
    };

    return EWMedia;

  })(ContentTools.Tool);

  ContentTools.Tools.Link = (function (superClass) {
    extend(Link, superClass);

    function Link() {
      return Link.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Link, 'link');

    Link.label = 'Link';

    Link.icon = 'link';

    Link.tagName = 'a';

    Link.getAttr = function (attrName, element, selection) {
      var c, from, j, k, len, len1, ref, ref1, ref2, selectedContent, tag, to;
      if (element.type() === 'Image') {
        if (element.a) {
          return element.a[attrName];
        }
      } else if (element._tagName === "a") {
        return element.domElement()[attrName];
      } else {
        ref = selection.get(), from = ref[0], to = ref[1];
        selectedContent = element.content.slice(from, to);
        ref1 = selectedContent.characters;
        for (j = 0, len = ref1.length; j < len; j++) {
          c = ref1[j];
          if (!c.hasTags('a')) {
            continue;
          }
          ref2 = c.tags();
          for (k = 0, len1 = ref2.length; k < len1; k++) {
            tag = ref2[k];
            if (tag.name() === 'a') {
              return tag.attr(attrName);
            }
          }
        }
      }
      return '';
    };

    Link.canApply = function (element, selection) {
      if (element.type() === 'Image') {
        return true;
      } else if (element._tagName === "a") {
        return false;
      } else {
        return Link.__super__.constructor.canApply.call(this, element, selection);
      }
      return false;
    };

    Link.isApplied = function (element, selection) {
      if (element.type() === 'Image') {
        return element.a;
      } else if (element._tagName === "a") {
        return true;
      } else {
        return Link.__super__.constructor.isApplied.call(this, element, selection);
      }
    };

    Link.apply = function (element, selection, callback) {
      var allowScrolling, app, applied, dialog, domElement, from, measureSpan, modal, rect, ref, selectTag, to, transparent;
      applied = false;
      if (element.type() === 'Image') {
        rect = element.domElement().getBoundingClientRect();
      } else if (element._tagName === "a") {
        rect = element.domElement().getBoundingClientRect();
      } else {
        element.storeState();
        selectTag = new HTMLString.Tag('span', {
          'class': 'ct--puesdo-select'
        });
        ref = selection.get(), from = ref[0], to = ref[1];
        element.content = element.content.format(from, to, selectTag);
        element.updateInnerHTML();
        domElement = element.domElement();
        measureSpan = domElement.getElementsByClassName('ct--puesdo-select');
        rect = measureSpan[0].getBoundingClientRect();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI(transparent = true, allowScrolling = true);
      modal.bind('click', function () {
        this.unmount();
        dialog.hide();
        if (element.content) {
          element.content = element.content.unformat(from, to, selectTag);
          element.updateInnerHTML();
          element.restoreState();
        }
        return callback(applied);
      });
      dialog = new ContentTools.LinkDialog(this.getAttr('href', element, selection), this.getAttr('target', element, selection));
      /*dialog.position([
       rect.left + (rect.width / 2) + window.scrollX,
       rect.top + (rect.height / 2) + window.scrollY
       ]);*/
      dialog.bind('save', function (linkAttr) {
        var a, alignmentClassNames, className, j, k, len, len1, linkClasses;
        dialog.unbind('save');
        applied = true;
        if (element.type() === 'Image') {
          alignmentClassNames = [
            'align-center',
            'align-left',
            'align-right'
          ];
          if (linkAttr.href) {
            element.a = {
              href: linkAttr.href,
              target: linkAttr.target ? linkAttr.target : '',
              "class": element.a ? element.a['class'] : ''
            };
            for (j = 0, len = alignmentClassNames.length; j < len; j++) {
              className = alignmentClassNames[j];
              if (element.hasCSSClass(className)) {
                element.removeCSSClass(className);
                element.a['class'] = className;
                break;
              }
            }
          } else {
            linkClasses = [
            ];
            if (element.a['class']) {
              linkClasses = element.a['class'].split(' ');
            }
            for (k = 0, len1 = alignmentClassNames.length; k < len1; k++) {
              className = alignmentClassNames[k];
              if (linkClasses.indexOf(className) > -1) {
                element.addCSSClass(className);
                break;
              }
            }
            element.a = null;
          }
          element.unmount();
          element.mount();
        } else if (element._tagName === "a") {
          element.attr("href", linkAttr.href);
          element.attr("target", linkAttr.target);
        } else {
          element.content = element.content.unformat(from, to, 'a');
          if (linkAttr.href) {
            a = new HTMLString.Tag('a', linkAttr);
            element.content = element.content.format(from, to, a);
            element.content.optimize();
          }
          element.updateInnerHTML();
        }
        element.taint();
        return modal.trigger('click');
      });
      app.attach(modal);
      app.attach(dialog);
      modal.show();
      dialog.show();
      var containerRect = app._editorContainer.getBoundingClientRect();
      var dialogRect = dialog._domElement.getBoundingClientRect();
      var x = (rect.left + (rect.width / 2)) - containerRect.left - (dialogRect.width / 2),
              y = rect.top - containerRect.top;
      dialog.position([
        x > 0 ? x : 0,
        y > 0 ? y : 0
      ]);
      return true;
    };

    return Link;

  })(ContentTools.Tools.Bold);

})(this);