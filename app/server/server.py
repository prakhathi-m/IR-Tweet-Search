#!/usr/bin/env python
# coding: utf-8

# In[48]:

import urllib.request
from urllib.parse import urlparse
import json
import os.path
from flask import Flask, render_template, request, jsonify
import random
import json
app = Flask(__name__, static_folder="../static/dist", template_folder="../static")

def doSearch(search):
	search_query='text_en:'+search+'%20OR%20text_ru:'+search+'%20OR%20text_de:'+search
	inurl='http://18.218.221.88:8984/solr/IRF19P1/select?q='+search_query+'&wt=json&indent=true&rows=20'
	data = urllib.request.urlopen(inurl)
	docs = json.load(data)['response']['docs']
	return docs


def get_tweet_sentiment(self, tweet):
        '''
        Utility function to classify sentiment of passed tweet
        using textblob's sentiment method
        '''
        # create TextBlob object of passed tweet text
        analysis = TextBlob(self.clean_tweet(tweet))
        # set sentiment
        if analysis.sentiment.polarity > 0:
            return 'positive'
        elif analysis.sentiment.polarity == 0:
            return 'neutral'
        else:
            return 'negative'

@app.route('/')
def index():
  return render_template('index.html')


@app.route('/result', methods=['GET'])
def hello():
    return json.dumps(result)

@app.route('/search', methods=['POST'])
def search():
	if request.method == 'POST':
		a = request.data
		b= a.decode('utf-8')
		c = json.loads(b)
		queryTerm = c.get('queryTerm')
		result = doSearch(queryTerm)
		return json.dumps(result)

if __name__ == '__main__':
    app.run()
