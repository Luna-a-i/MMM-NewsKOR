const request = require("request")
const moment = require("moment")
const querystring = require("querystring")

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function() {
    this.url = "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko"
    this.updateInterval = 1000 * 60 * 10
  },

  socketNotificationReceived: function(noti, payload) {
    if (noti == "INIT") {
      this.initialize()
    }
    if (noti == "START") {
      this.startInit()
    }
    if (noti == "GETARTICLE") {
      this.getArticle(payload)
    }
  },
  initialize: function() {
    console.log(" ::: NEWS KOR ::: Initializing");
  },
  startInit: function() {
    var url = this.url;
    console.log(" ::: News KOR ::: Starting");
    var getRequest = function(url) {
      return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
          if (error) {
            var e = ""
            reject(e)
          } else {
            var parser = require("xml2js").parseString;
            parser(body, (err, result) => {
              if(err) reject(err)
              resolve(result.rss.channel[0].item)
            })

          }
        })
      })
    }
    var getNews = async (url) => {
      try {
        var res = await getRequest(url)
        this.news = res;
        this.finishInit();
      } catch (err) {
        console.log(":::: News KOR :::: ", err);
        return false;
      }
    }
    getNews(url);
    var timer = setTimeout(()=>{
      this.startInit()
    }, this.updateInterval)
  },
  getArticle: async function(url) {
    console.log("Call Get Article");
    var JSDOM = require('jsdom').JSDOM
    var Readability = require('readability')
    var linkDOM = null;
    await JSDOM.fromURL(url).then(dom => {
      linkDOM = dom;
    });
    var article = new Readability(linkDOM.window.document).parse();
    this.sendSocketNotification("RECEIVEARTICLE",article);
  },

  finishInit: function() {
    this.sendSocketNotification("UPDATE", this.news)
  }
})
