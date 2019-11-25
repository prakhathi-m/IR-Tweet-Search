#!/usr/bin/env python
# coding: utf-8

# In[48]:

import urllib.request
from urllib.parse import urlparse
import json
import csv
import os.path
from flask import Flask, render_template, request, jsonify, Response
import random
import json
app = Flask(__name__, static_folder="../static/dist", template_folder="../static")
import matplotlib.pyplot as plt
import datetime
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import re
import io
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import mpld3
from mpld3 import plugins
import pandas as pd


docs=[]
def doSearch(search,lang,country,date,verified,sor,dir):
	global docs
	search_query='text_en:'+search+'%20OR%20text_ru:'+search+'%20OR%20text_de:'+search+'%20OR%20tweet_text:'+search
	f_lang=""
	s=""
	if lang is not None and len(lang) > 0:
		f_lang="&fq=tweet_lang:"+lang[0]
		for val in range(1,len(lang)):
			f_lang += " OR "+"tweet_lang:"+lang[val]
	f_country=""
	if country is not None and len(country) > 0:
		f_country="&fq=country:"+country[0]
		for val in range(1,len(country)):
			f_country += " OR "+"country:"+country[val]
	f_verified=""
	if verified is not None:
		f_verified="&fq=verified:true"
	if sor is not None and dir is not None:
		s="&sort="+sor + "%20" + dir
	f_date=""
	if date is not None and len(date) > 0:
		print(date)
		f_date="&fq=["+date[0]+" TO "+date[1]+"]"

	print(date)
	filter=f_lang+f_country+f_verified+f_date
	inurl='http://ec2-3-86-177-141.compute-1.amazonaws.com:8984/solr/IRF19P4/select?'+filter+'&q='+search_query+s+'&wt=json&indent=true&rows=20'
	print(inurl)
	data = urllib.request.urlopen(inurl)
	docs = json.load(data)['response']['docs']
	with open('docs.csv', 'w',encoding="utf8") as csvFile:
		# json.dump(docs, f, ensure_ascii=False)
		writer = csv.writer(csvFile)
		writer.writerow(docs)
	csvFile.close()
	return docs

def getGraph():
	print("new graph--------------")
	print(docs)
	date=[]
	country=[]
	lang=[]
	for row in docs:
	    country.append(row['country'][0])
	    date.append(row['tweet_date'][0])
	    lang.append(row['tweet_lang'][0])
	changed_datestr=[]
	changed_date=[]
	for i in range(0,len(date)):
	    date_time_str = date[i]
	    date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%SZ')
	    a=date_time_obj.date()
	    changed_date.append((a))
	India=[]
	Brazil=[]
	USA=[]
	en=[]
	pt=[]
	hi=[]
	for i in range(0,len(country)):
	    if(country[i]=='India'):
	        India.append(changed_date[i])
	    elif(country[i]=='Brazil'):
	        Brazil.append(changed_date[i])
	    elif(country[i]=='USA'):
	        USA.append(changed_date[i])
	for i in range(0,len(lang)):
	    if(lang[i]=='en'):
	        en.append(changed_date[i])
	    elif(lang[i]=='pt'):
	        pt.append(changed_date[i])
	    elif(lang[i]=='hi'):
	        hi.append(changed_date[i])
	Indiadict = {}
	for i in range(0,len(India)):
	    Indiadict.update({India[i]:India.count(India[i])})
	# print("Updated Dict is: ", Indiadict)
	# Brazildict = {}
	# for i in range(0,len(Brazil)):
	#     Brazildict.update({Brazil[i]:Brazil.count(Brazil[i])})
	# USAdict = {}
	# for i in range(0,len(USA)):
	#     USAdict.update({USA[i]:USA.count(USA[i])})
	Engdict = {}
	for i in range(0,len(en)):
	    Engdict.update({en[i]:en.count(en[i])})
	Hindict = {}
	# for i in range(0,len(hi)):
	    # Hindict.update({hi[i]:hi.count(hi[i])})
	# Ptdict = {}
	# for i in range(0,len(pt)):
	    # Ptdict.update({pt[i]:pt.count(pt[i])})
	# Indialists = sorted(Indiadict.items())
	# x, y = zip(*Indialists)
	# fig, ax = plt.subplots()
	# ax.plot(x,y, marker='o', linestyle='-')
	# ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'));
	# ax.set_title("India Tweets vs Count")
	# Brazillists = sorted(Brazildict.items())
	# x1, y1 = zip(*Brazillists)
	# fig, ax = plt.subplots()
	# ax.plot(x1,y1, marker='o', linestyle='-')
	# ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'));
	# ax.set_title("Brazil Tweets vs Count")
	# USAlists = sorted(USAdict.items())
	# x2, y2 = zip(*USAlists)
	# fig, ax = plt.subplots()
	# ax.plot(x2,y2, marker='o', linestyle='-')
	# ax.set_title("USA Tweets vs Count")
	Englists = sorted(Engdict.items())
	a, b = zip(*Englists)
	# Hinlists = sorted(Hindict.items())
	# a1, b1 = zip(*Hinlists)
	# Ptlists = sorted(Ptdict.items())
	# a2, b2 = zip(*Ptlists)

	# fig1, ax = plt.subplots()
	# ax.plot(a,b, marker='o', linestyle='-',markersize=2)
	# ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'));
	# ax.set_title("English Tweets vs Count")

	# fig2, ax = plt.subplots()
	# ax.plot(a1,b1, marker='o', linestyle='-',color='green',markersize=2)
	# ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'));
	# ax.set_title("Hindi Tweets vs Count")

	# fig3, ax = plt.subplots()
	# ax.plot(a2,b2, marker='o', linestyle='-',color='red',markersize=2)

	# ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'));
	# ax.set_title("Portugese Tweets vs Count")

	# plt.plot( x,y, marker='o',  markersize=6, color='skyblue', linewidth=2)
	# plt.plot( x1,y1,  marker='o', color='green', linewidth=2,markersize=6)
	# plt.plot( x2,y2,  marker='o', color='red', linewidth=2,  label="toto",markersize=6)

	# fig4, ax = plt.subplots(figsize=(15, 5))
	#
	# # fig4.figsize=(20,10)
	# plt.plot( a,b,  markersize=2, marker='o',color='skyblue', linewidth=2)
	# # plt.plot( a1,b1,  marker='o', color='green', linewidth=2,markersize=2)
	# #plt.plot( a2,b2,  marker='o', color='red', linewidth=2,  label="toto",markersize=2)
	# ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d %Y'));
	# ax.set_title("Languages vs count")
	# plt.show()




# @app.route('/plot.png')
# def plot_png():
#     fig = create_figure()
#     output = io.BytesIO()
#     FigureCanvas(fig).print_png(output)
#     return Response(output.getvalue(), mimetype='image/png')
#
# def create_figure():
#     fig = Figure()
#     axis = fig.add_subplot(1, 1, 1)
#     xs = range(100)
#     ys = [random.randint(1, 50) for x in xs]
#     axis.plot(xs, ys)
#     return fig

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
