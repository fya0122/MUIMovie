(function() {
	mui.init();
	// 默认数据
	function getDefaultData() {
		return {
			title: '',
			cover: '',
			score: '',
			ratingCount: '',
			summary: '',
			countries: '',
			year: '',
			genres: '',
			casts: [],
			directors: []
		}
	}

	mui.plusReady(function() {
		var self = plus.webview.currentWebview()
		// 添加hide事件，清空页面的数据
		self.addEventListener('hide', function() {
			window.scrollTo(0, 0)
			page_movie_detail.resetPageData()
		}, false)
	})

	// 添加自定义的事件
	window.addEventListener('movieid', function(e) {
		var id = e.detail.id
		plus.nativeUI.showWaiting("加载中...")
		mui.getJSON(baseUrl + '/v2/movie/subject/' + id, function(res) {
			page_movie_detail.title = res.title // 标题
			page_movie_detail.cover = res.images.large // 图像
			page_movie_detail.score = res.rating.average // 评分
			page_movie_detail.ratingCount = res.ratings_count
			page_movie_detail.summary = res.summary
			page_movie_detail.countries = res.countries.toString().replace('/,/g', '/')
			page_movie_detail.year = res.year
			page_movie_detail.genres = res.genres.toString().replace('/,/g', '/')
			page_movie_detail.casts = res.casts
			page_movie_detail.directors = res.directors
			plus.nativeUI.closeWaiting()
		})
		var page_movie_detail = new Vue({
			el: '#mywrap',
			data: getDefaultData(),
			methods: {
				// 重置数据
				resetPageData: function() {
					Object.assign(this.$data, getDefaultData())
				},
				// 打开演员详情
				open_detail: function(item) {}
			}
		})
	})
})();