(function() {
	mui.init();

	// 添加自定义的事件
	window.addEventListener('movieId', function(event) {
		var id = event.detail.id
		console.log(id)
	})
})