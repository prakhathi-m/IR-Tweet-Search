import urllib.request
from urllib.parse import urlparse
import json
import os.path
from flask import Flask, render_template, request, jsonify, Response
import random
import json
from googletrans import Translator
from newsapi import NewsApiClient

newsapi = NewsApiClient(api_key='da5b8ff84dab4491b1d1fc0e729d9d38')
app = Flask(__name__, static_folder="../static/dist", template_folder="../static")

docs=[]
def getArticle(search):
	translator = Translator()
	hi = search
	en = search
	pt = search

	tweet_lang = translator.detect(search).lang
	if tweet_lang == 'en':
		try:
			pt = translator.translate(search, dest='pt').text
		except:
			pt = search
		try:
			hi = translator.translate(search, dest='hi').text
		except:
			hi = search
	elif tweet_lang == 'pt':
		try:
			en = translator.translate(search, dest='en').text
		except:
			en = search
		try:
			hi = translator.translate(search, dest='hi').text
		except:
			hi = search
	elif tweet_lang == 'hi':
		try:
			en = translator.translate(search, dest='en').text
		except:
			en = search
		try:
			pt = translator.translate(search, dest='pt').text
		except:
			pt = search


	pt_source='globo,blasting-news-br,google-news-br,info-money'
	en_source='cnn,the-wall-street-journal,cbs-news,techradar,usa-today,buzzfeed'
	hi_source='the-hindu,the-times-of-india,google-news-in'

	en_articles = newsapi.get_everything(q=en,sources=en_source,sort_by='relevancy')
	pt_articles = newsapi.get_everything(q=pt,sources=pt_source,sort_by='relevancy')
	hi_articles = newsapi.get_everything(q=hi,sources=hi_source,sort_by='relevancy')

	res=[]
	for a in en_articles['articles']:
		res.append([a['title'], a['url']])
	for a in pt_articles['articles']:
		res.append([a['title'], a['url']])
	for a in hi_articles['articles']:
		res.append([a['title'], a['url']])
	return res

def getReplies(id):
	search_query= urllib.parse.quote("*:*")
	filter="&fq=replied_to_tweet_id:"+id
	inurl='http://ec2-3-86-177-141.compute-1.amazonaws.com:8984/solr/IRF19P4/select?'+filter+'&q='+search_query+'&wt=json&indent=true&rows=100'
	print(inurl)
	data1 = urllib.request.urlopen(inurl)
	data2 = urllib.request.urlopen(inurl)

	count=0

	count=json.load(data1)['response']['numFound']
	docs = json.load(data2)['response']['docs']
	pos=0
	neg=0
	ntr=0
	for reply in docs:
		print(reply['sentiment'])
		if reply['sentiment'][0]=="positive":
			pos+=1
		elif reply['sentiment'][0]=="negative":
			neg+=1
		else:
			ntr+=1
	print(pos,neg,ntr)
	if count>0:
		pos /= count
		neg /= count
		ntr /= count
	return [docs,count,pos,neg,ntr]




def doSearch(search,lang,country,date,verified,sor,dir,sentiment,topic):
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
	f_topic=""
	if topic is not None and len(topic) > 0:
		f_topic="&fq=topic:"+topic[0]
		for val in range(1,len(topic)):
			f_topic += "%20OR%20"+"topic:"+topic[val]
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
	filter=f_lang+f_country+f_verified+f_date+f_sentiment+f_topic
	inurl='http://ec2-3-86-177-141.compute-1.amazonaws.com:8984/solr/IRF19P4/select?'+filter+'&q='+search_query+s+'&wt=json&indent=true&rows=100'
	print(inurl)
	data1 = urllib.request.urlopen(inurl)
	data2 = urllib.request.urlopen(inurl)

	print("check1")
	count=0
	count=json.load(data1)['response']['numFound']
	print("check2")

	docs = json.load(data2)['response']['docs']
	print(docs)
	return [docs,count]

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
		topic=c.get('topic')
		result = doSearch(queryTerm,lang,country,date,verified,sort,dir,sentiment, topic)
		return json.dumps(result)
@app.route('/reply', methods=['POST'])
def reply():
	if request.method == 'POST':
		a = request.data
		b= a.decode('utf-8')
		c = json.loads(b)
		id = c.get('id')

		result = getReplies(id)
		return json.dumps(result)

@app.route('/article', methods=['POST'])
def article():
	if request.method == 'POST':
		a = request.data
		b= a.decode('utf-8')
		c = json.loads(b)
		queryTerm = c.get('queryTerm')
		result = getArticle(queryTerm)
		return json.dumps(result)
if __name__ == '__main__':
	app.run(host='0.0.0.0')
