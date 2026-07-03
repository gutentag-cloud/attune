# Dev server for ATTUNE: same as `python -m http.server` but with caching
# disabled, so edits show up on a plain reload instead of a hard refresh.
# Usage: python serve.py [port]
import functools
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


handler = functools.partial(NoCacheHandler, directory=ROOT)
print(f'ATTUNE dev server: http://localhost:{PORT} (cache disabled)')
http.server.ThreadingHTTPServer(('', PORT), handler).serve_forever()
