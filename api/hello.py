from http.server import BaseHTTPRequestHandler
 
class handler(BaseHTTPRequestHandler):
 
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type','text/plain')
        self.end_headers()
		# Get params from url
		params = self.path.split("?")[1]
		params = params.split("&")
		# Return params as json
		self.wfile.write(json.dumps(params).encode('utf-8'))
        return