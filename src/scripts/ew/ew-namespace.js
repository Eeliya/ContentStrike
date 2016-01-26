/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// Generated by CoffeeScript 1.10.0
(function () {
  window.ContentTools = {
    Tools: {},
    DEFAULT_TOOLS: [
      [
        'bold',
        'italic',
        'link',
        'align-left',
        'align-center',
        'align-right'
      ],
      [
        'heading',
        'heading2',        
        'paragraph',
        'link-block',
        'unordered-list',
        'ordered-list',
        'table',
        'indent',
        'unindent',
        'line-break'
      ],
      [
        //'image-link',
        'ew-media',
        'image',
        'video',
        'preformatted',
        'content-field'
      ],
      [
        'undo',
        'redo',
        'remove'
      ]
    ],
    DEFAULT_VIDEO_HEIGHT: 300,
    DEFAULT_VIDEO_WIDTH: 400,
    HIGHLIGHT_HOLD_DURATION: 2000,
    INSPECTOR_IGNORED_ELEMENTS: [
      'ListItemText',
      'Region',
      'TableCellText'
    ],
    IMAGE_UPLOADER: null,
    MIN_CROP: 10,
    RESTRICTED_ATTRIBUTES: {
      'img': [
        'height',
        'src',
        'width',
        'data-ce-max-width',
        'data-ce-min-width'
      ],
      'iframe': [
        'height',
        'width'
      ]
    },
    getEmbedVideoURL: function (url) {
      var domains, i, id, kv, len, m, netloc, params, paramsStr, parser, path, ref;
      domains = {
        'www.youtube.com': 'youtube',
        'youtu.be': 'youtube',
        'vimeo.com': 'vimeo',
        'player.vimeo.com': 'vimeo'
      };
      parser = document.createElement('a');
      parser.href = url;
      netloc = parser.hostname.toLowerCase();
      path = parser.pathname;
      if (path !== null && path.substr(0, 1) !== "/") {
        path = "/" + path;
      }
      params = {};
      paramsStr = parser.search.slice(1);
      ref = paramsStr.split('&');
      for (i = 0, len = ref.length; i < len; i++) {
        kv = ref[i];
        kv = kv.split("=");
        params[kv[0]] = kv[1];
      }
      switch (domains[netloc]) {
        case 'youtube':
          if (path.toLowerCase() === '/watch') {
            if (!params['v']) {
              return null;
            }
            id = params['v'];
          } else {
            m = path.match(/\/([A-Za-z0-9_-]+)$/i);
            if (!m) {
              return null;
            }
            id = m[1];
          }
          return "https://www.youtube.com/embed/" + id;
        case 'vimeo':
          m = path.match(/\/(\w+\/\w+\/){0,1}(\d+)/i);
          if (!m) {
            return null;
          }
          return "https://player.vimeo.com/video/" + m[2];
      }
      return null;
    }
  };

}).call(this);
