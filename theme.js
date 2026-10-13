/* Light / Dim theme, shared by the Hub, the Lab and the Studio.
   All three live on fahmidhasann.github.io, so one localStorage key carries
   the choice between them. Light is the default for every visitor.
   Load this WITHOUT defer, right after <meta name="theme-color">, so the
   theme is on <html> before the first paint (no flash). Keep the Studio's
   copy (video-editor-portfolio/theme.js) identical. */
(function () {
  'use strict';
  var KEY = 'fh-theme';
  var root = document.documentElement;
  var read = function () { try { return localStorage.getItem(KEY) === 'dim' ? 'dim' : 'light'; } catch (e) { return 'light'; } };
  var write = function (t) { try { localStorage.setItem(KEY, t); } catch (e) { /* private mode */ } };

  var sync = function (t) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', meta.getAttribute(t === 'dim' ? 'data-dim' : 'data-light') || meta.getAttribute('content'));
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', String(t === 'dim'));
      btns[i].setAttribute('title', t === 'dim' ? 'Switch to light theme' : 'Switch to dim theme');
    }
  };
  var apply = function (t) { root.setAttribute('data-theme', t); sync(t); };

  apply(read());

  var toggle = function () {
    var next = root.getAttribute('data-theme') === 'dim' ? 'light' : 'dim';
    write(next);
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !calm) document.startViewTransition(function () { apply(next); });
    else apply(next);
  };

  var bind = function () {
    sync(root.getAttribute('data-theme'));
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener('click', toggle);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();

  /* Another tab changed it, or the page came back from the back/forward cache */
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(read()); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) apply(read()); });
})();
