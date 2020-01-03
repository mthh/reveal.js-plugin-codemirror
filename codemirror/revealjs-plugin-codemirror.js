/**
* Reveal.js-plugin-codemirror (https://github.com/mthh/reveal.js-plugin-codemirror)
* MIT licensed - Copyright (C) 2019 Matthieu Viry
*
*/
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

const RevealCodeMirror = window.RevealCodeMirror || (function() {
  const config = Reveal.getConfig().codemirrorHighlight || {};
  const version = config.version || '5';
  const default_lang = config.default_lang || 'javascript';
  const theme_name = config.theme;
  const urls_base_jsdelivr = [
    `https://cdn.jsdelivr.net/npm/codemirror@${version}/lib/codemirror.css`,
    `https://cdn.jsdelivr.net/combine/npm/codemirror@${version},npm/codemirror@${version}/addon/runmode/runmode-standalone.js`,
  ];
  const urls_base_local = [
    `lib/codemirror.js`,
    `addon/runmode/runmode-standalone.js`,
    `lib/codemirror.css`,
  ];
  const get_url_lang_jsdelivr = (lang) => `npm/codemirror@${version}/mode/${lang}/${lang}.js`;

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

  const cb = function(filename) {
    files_to_load[filename] = true;
    if (Object.values(files_to_load).every(v => v === true)) {
      highlight_content(default_lang, theme_name);
    }
  };

  const langs = get_used_languages(default_lang);
  const files_to_load = {};
  if (!config.path) {
    langs.forEach((l) => {
      urls_base_jsdelivr[1] += `,${get_url_lang_jsdelivr(l)}`
    });
    urls_base = urls_base_jsdelivr;
    if (theme_name !== 'default') {
      urls_base.push(`https://cdn.jsdelivr.net/npm/codemirror@${version}/theme/${theme_name}.css`);
    }
    urls_base.forEach((url) => {
      files_to_load[url] = false;
      loadjscssfile(url)
        .then(cb);
    });
  } else {
    urls_base_local.forEach((u, i) => {
      urls_base_local[i] = `${config.path}${u}`;
    });
    langs.forEach((l) => {
      urls_base_local.push(`${config.path}mode/${l}/${l}.js`);
    });
    urls_base = urls_base_local;
    if (theme_name !== 'default') {
      urls_base.push(`${config.path}theme/${theme_name}.css`);
    }
    files_to_load[urls_base[0]] = true;
    loadjscssfile(urls_base[0])
      .then(() => {
        urls_base.splice(1)
          .forEach((url) => {
            files_to_load[url] = false;
            loadjscssfile(url)
              .then(cb);
          });
      });
  }
  return this;
})();
