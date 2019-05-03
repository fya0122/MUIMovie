(function() {
	mui.init();

	function getDefaultData() {
		return {
			name: '',
			enName: '',
			cover: '',
			summary: '',
			works: []
		}
	}

	mui.plusReady(function() {
		var selfPage = new Vue({
			el: '.mui-content',
			data: getDefaultData(),
			methods: {
				resetData: function() {
					Object.assign(this.$data, getDefaultData())
				}
			}
		})

		var self = plus.webview.currentWebview()
		plus.nativeUI.showWaiting('加载中....')
		// 获取接口数据
		mui.getJSON(baseUrl + '/v2/movie/celebrity/' + self.castid, function(res) {
			selfPage.name = res.name
			selfPage.enName = res.enName
			selfPage.cover = res.avatars.large
			selfPage.summary = res.name + ',' + res.gender + ',' + res.born_place
			selfPage.works = res.works

			plus.nativeUI.closeWaiting()
		})

		self.addEventListener('hide', function(e) {
			window.scrollTo(0, 0)
			selfPage.resetData()
		}, false)
	})
})()