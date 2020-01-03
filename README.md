## reveal.js-plugin-codemirror

*Enjoy a nice syntax highlighting for languages not supported by highlight.js on your reveal.js slides !*

### Installation

Simply place the content of the `codemirror`-directory within the reveal.js `plugin` directory.

This plugin it juste a wrapper to call `CodeMirror.runMode` and doesn't contain any code from `CodeMirror`.

Two options are provided in order to fetch the appropriate `CodeMirror` modules, using a CDN (*JsDelivr*) or providing the path to theses modules (it allows to host theses files locally, or to use another CDN).

### Usage
- Just use this plugin instead of the `highlight.js` plugin :

```js
Reveal.initialize({
  codemirrorHighlight: {
     // The default language,
     // for fenced code block (or `code` elements) without language identifier
     // (default: 'javascript')
    default_lang: 'turtle',
    // A specific CodeMirror theme to use (default: 'default')
    theme: 'zenburn',
    // The version number of CodeMirror to use
    // if using the CDN strategy
    // (default: 5, not used if `path` option is provided)
    version: '5.50.2',
    // A path to reach CodeMirror `lib`, `addon`, `theme`, etc. folders
    // to fetch the appropriate modules needed
    // (default: undefined, mandatory to avoid using the default CDN)
    path: '/codemirror/',
  },
  dependencies: [
    { src: 'plugin/codemirror/revealjs-plugin-codemirror.js' },
    ...
  ],
  ...
});
```

- It's now possible to use fenced code block within the markdown of the presentation and to get the code highlighted by CodeMirror.

``````html
  <section data-markdown class="table-slide big-table">
    <textarea data-template>
## Slide with markdown content and code in the default language

```
function ItWorks() {
  return 'It works !'
}
```
    </textarea>
  </section>
  <section data-markdown class="table-slide big-table">
    <textarea data-template>
## Slide with markdown content and code in another language

```turtle
ex:AliceInWonderland a ex:Book ;
  ex:title "Alice in Wonderland"@en ;
  ex:author "Lewis Carroll" ;
	ex:datePublished "1865-11-26"^^xsd:date .
```
    </textarea>
  </section>
``````

- It also works for `html` slides with code inside `pre > code` elements :

```html
  <section>
    <h2>Slide with html content and code in another language</h2

    <pre>
      <code class="language-turtle">
      ex:AliceInWonderland a ex:Book ;
        ex:title "Alice in Wonderland"@en ;
        ex:author "Lewis Carroll" ;
      	ex:datePublished "1865-11-26"^^xsd:date .
      </code>
    </pre>
  </section>
```


### License

MIT licensed

Copyright (C) 2019 Matthieu Viry
