#!/usr/bin/env python
# coding: utf-8

# In[48]:

import urllib.request
from urllib.parse import urlparse
import json
import os.path
from flask import Flask, render_template

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")

search="Russia"

search_query='text_en:'+search+'%20OR%20text_ru:'+search+'%20OR%20text_de:'+search

inurl='http://ec2-3-86-177-141.compute-1.amazonaws.com:8984/solr/C1/select?q='+search_query+'&wt=json&indent=true&rows=20'


# In[49]:


print(inurl)
data = urllib.request.urlopen(inurl)
docs = json.load(data)['response']['docs']
res=""
for row in docs:
    print(row['id'])
    res+=row['id']+"\n"


# In[ ]:


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


# In[47]:


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/hello") # take note of this decorator syntax, it's a common pattern
def hello():
    return "Hello World!"

@app.route('/home')
def new_hello():
    # It is good practice to only call a function in your route end-point,
    # rather than have actual implementation code here.
    # This allows for easier unit and integration testing of your functions.
    return get_hello()


def get_hello():
    greeting_list = ['Ciao', 'Hei', 'Salut', 'Hola', 'Hallo', 'Hej']
    return random.choice(greeting_list)

if __name__ == '__main__':
    app.run()


# In[ ]:





# In[ ]:
