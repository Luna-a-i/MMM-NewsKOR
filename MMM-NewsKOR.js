Module.register("MMM-NewsKOR", {
  defaults: {
    none: null
  },

  getStyles: function() {
    return ["MMM-NewsKOR.css"]
  },

  start: function() {
    this.sendSocketNotification("INIT", this.config)
  },

  getDom: function() {
    var wrapper = document.createElement("div")
    wrapper.id = "NewsKOR"
    wrapper.onclick = (event)=> {
      event.stopPropagation()
      this.viewNews()
    }
    var newsKORTitle = document.createElement("div")
    newsKORTitle.id = "newsKORTitle"
    newsKORTitle.innerText = "최신 뉴스"
    // var newsKORTitleHR = document.createElement("hr")
    var newsData = document.createElement("div")
    newsData.id = "newsData"
    var newsTitle = document.createElement("div")
    newsTitle.id = "NewsKOR-title"
    var newsDate = document.createElement("div")
    newsDate.id = "NewsKOR-Date"
    // var newsText = document.createElement("div")
    // newsText.id = "NewsKOR-text"
    // newsText.innerText = "Wohoo... This is News Text"
    // var newsImage = new Image();
    // newsImage.id = "NewsKOR-img"
    // newsImage.src = "https://www.google.co.kr/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
    // wrapper.appendChild(newsImage);
    wrapper.appendChild(newsKORTitle);
    // newsKORTitle.appendChild(newsKORTitleHR);
    newsData.appendChild(newsTitle);
    newsData.appendChild(newsDate);
    // newsData.appendChild(newsText);
    wrapper.appendChild(newsData);

    return wrapper
  },

  draw: async function() {
    clearTimeout(this.timer);
    function timeForToday(value) {
        const today = new Date();
        const timeValue = new Date(value);
        const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
        if (betweenTime < 1) return '방금전';
        if (betweenTime < 60) {
            return `${betweenTime} 분전`;
        }
        const betweenTimeHour = Math.floor(betweenTime / 60);
        if (betweenTimeHour < 24) {
            return `${betweenTimeHour} 시간전`;
        }
        const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
        if (betweenTimeDay < 365) {
            return `${betweenTimeDay} 일전`;
        }
        return `${Math.floor(betweenTimeDay / 365)} 년전`;
 }
    this.timer = null;
    var nk = document.getElementById("NewsKOR");
    var nkTitle = document.getElementById("NewsKOR-title");
    var nkDate = document.getElementById("NewsKOR-Date");
    // var nkText = document.getElementById("NewsKOR-text");
    // var nkImg = document.getElementById("NewsKOR-img");
    nkTitle.classList.add("hideNews");
    nkTitle.classList.remove("showNews");
    setTimeout(() => {
      nkTitle.innerText = this.news[this.index].title;
      nkDate.innerText = timeForToday(new Date(this.news[this.index].pubDate));
      this.newsLink = this.news[this.index].link;

      // nkText.innerText = this.news[this.index].description;
      // nkTitle.innerText = this.news[this.index].title;
      nkTitle.classList.remove("hideNews");
      nkTitle.classList.add("showNews");
    },900);

    this.timer = setTimeout(()=>{
      this.index++
      if (this.index >= this.news.length) {
        this.index = 0
      }
      this.draw()
    }, this.config.nextNewsInterval)
},

  notificationReceived: function(noti, payload) {
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("START")
        break
      case "NEWS_DETAIL":
        this.openNews()
        break
      case "NEWS_PREVIOUS":
        if (this.index > 0) {
          this.index--
        } else {
          this.index = this.news.length - 1
        }
        this.draw()
        break
      case "NEWS_NEXT":
        if (this.index < this.news.length - 1) {
          this.index++
        } else {
          this.index = 0
        }
        this.draw()
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    if (noti == "UPDATE") {
      if (payload.length > 0) {
        this.news = payload
        this.index = 0;
        this.draw()
      }
    }
    if (noti == "RECEIVEARTICLE") {
      console.log("Receive ArticleInfo");
      if(payload.content == "") {

      }
        var popupTitle = document.createElement("div");
        popupTitle.id = "articleTitle";
        popupTitle.innerText = payload.title;
        var popupText = document.createElement("div");
        popupText.id = "articleText";
        popupText.innerHTML = payload.content;
        var popupFrm = document.createElement("div");
        popupFrm.appendChild(popupTitle);
        popupFrm.appendChild(popupText);
        popupScreen("뉴스",popupFrm,{ height: "80%"});
    }
  },

  viewNews: function() {
    console.log("Open News");
    this.popup();
  },
  popup: function() {
    this.sendSocketNotification("GETARTICLE",this.newsLink);
  }


})
