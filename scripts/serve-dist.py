"""Threaded static server for the verification gate.

`python3 -m http.server` is single-threaded. A browser opens several connections per page,
and once the home route started dynamically importing the scroll engine, one chunk request
sat pending forever while the server was busy: Playwright's `networkidle` never fired and the
gate failed on a page that was fine. curl fetched the same chunk in 2 ms.
"""
import sys, os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
root = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.getcwd())
class Handler(SimpleHTTPRequestHandler):
    # GitHub Pages, as tested by https://til.simonwillison.net/github/github-pages and
    # https://github.com/slorber/trailing-slash-guide: /x serves x.html even when a folder x/ exists (no redirect);
    # /x/ serves x/index.html and never x.html, so it is a 404 without one; a folder with no index.html is never
    # listed. This server used to answer /x/ from x.html, which hid that every route 404'd with a slash on Pages.
    def send_head(self):
        request_path = self.path.split('?')[0]
        # Match Pages case-sensitive route lookup on Windows as well as Linux.
        if '/downloads/' not in request_path and os.path.splitext(request_path)[1] in ('', '.html') and request_path != request_path.lower():
            self.send_error(404); return None
        path = self.translate_path(self.path)
        if request_path.endswith('/'):
            if not os.path.isfile(os.path.join(path, 'index.html')):
                self.send_error(404); return None
        elif not os.path.isfile(path) and os.path.isfile(path + '.html'):
            self.path = request_path + '.html'
        elif os.path.isdir(path) and not os.path.isfile(os.path.join(path, 'index.html')):
            self.send_error(404); return None
        return super().send_head()
    # GitHub Pages serves the site's 404.html (status 404) for a missing path, so the gate can test the not-found page.
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            parts = self.path.split('/')
            page = os.path.join(root, parts[1] if len(parts) > 1 else '', '404.html')
            if os.path.isfile(page):
                body = open(page, 'rb').read()
                self.send_response(404); self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(body))); self.end_headers()
                if self.command != 'HEAD': self.wfile.write(body)
                return
        return super().send_error(code, message, explain)
    def log_message(self, *a): pass
handler = partial(Handler, directory=root)
ThreadingHTTPServer.daemon_threads = True
ThreadingHTTPServer(('127.0.0.1', port), handler).serve_forever()
