from http.server import BaseHTTPRequestHandler
import gensim.downloader
 
class handler(BaseHTTPRequestHandler):
 
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type','text/plain')
        self.end_headers()
		model = gensim.downloader.load("word2vec-google-news-300")
		word = "apple"
		embedding = model.wv[word]
		# Return embedding inside a json object
		self.wfile.write(json.dumps({"embedding": embedding.tolist()}).encode('utf-8'))
        return