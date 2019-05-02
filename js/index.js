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

		// 预加载电影详情页面
		var detailPage = mui.preload({
			id: 'movie-detail',
			url: '../html/movie-detail.html'
		})

		$('#movies').on('click', '.item', function() {
			var id = $(this).data('id')
			// 打开这个页面的同时，也要把movie-detai.html页面的写的自定义方法在这里写一下
			mui.fire(detailPage, 'movieId', { // 通过mui.fire触发detailPage页面里面的movieId这个自定义传参的方法，同时把id传递过去
				id: id
			})
			mui.openWindow({
				id: 'movie-detail'
			})
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
		var flag_pullingUp = false

		function _getIndexData() {
			mui.getJSON(baseUrl + '/v2/movie/in_theaters', {
				start: start, // 从0开始
				count: 10 // 每次10条
			}, function(res) {
				var movies = convert(res.subjects)

				for(var i = 0; i < movies.length; i++) {
					var html = ''
					html += '<li data-id="' + movies[i].id + '" class="item">'
					if(movies[i].cover) {
						html += '<img class="item-img" src="' + movies[i].cover + '" />'
					} else {
						html += '<img class="item-img" src="http://placehold.it/60x90" />'
					}
					html += '<div class="right-wrap">'
					html += '<div class="mui-ellipsis dark-big">' + movies[i].title + '</div>'
					html += '<div class="mui-ellipsis">'
					html += '<span class="gray-small">' + movies[i].genres + '</span>&nbsp;'
					if(movies[i].score > 0) {
						html += '<span class="orange-small">' + movies[i].score + '分</span>'
					} else {
						html += '<span class="orange-small">暂无评分</span>'
					}
					html += '</div>'
					html += '<div class="mui-ellipsis gray-small">导演：' + movies[i].directors + '</div>'
					html += '<div class="mui-ellipsis gray-small">主演：' + movies[i].casts + '</div>'
					html += '</div>'
					html += '</li>'
					$('#movies').append(html)
				}

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
					flag_pullingUp = true
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
			if(flag_pullingUp === false) {
				mui.toast('稍等,数据正在请求中....')
				return false
			} else {
				start = start + 10
				if(total > start) {
					mui.getJSON(baseUrl + '/v2/movie/in_theaters', {
						start: start,
						count: 10
					}, function(res) {
						var shanglajiazai_movies = convert(res.subjects)
						for(var i = 0; i < shanglajiazai_movies.length; i++) {
							var html = ''
							html += '<li data-id="' + shanglajiazai_movies[i].id + '" class="item">'
							if(shanglajiazai_movies[i].cover) {
								html += '<img class="item-img" src="' + shanglajiazai_movies[i].cover + '" />'
							} else {
								html += '<img class="item-img" src="http://placehold.it/60x90" />'
							}
							html += '<div class="right-wrap">'
							html += '<div class="mui-ellipsis dark-big">' + shanglajiazai_movies[i].title + '</div>'
							html += '<div class="mui-ellipsis">'
							html += '<span class="gray-small">' + shanglajiazai_movies[i].genres + '</span>&nbsp;'
							if(shanglajiazai_movies[i].score > 0) {
								html += '<span class="orange-small">' + shanglajiazai_movies[i].score + '分</span>'
							} else {
								html += '<span class="orange-small">暂无评分</span>'
							}
							html += '</div>'
							html += '<div class="mui-ellipsis gray-small">导演：' + shanglajiazai_movies[i].directors + '</div>'
							html += '<div class="mui-ellipsis gray-small">主演：' + shanglajiazai_movies[i].casts + '</div>'
							html += '</div>'
							html += '</li>'
							$('#movies').append(html)
						}

						flag_pullingUp = false
						myscroll.refresh()
						myscroll.finishPullUp()
					})
				} else {
					flag_pullingUp = false
					mui.toast('数据没了')
					myscroll.finishPullUp()
					return false
				}
			}
		}
		// 下拉刷新
		function xialashuaxin() {
			$('#movies').empty()
			mui.getJSON(baseUrl + '/v2/movie/in_theaters', {
				start: 0,
				count: 10
			}, function(res) {
				start = 0
				var movies = convert(res.subjects)
				for(var i = 0; i < movies.length; i++) {
					var html = ''
					html += '<li data-id="' + movies[i].id + '" class="item">'
					if(movies[i].cover) {
						html += '<img class="item-img" src="' + movies[i].cover + '" />'
					} else {
						html += '<img class="item-img" src="http://placehold.it/60x90" />'
					}
					html += '<div class="right-wrap">'
					html += '<div class="mui-ellipsis dark-big">' + movies[i].title + '</div>'
					html += '<div class="mui-ellipsis">'
					html += '<span class="gray-small">' + movies[i].genres + '</span>&nbsp;'
					if(movies[i].score > 0) {
						html += '<span class="orange-small">' + movies[i].score + '分</span>'
					} else {
						html += '<span class="orange-small">暂无评分</span>'
					}
					html += '</div>'
					html += '<div class="mui-ellipsis gray-small">导演：' + movies[i].directors + '</div>'
					html += '<div class="mui-ellipsis gray-small">主演：' + movies[i].casts + '</div>'
					html += '</div>'
					html += '</li>'
					$('#movies').append(html)
				}
				myscroll.refresh()
				myscroll.finishPullDown()
			})
		}
	});

})();