import urllib.request
from urllib.parse import urlparse
import json
import os.path
from flask import Flask, render_template, request, jsonify, Response
import random
import json
from googletrans import Translator
app = Flask(__name__, static_folder="../static/dist", template_folder="../static")

docs=[]
def doSearch(search,lang,country,date,verified,sor,dir,sentiment):
	global docs
	translator = Translator()
	hi=search
	en=search
	pt=search

	tweet_lang=translator.detect(search).lang
	if tweet_lang=='en':
		try:
			pt=translator.translate(search, dest='pt').text
		except:
			pt=search
		try:
			hi=translator.translate(search, dest='hi').text
		except:
			hi=search
	elif tweet_lang=='pt':
		try:
			en=translator.translate(search, dest='en').text
		except:
			en=search
		try:
			hi=translator.translate(search, dest='hi').text
		except:
			hi=search
	elif tweet_lang =='hi':
		try:
			en=translator.translate(search, dest='en').text
		except:
			en=search
		try:
			pt=translator.translate(search, dest='pt').text
		except:
			pt=search
	hi = urllib.parse.quote(hi.replace(':', '\:'))
	en = urllib.parse.quote(en.replace(':', '\:'))
	pt = urllib.parse.quote(pt.replace(':', '\:'))
	f_lang=""
	s=""
	if lang is not None and len(lang) > 0:
		f_lang="&fq=tweet_lang:"+lang[0]
		for val in range(1,len(lang)):
			f_lang += "%20OR%20"+"tweet_lang:"+lang[val]
	f_country=""
	if country is not None and len(country) > 0:
		f_country="&fq=country:"+country[0]
		for val in range(1,len(country)):
			f_country += "%20OR%20"+"country:"+country[val]
	f_sentiment=""
	if sentiment is not None and len(sentiment) > 0:
		f_sentiment="&fq=sentiment:"+sentiment[0]
		for val in range(1,len(sentiment)):
			f_sentiment += "%20OR%20"+"sentiment:"+sentiment[val]
	f_verified=""
	if verified is not None:
		f_verified="&fq=verified:true"
	if sor is not None and dir is not None:
		s="&sort="+sor + "%20" + dir
	f_date=""
	if date is not None and len(date) > 0:
		print(date)
		f_date="&fq=tweet_date:["+date[0]+"%20TO%20"+date[1]+"]"

	print(date)
	search_query= "text_hi:"+ hi + "%20OR%20" + "text_en:" + en+ "%20OR%20" + "text_pt:" + pt
	filter=f_lang+f_country+f_verified+f_date+f_sentiment
	inurl='http://ec2-3-86-177-141.compute-1.amazonaws.com:8984/solr/IRF19P4/select?'+filter+'&q='+search_query+s+'&wt=json&indent=true&rows=100'
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
		sentiment=c.get('sentiment')
		result = doSearch(queryTerm,lang,country,date,verified,sort,dir,sentiment)
		return json.dumps(result)

if __name__ == '__main__':
	app.run()
