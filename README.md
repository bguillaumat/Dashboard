[![Build Status](https://travis-ci.com/AsianPw/DEV_dashboard_2018.svg?token=M3xbjJUWZq4UxPF7fE7j&branch=master)](https://travis-ci.com/AsianPw/DEV_dashboard_2018)

#Deploy the app

##Staging platform (Test)

For deploy on staging please push and commit on develop branch.

The commit is test by [travis](https://travis-ci.com/AsianPw/DEV_dashboard_2018/), then travis push the commit on heroku. 

The staging platform is [here](https://staging-dashboard-2018.herokuapp.com/)

##Production platform

**never commit directly in master branch**

For deploy on production, merge develop branch in master and push. It's the only things you're allowed to do on master branch.

The commit is test by [travis](https://travis-ci.com/AsianPw/DEV_dashboard_2018/), then travis push the commit on heroku. 

The production platform is [here](https://obscure-headland-59625.herokuapp.com/)

#SERVICE
* Youtube
* Steam
* Weather
* Reddit

#WIDGET

**All widgets take a timer params, it's represent the time between each refresh (in minute)** 

##WEATHER

Display temperature for city and the current weather (sun, etc..).

###Params

It takes one params, the name of the city. ex: Paris.

##STEAM

Display the number of players currently playing.

###Params

It takes one params, the id of the steam game. ex: 812140 for Assassin's Creed® Odyssey.

##REDDIT

Display n last posts for a n subreddit.

###Params

It takes two params, the name of the subreddit and the number of last posts the user want. ex: funny 5

##YOUTUBE_LAST

Display n last posts for a x youtube video. Display a preview of the video.

###Params

It takes two params, the id of the video and the number of last posts the user want. ex: Nx4E1htWw8Y 5

##YOUTUBE_VIEWS

Display the number of views for a x youtube video. Display a preview of the video.

###Params

It take one params, the id of the youtube video. ex: Nx4E1htWw8Y 

##YOUTUBE_SUBSCRIBERS

Display the number of subscribers of a youtube channels.

###Params

It take one params, the id of the youtube channel. ex: UCUaHJ0fTA-1theR8A8Polmw
