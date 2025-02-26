from http.server import BaseHTTPRequestHandler
from gensim.models import Word2Vec
import gensim.downloader


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type','text/plain')
        self.end_headers()
		model = gensim.downloader.load("word2vec-google-news-300")
		word = self.path.split("/")[-1]
		embedding = model.wv[word]
		# convert embedding to json
		embedding_json = json.dumps(embedding.tolist())
		self.wfile.write(embedding_json.encode('utf-8'))
        return