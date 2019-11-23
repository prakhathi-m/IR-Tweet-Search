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

def doSearch(search,lang,country,date,verified,sor,dir):
	search_query='text_en:'+search+'%20OR%20text_ru:'+search+'%20OR%20text_de:'+search+'%20OR%20tweet_text:'+search
	f_lang=""
	s=""
	if lang is not None:
		f_lang="&fq=tweet_lang:"+lang[0]
		for val in range(1,len(lang)):
			f_lang += " OR "+"tweet_lang:"+lang[val]
	f_country=""
	if country is not None:
		f_country="&fq=country:"+country[0]
		for val in range(1,len(country)):
			f_country += " OR "+"country:"+country[val]
	f_verified=""
	if verified is not None:
		f_verified="fq=verified:true"
	if sor is not None and dir is not None:
		s="&sort="+sor + dir
	f_date=""
	if date is not None:
		f_date="&fq=["+date[0]+" TO "+date[1]+"]"

	print(date)
	filter=f_lang+f_country+f_verified+f_date
	inurl='http://ec2-3-86-177-141.compute-1.amazonaws.com:8984/solr/IRF19P4/select?'+filter+'&q='+search_query+s+'&wt=json&indent=true&rows=20'
	print(inurl)
	data = urllib.request.urlopen(inurl)
	docs = json.load(data)['response']['docs']
	return docs

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
		lang=c.get('lang')
		country=c.get('country')
		date=c.get('date')
		verified=c.get('verified')
		sort=c.get('sort')
		dir=c.get('dir')
		result = doSearch(queryTerm,lang,country,date,verified,sort,dir)
		return json.dumps(result)

if __name__ == '__main__':
	app.run()