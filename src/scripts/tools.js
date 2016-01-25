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

  ContentTools.ToolShelf = (function () {
    function ToolShelf() {}

    ToolShelf._tools = {};

    ToolShelf.stow = function (cls, name) {
      return this._tools[name] = cls;
    };

    ToolShelf.fetch = function (name) {
      if (!this._tools[name]) {
        throw new Error("`" + name + "` has not been stowed on the tool shelf");
      }
      return this._tools[name];
    };

    return ToolShelf;

  })();

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

  ContentTools.Tools.Bold = (function (superClass) {
    extend(Bold, superClass);

    function Bold() {
      return Bold.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Bold, 'bold');

    Bold.label = 'Bold';

    Bold.icon = 'bold';

    Bold.tagName = 'b';

    Bold.canApply = function (element, selection) {
      if (!element.content) {
        return false;
      }
      return selection && !selection.isCollapsed();
    };

    Bold.isApplied = function (element, selection) {
      var from, ref, to;
      if (element.content === void 0 || !element.content.length()) {
        return false;
      }
      ref = selection.get(), from = ref[0], to = ref[1];
      if (from === to) {
        to += 1;
      }
      return element.content.slice(from, to).hasTags(this.tagName, true);
    };

    Bold.apply = function (element, selection, callback) {
      var from, ref, to;
      element.storeState();
      ref = selection.get(), from = ref[0], to = ref[1];
      if (this.isApplied(element, selection)) {
        element.content = element.content.unformat(from, to, new HTMLString.Tag(this.tagName));
      } else {
        element.content = element.content.format(from, to, new HTMLString.Tag(this.tagName));
      }
      element.content.optimize();
      element.updateInnerHTML();
      element.taint();
      element.restoreState();
      return callback(true);
    };

    return Bold;

  })(ContentTools.Tool);

  ContentTools.Tools.Italic = (function (superClass) {
    extend(Italic, superClass);

    function Italic() {
      return Italic.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Italic, 'italic');

    Italic.label = 'Italic';

    Italic.icon = 'italic';

    Italic.tagName = 'i';

    return Italic;

  })(ContentTools.Tools.Bold);

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
      dialog.position([
        rect.left + (rect.width / 2) + window.scrollX,
        rect.top + (rect.height / 2) + window.scrollY
      ]);
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
      
      return dialog.show();
    };

    return Link;

  })(ContentTools.Tools.Bold);

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

  ContentTools.Tools.Subheading = (function (superClass) {
    extend(Subheading, superClass);

    function Subheading() {
      return Subheading.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Subheading, 'subheading');

    Subheading.label = 'Subheading';

    Subheading.icon = 'subheading';

    Subheading.tagName = 'h2';

    return Subheading;

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

  ContentTools.Tools.Preformatted = (function (superClass) {
    extend(Preformatted, superClass);

    function Preformatted() {
      return Preformatted.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Preformatted, 'preformatted');

    Preformatted.label = 'Preformatted';

    Preformatted.icon = 'preformatted';

    Preformatted.tagName = 'pre';

    Preformatted.apply = function (element, selection, callback) {
      var insertAt, parent, preText, text;
      text = element.content.text();
      preText = new ContentEdit.PreText('pre', {}, HTMLString.String.encode(text));
      parent = element.parent();
      insertAt = parent.children.indexOf(element);
      parent.detach(element);
      parent.attach(preText, insertAt);
      element.blur();
      preText.focus();
      preText.selection(selection);
      return callback(true);
    };

    return Preformatted;

  })(ContentTools.Tools.Heading);

  ContentTools.Tools.AlignLeft = (function (superClass) {
    extend(AlignLeft, superClass);

    function AlignLeft() {
      return AlignLeft.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(AlignLeft, 'align-left');

    AlignLeft.label = 'Align left';

    AlignLeft.icon = 'align-left';

    AlignLeft.className = 'text-left';

    AlignLeft.canApply = function (element, selection) {
      return element.content !== void 0;
    };

    AlignLeft.isApplied = function (element, selection) {
      var ref;
      if (!this.canApply(element)) {
        return false;
      }
      if ((ref = element.type()) === 'ListItemText' || ref === 'TableCellText') {
        element = element.parent();
      }
      return element.hasCSSClass(this.className);
    };

    AlignLeft.apply = function (element, selection, callback) {
      var className, j, len, ref, ref1;
      if ((ref = element.type()) === 'ListItemText' || ref === 'TableCellText') {
        element = element.parent();
      }
      ref1 = [
        'text-center',
        'text-left',
        'text-right'
      ];
      for (j = 0, len = ref1.length; j < len; j++) {
        className = ref1[j];
        if (element.hasCSSClass(className)) {
          element.removeCSSClass(className);
          if (className === this.className) {
            return callback(true);
          }
        }
      }
      element.addCSSClass(this.className);
      return callback(true);
    };

    return AlignLeft;

  })(ContentTools.Tool);

  ContentTools.Tools.AlignCenter = (function (superClass) {
    extend(AlignCenter, superClass);

    function AlignCenter() {
      return AlignCenter.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(AlignCenter, 'align-center');

    AlignCenter.label = 'Align center';

    AlignCenter.icon = 'align-center';

    AlignCenter.className = 'text-center';

    return AlignCenter;

  })(ContentTools.Tools.AlignLeft);

  ContentTools.Tools.AlignRight = (function (superClass) {
    extend(AlignRight, superClass);

    function AlignRight() {
      return AlignRight.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(AlignRight, 'align-right');

    AlignRight.label = 'Align right';

    AlignRight.icon = 'align-right';

    AlignRight.className = 'text-right';

    return AlignRight;

  })(ContentTools.Tools.AlignLeft);

  ContentTools.Tools.UnorderedList = (function (superClass) {
    extend(UnorderedList, superClass);

    function UnorderedList() {
      return UnorderedList.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(UnorderedList, 'unordered-list');

    UnorderedList.label = 'Bullet list';

    UnorderedList.icon = 'unordered-list';

    UnorderedList.listTag = 'ul';

    UnorderedList.canApply = function (element, selection) {
      var ref;
      return element.content !== void 0 && ((ref = element.parent().type()) === 'Region' || ref === 'ListItem');
    };

    UnorderedList.apply = function (element, selection, callback) {
      var insertAt, list, listItem, listItemText, parent;
      if (element.parent().type() === 'ListItem') {
        element.storeState();
        list = element.closest(function (node) {
          return node.type() === 'List';
        });
        list.tagName(this.listTag);
        element.restoreState();
      } else {
        listItemText = new ContentEdit.ListItemText(element.content.copy());
        listItem = new ContentEdit.ListItem();
        listItem.attach(listItemText);
        list = new ContentEdit.List(this.listTag, {});
        list.attach(listItem);
        parent = element.parent();
        insertAt = parent.children.indexOf(element);
        parent.detach(element);
        parent.attach(list, insertAt);
        listItemText.focus();
        listItemText.selection(selection);
      }
      return callback(true);
    };

    return UnorderedList;

  })(ContentTools.Tool);

  ContentTools.Tools.OrderedList = (function (superClass) {
    extend(OrderedList, superClass);

    function OrderedList() {
      return OrderedList.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(OrderedList, 'ordered-list');

    OrderedList.label = 'Numbers list';

    OrderedList.icon = 'ordered-list';

    OrderedList.listTag = 'ol';

    return OrderedList;

  })(ContentTools.Tools.UnorderedList);

  ContentTools.Tools.Table = (function (superClass) {
    extend(Table, superClass);

    function Table() {
      return Table.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Table, 'table');

    Table.label = 'Table';

    Table.icon = 'table';

    Table.canApply = function (element, selection) {
      return element !== void 0;
    };

    Table.apply = function (element, selection, callback) {
      var app, dialog, modal, table;
      if (element.storeState) {
        element.storeState();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI();
      table = element.closest(function (node) {
        return node && node.type() === 'Table';
      });
      dialog = new ContentTools.TableDialog(table);
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
        return function (tableCfg) {
          var index, keepFocus, node, ref;
          dialog.unbind('save');
          keepFocus = true;
          if (table) {
            _this._updateTable(tableCfg, table);
            keepFocus = element.closest(function (node) {
              return node && node.type() === 'Table';
            });
          } else {
            table = _this._createTable(tableCfg);
            ref = _this._insertAt(element), node = ref[0], index = ref[1];
            node.parent().attach(table, index);
            keepFocus = false;
          }
          if (keepFocus) {
            element.restoreState();
          } else {
            table.firstSection().children[0].children[0].children[0].focus();
          }
          modal.hide();
          dialog.hide();
          return callback(true);
        };
      })(this));
      app.attach(modal);
      app.attach(dialog);
      modal.show();
      return dialog.show();
    };

    Table._adjustColumns = function (section, columns) {
      var cell, cellTag, cellText, currentColumns, diff, i, j, len, ref, results, row;
      ref = section.children;
      results = [
      ];
      for (j = 0, len = ref.length; j < len; j++) {
        row = ref[j];
        cellTag = row.children[0].tagName();
        currentColumns = row.children.length;
        diff = columns - currentColumns;
        if (diff < 0) {
          results.push((function () {
            var k, ref1, results1;
            results1 = [
            ];
            for (i = k = ref1 = diff; ref1 <= 0 ? k < 0 : k > 0; i = ref1 <= 0 ? ++k : --k) {
              cell = row.children[row.children.length - 1];
              results1.push(row.detach(cell));
            }
            return results1;
          })());
        } else if (diff > 0) {
          results.push((function () {
            var k, ref1, results1;
            results1 = [
            ];
            for (i = k = 0, ref1 = diff; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
              cell = new ContentEdit.TableCell(cellTag);
              row.attach(cell);
              cellText = new ContentEdit.TableCellText('');
              results1.push(cell.attach(cellText));
            }
            return results1;
          })());
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Table._createTable = function (tableCfg) {
      var body, foot, head, table;
      table = new ContentEdit.Table();
      if (tableCfg.head) {
        head = this._createTableSection('thead', 'th', tableCfg.columns);
        table.attach(head);
      }
      body = this._createTableSection('tbody', 'td', tableCfg.columns);
      table.attach(body);
      if (tableCfg.foot) {
        foot = this._createTableSection('tfoot', 'td', tableCfg.columns);
        table.attach(foot);
      }
      return table;
    };

    Table._createTableSection = function (sectionTag, cellTag, columns) {
      var cell, cellText, i, j, ref, row, section;
      section = new ContentEdit.TableSection(sectionTag);
      row = new ContentEdit.TableRow();
      section.attach(row);
      for (i = j = 0, ref = columns; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        cell = new ContentEdit.TableCell(cellTag);
        row.attach(cell);
        cellText = new ContentEdit.TableCellText('');
        cell.attach(cellText);
      }
      return section;
    };

    Table._updateTable = function (tableCfg, table) {
      var columns, foot, head, j, len, ref, section;
      if (!tableCfg.head && table.thead()) {
        table.detach(table.thead());
      }
      if (!tableCfg.foot && table.tfoot()) {
        table.detach(table.tfoot());
      }
      columns = table.firstSection().children[0].children.length;
      if (tableCfg.columns !== columns) {
        ref = table.children;
        for (j = 0, len = ref.length; j < len; j++) {
          section = ref[j];
          this._adjustColumns(section, tableCfg.columns);
        }
      }
      if (tableCfg.head && !table.thead()) {
        head = this._createTableSection('thead', 'th', tableCfg.columns);
        table.attach(head);
      }
      if (tableCfg.foot && !table.tfoot()) {
        foot = this._createTableSection('tfoot', 'td', tableCfg.columns);
        return table.attach(foot);
      }
    };

    return Table;

  })(ContentTools.Tool);

  ContentTools.Tools.Indent = (function (superClass) {
    extend(Indent, superClass);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Indent, 'indent');

    Indent.label = 'Indent';

    Indent.icon = 'indent';

    Indent.canApply = function (element, selection) {
      return element.parent().type() === 'ListItem' && element.parent().parent().children.indexOf(element.parent()) > 0;
    };

    Indent.apply = function (element, selection, callback) {
      element.parent().indent();
      return callback(true);
    };

    return Indent;

  })(ContentTools.Tool);

  ContentTools.Tools.Unindent = (function (superClass) {
    extend(Unindent, superClass);

    function Unindent() {
      return Unindent.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Unindent, 'unindent');

    Unindent.label = 'Unindent';

    Unindent.icon = 'unindent';

    Unindent.canApply = function (element, selection) {
      return element.parent().type() === 'ListItem';
    };

    Unindent.apply = function (element, selection, callback) {
      element.parent().unindent();
      return callback(true);
    };

    return Unindent;

  })(ContentTools.Tool);

  ContentTools.Tools.LineBreak = (function (superClass) {
    extend(LineBreak, superClass);

    function LineBreak() {
      return LineBreak.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(LineBreak, 'line-break');

    LineBreak.label = 'Line break';

    LineBreak.icon = 'line-break';

    LineBreak.canApply = function (element, selection) {
      return element.content;
    };

    LineBreak.apply = function (element, selection, callback) {
      var br, cursor, tail, tip;
      cursor = selection.get()[0] + 1;
      tip = element.content.substring(0, selection.get()[0]);
      tail = element.content.substring(selection.get()[1]);
      br = new HTMLString.String('<br>', element.content.preserveWhitespace());
      element.content = tip.concat(br, tail);
      element.updateInnerHTML();
      element.taint();
      selection.set(cursor, cursor);
      element.selection(selection);
      return callback(true);
    };

    return LineBreak;

  })(ContentTools.Tool);

  ContentTools.Tools.Image = (function (superClass) {
    extend(Image, superClass);

    function Image() {
      return Image.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Image, 'image');

    Image.label = 'Image';

    Image.icon = 'image';

    Image.canApply = function (element, selection) {
      return true;
    };

    Image.apply = function (element, selection, callback) {
      var app, dialog, modal;
      if (element.storeState) {
        element.storeState();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI();
      dialog = new ContentTools.ImageDialog();
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
        return function (imageURL, imageSize, imageAttrs) {
          var image, index, node, ref;
          dialog.unbind('save');
          if (!imageAttrs) {
            imageAttrs = {};
          }
          imageAttrs.height = imageSize[1];
          imageAttrs.src = imageURL;
          imageAttrs.width = imageSize[0];
          image = new ContentEdit.Image(imageAttrs);
          ref = _this._insertAt(element), node = ref[0], index = ref[1];
          node.parent().attach(image, index);
          image.focus();
          modal.hide();
          dialog.hide();
          return callback(true);
        };
      })(this));
      app.attach(modal);
      app.attach(dialog);
      modal.show();
      return dialog.show();
    };

    return Image;

  })(ContentTools.Tool);

  ContentTools.Tools.Video = (function (superClass) {
    extend(Video, superClass);

    function Video() {
      return Video.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Video, 'video');

    Video.label = 'Video';

    Video.icon = 'video';

    Video.canApply = function (element, selection) {
      return true;
    };

    Video.apply = function (element, selection, callback) {
      var app, dialog, modal;
      if (element.storeState) {
        element.storeState();
      }
      app = ContentTools.EditorApp.get();
      modal = new ContentTools.ModalUI();
      dialog = new ContentTools.VideoDialog();
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
              'height': ContentTools.DEFAULT_VIDEO_HEIGHT,
              'src': videoURL,
              'width': ContentTools.DEFAULT_VIDEO_WIDTH
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

    return Video;

  })(ContentTools.Tool);

  ContentTools.Tools.Undo = (function (superClass) {
    extend(Undo, superClass);

    function Undo() {
      return Undo.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Undo, 'undo');

    Undo.label = 'Undo';

    Undo.icon = 'undo';

    Undo.canApply = function (element, selection) {
      var app;
      app = ContentTools.EditorApp.get();
      return app.history && app.history.canUndo();
    };

    Undo.apply = function (element, selection, callback) {
      var app, snapshot;
      app = ContentTools.EditorApp.get();
      app.history.stopWatching();
      snapshot = app.history.undo();
      app.revertToSnapshot(snapshot);
      return app.history.watch();
    };

    return Undo;

  })(ContentTools.Tool);

  ContentTools.Tools.Redo = (function (superClass) {
    extend(Redo, superClass);

    function Redo() {
      return Redo.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Redo, 'redo');

    Redo.label = 'Redo';

    Redo.icon = 'redo';

    Redo.canApply = function (element, selection) {
      var app;
      app = ContentTools.EditorApp.get();
      return app.history && app.history.canRedo();
    };

    Redo.apply = function (element, selection, callback) {
      var app, snapshot;
      app = ContentTools.EditorApp.get();
      app.history.stopWatching();
      snapshot = app.history.redo();
      app.revertToSnapshot(snapshot);
      return app.history.watch();
    };

    return Redo;

  })(ContentTools.Tool);

  ContentTools.Tools.Remove = (function (superClass) {
    extend(Remove, superClass);

    function Remove() {
      return Remove.__super__.constructor.apply(this, arguments);
    }

    ContentTools.ToolShelf.stow(Remove, 'remove');

    Remove.label = 'Remove';

    Remove.icon = 'remove';

    Remove.canApply = function (element, selection) {
      return true;
    };

    Remove.apply = function (element, selection, callback) {
      var app, list, row, table;
      app = ContentTools.EditorApp.get();
      element.blur();
      if (element.nextContent()) {
        element.nextContent().focus();
      } else if (element.previousContent()) {
        element.previousContent().focus();
      }
      switch (element.type()) {
        case 'ListItemText':
          if (app.ctrlDown()) {
            list = element.closest(function (node) {
              return node.parent().type() === 'Region';
            });
            list.parent().detach(list);
          } else {
            element.parent().parent().detach(element.parent());
          }
          break;
        case 'TableCellText':
          if (app.ctrlDown()) {
            table = element.closest(function (node) {
              return node.type() === 'Table';
            });
            table.parent().detach(table);
          } else {
            row = element.parent().parent();
            row.parent().detach(row);
          }
          break;
        default:
          element.parent().detach(element);
          break;
      }
      return callback(true);
    };

    return Remove;

  })(ContentTools.Tool);
})();