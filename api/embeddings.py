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
		# self.wfile.write(embedding.tobytes())
		# Send word and embedding as json, embedding is a list of floats
		embedding_json = json.dumps(embedding.tolist())
		self.wfile.write(embedding_json.encode('utf-8'))

        return