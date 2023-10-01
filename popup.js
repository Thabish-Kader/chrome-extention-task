document.addEventListener("DOMContentLoaded", function () {
	const timeInput = document.querySelector("#reminder-time");
	const taskInput = document.querySelector("#task-input");
	const reminderBtn = document.querySelector("#reminder-btn");
	const contentBtn = document.querySelector("#content-btn");
	const tasksContainer = document.querySelector(".tasks-container");

	renderTasks();

	reminderBtn.addEventListener("click", async () => {
		const reminderTime = timeInput.value;
		const task = taskInput.value;

		if (reminderTime && task) {
			const taskId = uid();
			const taskObject = {
				taskId,
				time: reminderTime,
				task,
			};

			saveTask(taskObject);
		} else {
			alert("Please enter both a reminder time and a task.");
		}
	});

	contentBtn.addEventListener("click", () => {
		chrome.storage.sync.get("tasks", function (data) {
			const tasks = data.tasks || [];

			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				const currentTab = tabs[0];
				const currentUrl = currentTab.url;
				if (currentUrl.includes("github.com")) {
					chrome.tabs.sendMessage(currentTab.id, {
						action: "contentToInject",
						textToInject: tasks,
					});
				}
			});
		});
	});

	function renderTasks() {
		// Retrieve tasks from Chrome storage
		chrome.storage.sync.get("tasks", function (data) {
			const tasks = data.tasks || [];

			// Check if there are tasks to display
			if (tasks.length > 0) {
				tasksContainer.style.display = "block"; // Show the container
				tasksContainer.innerHTML = ""; // Clear previous tasks

				// Loop through tasks and render each one
				for (const taskObject of tasks) {
					const taskElement = document.createElement("div");
					taskElement.classList.add("task");
					taskElement.innerHTML = `
					<p><strong>Task:</strong> ${taskObject.task}</p>
                    <p><strong>Reminder Time:</strong> ${new Date(
						taskObject.time
					).toLocaleDateString(undefined, {
						day: "numeric",
						month: "short",
						year: "numeric",
						hour: "numeric",
						minute: "numeric",
					})}</p>
                    <button id="remove-btn">Remove</button>
                `;

					const removeButton =
						taskElement.querySelector("#remove-btn");
					removeButton.addEventListener("click", function () {
						removeTask(taskObject.taskId);
					});

					tasksContainer.appendChild(taskElement);
				}
			} else {
				tasksContainer.style.display = "none"; // Hide the container when no tasks
			}
		});
	}

	function removeTask(id) {
		chrome.storage.sync.get("tasks", function (data) {
			const tasks = data.tasks || [];
			const updatedTasks = tasks.filter((task) => task.taskId !== id);

			chrome.storage.sync.set({ tasks: updatedTasks }, function () {
				renderTasks();
			});
		});
	}

	function saveTask(taskObject) {
		chrome.storage.sync.get("tasks", function (data) {
			const tasks = data.tasks || [];
			const newTasks = [...tasks, taskObject];

			chrome.storage.sync.set({ tasks: newTasks }, function () {
				// Clear the input fields
				timeInput.value = "";
				taskInput.value = "";
				renderTasks();
				setAlarm(taskObject);
			});
		});
	}

	function setAlarm(taskObject) {
		const alarmName = taskObject.taskId;
		const reminderTime = new Date(taskObject.time).getTime();

		chrome.alarms.create(alarmName, {
			when: reminderTime,
		});
	}

	function uid() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}
});
