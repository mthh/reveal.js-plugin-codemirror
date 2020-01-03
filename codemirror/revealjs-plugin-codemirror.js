/**
* Reveal.js-plugin-codemirror (https://github.com/mthh/reveal.js-plugin-codemirror)
* MIT licensed - Copyright (C) 2019 Matthieu Viry
*
*/
const loadjscssfile = (filename, callback) => new Promise((resolve, reject) => {
  let fileref;
  if (filename.endsWith('js')) {
    fileref = document.createElement('script');
    fileref.setAttribute('type', 'text/javascript');
    fileref.setAttribute('src', filename);
  }
  else if (filename.endsWith('css')) {
    fileref = document.createElement('link');
    fileref.setAttribute('rel', 'stylesheet');
    fileref.setAttribute('type', 'text/css');
    fileref.setAttribute('href', filename);
  }
  if (typeof fileref != 'undefined') {
    document.getElementsByTagName('head')[0].appendChild(fileref);
    fileref.onload = () => resolve(filename);
  };
});

const get_used_languages = (default_lang) => {
  const langs = [default_lang]
  document.querySelectorAll('pre > code[class]')
    .forEach((el) => {
      let lang = Array.from(el.classList)
        .filter((el) => el.indexOf('language-') > -1)
        .map(el => el.replace('language-', ''));
      if (lang.length > 0 && lang[0] !== default_lang) {
        langs.push(lang);
      }
    });
  return langs;
};

const highlight_content = (default_lang, theme_name) => {
  document.querySelectorAll('pre > code')
    .forEach((el) => {
      let code_content = el.textContent;
      let lang = Array.from(el.classList)
        .filter((el) => el.indexOf('language-') > -1)
        .map(el => el.replace('language-', ''));
      lang = lang.length > 0 ? lang[0] : default_lang;
      el.className = `CodeMirror cm-s-${theme_name}`;
      CodeMirror.runMode(code_content, lang, el);
    });
};

const addStyleString = (cssRules) => {
  const node = document.createElement('style');
  node.innerHTML = cssRules;
  document.body.appendChild(node);
};

const cleanPathCM = (p) => {
  if (typeof p !== 'string') {
    return null;
  } else {
    if (p === '') return p;
    else if (p.endsWith('/')) return p;
    else return p + '/';
  }
}

const RevealCodeMirror = window.RevealCodeMirror || (function() {
  // Retrieve the options given by the caller
  const config = Reveal.getConfig().codemirrorHighlight || {};
  const version = config.version || '5';
  const default_lang = config.default_lang || 'javascript';
  const theme_name = config.theme;
  const path = cleanPathCM(config.path);
  const strategy = !!path ? 'customPath' : 'JsDeliver';

  // Inject CSS rule to override the height of the code element
  // as defined by CodeMirror
  addStyleString('.reveal code.CodeMirror { height: unset !important; }');

  // Container for the URL of the various files to be fetched
  const urls_base = [];
  // Store whether each requested file finished loading or not
  const files_to_load = {};
  // Parse the content of the slides a first time to detect the language in use
  const langs = get_used_languages(default_lang);

  // Callback executed for each file, when loading is finished
  // in order to decide if when can actually use CodeMirror
  // and highlight our code elements
  const cb = (filename) => {
    files_to_load[filename] = true;
    if (Object.values(files_to_load).every(v => v === true)) {
      highlight_content(default_lang, theme_name);
    }
  };

  if (strategy === 'customPath') {
    // We are using the path provided by the user,
    // it could be a path to a locally hosted version of codemirror
    // or the path to a CDN
    [
      `lib/codemirror.js`,
      `addon/runmode/runmode-standalone.js`,
      `lib/codemirror.css`,
    ].forEach((u, i) => {
      urls_base[i] = `${config.path}${u}`;
    });
    langs.forEach((l) => {
      urls_base.push(`${config.path}mode/${l}/${l}.js`);
    });
    if (theme_name !== 'default') {
      urls_base.push(`${config.path}theme/${theme_name}.css`);
    }
    // Load the lib/codemirror.js file first to ensure its present
    // when language files are loaded
    loadjscssfile(urls_base[0])
      .then(() => {
        urls_base.splice(1)
          .forEach((url) => {
            if (url.endsWith('js')) {
              files_to_load[url] = false;
            }
            // Load each file, and actually parse and highlight
            // the content of the `code` elements only when
            // all the js files are loaded
            loadjscssfile(url)
              .then(cb);
          });
      });
  } else if (strategy === 'JsDeliver') {
    urls_base.push(`https://cdn.jsdelivr.net/npm/codemirror@${version}/lib/codemirror.css`);
    urls_base.push(`https://cdn.jsdelivr.net/combine/npm/codemirror@${version},npm/codemirror@${version}/addon/runmode/runmode-standalone.js`);
    //  We are gonna use JsDeliver `combine` ---^
    // functionnality and append the other files needed at the end of this URL
    langs.forEach((lang) => {
      urls_base[1] += `,npm/codemirror@${version}/mode/${lang}/${lang}.js`
    });
    if (theme_name !== 'default') {
      urls_base.push(`https://cdn.jsdelivr.net/npm/codemirror@${version}/theme/${theme_name}.css`);
    }
    urls_base.forEach((url) => {
      if (url.endsWith('js')) {
        files_to_load[url] = false;
      }
      // Load each file, and actually parse and highlight
      // the content of the `code` elements only when
      // all the js files are loaded
      loadjscssfile(url)
        .then(cb);
    });
  }
  return this;
})();
