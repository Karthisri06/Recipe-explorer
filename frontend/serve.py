"""Tiny static file server for local development.

Unlike `python3 -m http.server`, it tells the browser not to cache files,
so edits show up on a normal refresh.
"""
import socket
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class DualStackServer(ThreadingHTTPServer):
    # Listen on IPv4 and IPv6 so both localhost and [::] work in the browser
    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()


if __name__ == "__main__":
    server = DualStackServer(("::", 8080), NoCacheHandler)
    print("Frontend running on http://localhost:8080")
    server.serve_forever()
