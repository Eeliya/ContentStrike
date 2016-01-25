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

  ContentTools.Tools.HeadingThree = (function (superClass) {
    extend(HeadingThree, superClass);

    function HeadingThree() {
      return HeadingThree.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(HeadingThree, 'heading3');

    HeadingThree.label = 'Subheading';
    HeadingThree.icon = 'heading-3';
    HeadingThree.tagName = 'h3';

    return HeadingThree;

  })(ContentTools.Tools.Heading);

  ContentTools.Tools.ContentFiels = (function (superClass) {
    extend(ContentField, superClass);

    function ContentField() {

      return ContentField.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(ContentField, 'content-field');

    ContentField.label = 'Content Field';
    ContentField.icon = 'content-field';

    ContentEdit.Root.get().bind('mount', function (element) {
      if (element.attr("content-field")) {
        addContentFieldBar(element, element.attr("content-field"));
      }
    });

    ContentEdit.Root.get().bind('unmount', function (element) {
      if (element._contentField && element._contentField.parentNode) {
        element._contentField.parentNode.removeChild(element._contentField);
      }
    });

    var addContentFieldBar = function (element, initValue) {
      var container = document.createElement("span"),
        input = document.createElement("input"),
        removeButton = document.createElement("div"),
        title = document.createElement("p");

      container.className = "ew-content-field__bar";
      container.setAttribute("contenteditable", false);
      title.className = "ew-content-field__title";
      input.className = "ew-content-field__input";
      input.value = element.attr("content-field");
      removeButton.className = "ew-content-field__remove";

      container.appendChild(input);
      container.appendChild(removeButton);

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
          var id = "content-field-" + new Date().getTime();
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
      element.addCSSClass("ew-content-field");

      container.style.position = "absolute";
      var app = ContentTools.EditorApp.get();
      app._contentContainer.appendChild(container);

      var parentRect = app._contentContainer.getBoundingClientRect(),
        rect = element._domElement.getBoundingClientRect();

      container.style.top = rect.top - parentRect.top + "px";
      container.style.left = rect.left - parentRect.left + "px";
      container.style.width = rect.width + "px";

      /*ContentEdit.Root.get().bind('update-position', function () {
       parentRect = app._contentContainer.getBoundingClientRect();
       rect = element._domElement.getBoundingClientRect();
       container.style.top = rect.top - parentRect.top + "px";
       container.style.left = rect.left - parentRect.left + "px";
       container.style.width = rect.width + "px";
       });*/

      var oldRect = {};
      var cache = {};
      var updatePosition = function () {
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
            updatePosition();
          }
        }, 100);

      };

      updatePosition();

      /*ContentEdit.Root.get().bind('region-ready', function () {
       parentRect = app._contentContainer.getBoundingClientRect();
       rect = element._domElement.getBoundingClientRect();
       container.style.top = rect.top - parentRect.top + "px";
       container.style.left = rect.left - parentRect.left + "px";
       container.style.width = rect.width + "px";
       //console.log("dom ready", element);
       //console.log(app._contentContainer.innerHTML);
       });*/

      element._contentField = container;

      return input;
    };

    ContentField.canApply = function (element, selection) {
      return element.content !== void 0 && element.parent().constructor.name === 'Region';
    };

    //var oldContentField = null;
    ContentField.apply = function (element, selection, callback) {
      if (element.attr("content-field")) {

      } else {
        addContentFieldBar(element, "").focus();
      }
    };

    ContentField.isApplied = function (element, selection) {
      return element.attr("content-field") ? true : false;
    };

    return ContentField;

  })(ContentTools.Tool);

  /*ContentTools.Tools.Link = (function (superClass) {
   extend(Link, superClass);
   
   function Link() {
   return Link.__super__.constructor.apply(this, arguments);
   }
   
   ContentTools.ToolShelf.stow(Link, 'link');
   
   Link.label = 'Link';
   
   Link.icon = 'link';
   
   Link.tagName = 'a';
   
   Link.getHref = function (element, selection) {
   var c, from, j, k, len, len1, ref, ref1, ref2, selectedContent, tag, to;
   if (element.constructor.name === 'Image') {
   if (element.a) {
   return element.a.href;
   }
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
   return tag.attr('href');
   }
   }
   }
   }
   return '';
   };
   
   Link.canApply = function (element, selection) {
   if (element.constructor.name === 'Image') {
   return true;
   } else {
   return Link.__super__.constructor.canApply.call(this, element, selection);
   }
   };
   
   Link.isApplied = function (element, selection) {
   if (element.constructor.name === 'Image') {
   return element.a;
   } else {
   return Link.__super__.constructor.isApplied.call(this, element, selection);
   }
   };
   
   Link.apply = function (element, selection, callback) {
   var allowScrolling, app, applied, dialog, domElement, from, measureSpan, modal, rect, ref, selectTag, to, transparent;
   applied = false;
   if (element.constructor.name === 'Image') {
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
   dialog = new ContentTools.LinkDialog(this.getHref(element, selection));
   
   
   dialog.bind('save', function (href) {
   var a;
   dialog.unbind('save');
   applied = true;
   if (element.constructor.name === 'Image') {
   if (href) {
   element.a = {
   href: href
   };
   } else {
   element.a = null;
   }
   } else {
   element.content = element.content.unformat(from, to, 'a');
   if (href) {
   a = new HTMLString.Tag('a', {
   href: href
   });
   element.content = element.content.format(from, to, a);
   }
   element.updateInnerHTML();
   element.taint();
   }
   return modal.trigger('click');
   });
   app.attach(modal);
   
   modal.show();
   app.attach(dialog);
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
   
   })(ContentTools.Tools.Bold);*/

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
      } else {
        return Link.__super__.constructor.canApply.call(this, element, selection);
      }
    };

    Link.isApplied = function (element, selection) {
      if (element.type() === 'Image') {
        return element.a;
      } else {
        return Link.__super__.constructor.isApplied.call(this, element, selection);
      }
    };

    Link.apply = function (element, selection, callback) {
      var allowScrolling, app, applied, dialog, domElement, from, measureSpan, modal, rect, ref, selectTag, to, transparent;
      applied = false;
      if (element.type() === 'Image') {
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