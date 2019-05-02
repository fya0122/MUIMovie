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
		// better-scroll对象
		var myscroll

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

		_getIndexData()
		// 获取首页数据
		var start = 0
		var total = 0

		function _getIndexData() {
			mui.getJSON(baseUrl + '/v2/movie/in_theaters', {
				start: start, // 从0开始
				count: 10 // 每次10条
			}, function(res) {
				data_movies.movies = convert(res.subjects)
				total = res.total
				myscroll = new BScroll(document.getElementById('list_wrap'), {
					click: true,
					scrollY: true,
					pullUpLoad: true, // 开启上拉加载
					pullDownRefresh: true // 开启下拉刷新
				})
				// 消除dom渲染不及时的bug
				setTimeout(function() {
					myscroll.refresh()
				}, 77)
				// 监听上拉加载执行的方法
				myscroll.on('pullingUp', function() {
					shanglajiazai()
				})
				// 监听下拉刷新执行的方法
				myscroll.on('pullingDown', function() {
					xialashuaxin()
				})
			})
		}
		// 上拉加载
		function shanglajiazai() {
			start = start + 10
			if(total > start) {
				mui.getJSON(baseUrl + '/v2/movie/in_theaters', {
					start: start,
					count: 10
				}, function(res) {
					var shanglajiazai_movies = convert(res.subjects)
					data_movies.movies = data_movies.movies.concat(shanglajiazai_movies)
					myscroll.refresh()
					myscroll.finishPullUp()
				})
			} else {
				mui.alert('数据没了')
				myscroll.finishPullUp()
				return false
			}
		}
		// 下拉刷新
		function xialashuaxin() {
			data_movies.movies = []
			mui.getJSON(baseUrl + '/v2/movie/in_theaters', {
				start: 0,
				count: 10
			}, function(res) {
				start = 0
				data_movies.movies = convert(res.subjects)
				myscroll.refresh()
				myscroll.finishPullDown()
			})
		}
	});

})();