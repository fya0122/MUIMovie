(function() {
	mui.init({
		swipeBack: true //启用右滑关闭功能
	});
	mui.plusReady(function() {

		// 创建子webview窗口 并初始化
		var aniShow = {};
		util.initSubpage(aniShow);

		var nview = plus.nativeObj.View.getViewById('tabBar'),
			activePage = plus.webview.currentWebview(),
			targetPage,
			subpages = util.options.subpages,
			pageW = window.innerWidth,
			currIndex = 0;

		// 根据判断view控件点击位置判断切换的tab
		nview.addEventListener('click', function(e) {
			var clientX = e.clientX;
			if(clientX > 0 && clientX <= parseInt(pageW * 0.33)) {
				currIndex = 0;
			} else if(clientX > parseInt(pageW * 0.33) && clientX <= parseInt(pageW * 0.67)) {
				currIndex = 1;
			} else if(clientX > parseInt(pageW * 0.67) && clientX <= parseInt(pageW)) {
				currIndex = 2;
			}
			// 匹配对应tab窗口	
			if(currIndex > 0) {
				targetPage = plus.webview.getWebviewById(subpages[currIndex - 1]);
			} else {
				targetPage = plus.webview.currentWebview();
			}
			if(targetPage == activePage) {
				return;
			}
			if(currIndex !== 3) {
				//底部选项卡切换
				util.toggleNview(currIndex);
				// 子页面切换
				util.changeSubpage(targetPage, activePage, aniShow);
				//更新当前活跃的页面
				activePage = targetPage;
			}
		});

		// 给搜索框添加点击事件
		mui('.wrap-search')[0].addEventListener('tap', function() {
			mui.alert(123)
		})

		var data_movies = new Vue({
			el: '#movies',
			data: {
				movies: []
			}
		})

		// 这个函数是转换数据接口用的
		function convert(items) {
			var newItems = []
			items.forEach(function(item) {
				// 类型
				var genres = item.genres.toString().replace(/,/g, '/')
				// 导演
				var directors = ''
				for(var i = 0; i < item.directors.length; i++) {
					directors += item.directors[i].name
					if(i !== item.directors.length - 1) {
						directors += '/'
					}
				}
				// 演员
				var casts = ''
				for(var i = 0; i < item.casts.length; i++) {
					casts += item.casts[i].name
					if(i !== item.casts.length - 1) {
						casts += '/'
					}
				}
				newItems.push({
					id: item.id,
					title: item.title,
					genres: genres,
					cover: item.images.large,
					score: item.rating.average,
					directors: directors,
					casts: casts
				})
			})
			return newItems
		}

		// 获取首页数据
		mui.getJSON(baseUrl + '/v2/movie/in_theaters', {}, function(res) {
			data_movies.movies = convert(res.subjects)
			var myscroll = new BScroll(document.getElementById('list_wrap'))
		})
	});

})();