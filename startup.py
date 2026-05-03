import http.server
import socketserver
import os

PORT = int(os.environ.get('PORT', 8000))
# Serve from the directory where this script lives (works in /tmp/... or /home/site/wwwroot)
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print(f"Serving from: {os.getcwd()}")

Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving on port {PORT}")
    httpd.serve_forever()