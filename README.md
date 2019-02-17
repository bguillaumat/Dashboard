[![Build Status](https://travis-ci.com/bguillaumat/Dashboard.svg?token=JnqcJzSL9ygjbcHgxfkQ&branch=master)](https://travis-ci.com/bguillaumat/Dashboard)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/bguillaumat/Dashboard/master/LICENSE)

# Dashboard
A web app in NodeJs displaying widgets of services  
**[Demo](https://obscure-headland-59625.herokuapp.com/login)**
# SERVICES
* Youtube
* Steam
* Weather
* Reddit

# WIDGET

**All widgets take a timer params, it's represent the time between each refresh (in minute)** 

## WEATHER

Display temperature for city and the current weather (sun, etc..).

### Params

It takes one params, the name of the city. ex: Paris.

## STEAM

Display the number of players currently playing.

### Params

It takes one params, the id of the steam game. ex: 812140 for Assassin's Creed® Odyssey.

## REDDIT

Display n last posts for a n subreddit.

### Params

It takes two params, the name of the subreddit and the number of last posts the user want. ex: funny 5

## YOUTUBE_LAST

Display n last posts for a x youtube video. Display a preview of the video.

### Params

It takes two params, the id of the video and the number of last posts the user want. ex: Nx4E1htWw8Y 5

## YOUTUBE_VIEWS

Display the number of views for a x youtube video. Display a preview of the video.

### Params

It take one params, the id of the youtube video. ex: Nx4E1htWw8Y 

## YOUTUBE_SUBSCRIBERS

Display the number of subscribers of a youtube channels.

### Params

It take one params, the id of the youtube channel. ex: UCUaHJ0fTA-1theR8A8Polmw
