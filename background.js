chrome.alarms.onAlarm.addListener(async function (alarm) {
	if (alarm.name) {
		const taskId = alarm.name;
		chrome.storage.sync.get("tasks", function (data) {
			const tasks = data.tasks || [];
			const pendingTask = tasks.find((task) => task.taskId === taskId);
			chrome.runtime.sendMessage({
				action: "pendingTask",
				pendingTask: pendingTask,
			});
		});
	}
});
