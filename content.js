chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.action === "contentToInject") {
		const task = message.textToInject;
		insertTaskContent(task);
	}
});

function insertTaskContent(task) {
	const dashboardSidebar = document.querySelector(".dashboard-sidebar");

	if (dashboardSidebar) {
		const taskContainer = document.createElement("div");

		task.forEach((taskItem, index) => {
			const taskElement = document.createElement("div");
			taskElement.textContent = `Task ${index + 1}: ${
				taskItem.task
			}, Time: ${new Date(taskItem.time).toLocaleString(undefined, {
				day: "numeric",
				month: "short",
				year: "numeric",
				hour: "numeric",
				minute: "numeric",
			})}`;

			taskContainer.appendChild(taskElement);
		});

		dashboardSidebar.appendChild(taskContainer);
	} else {
		console.log(
			"Target div not found. Make sure the page structure is as expected."
		);
	}
}
