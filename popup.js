document.addEventListener("DOMContentLoaded", function () {
	const timeInput = document.querySelector("#reminder-time");
	const taskInput = document.querySelector("#task-input");
	const reminderBtn = document.querySelector("#reminder-btn");
	const tasksContainer = document.querySelector(".tasks-container");
	const includeLocation =
		document.querySelector("#location-checkbox").checked;

	function renderTasks() {
		chrome.storage.sync.get("tasks", function (data) {
			const tasks = data.tasks || [];

			tasksContainer.innerHTML = "";

			for (const taskObject of tasks) {
				const taskElement = document.createElement("div");
				taskElement.classList.add("task");
				taskElement.innerHTML = `
                <p><strong>Reminder Time:</strong> ${taskObject.time}</p>
                <p><strong>Task:</strong> ${taskObject.task}</p>
                <button id="remove-btn">Remove</button>
            `;

				const removeButton = taskElement.querySelector("#remove-btn");
				removeButton.addEventListener("click", function () {
					removeTask(taskObject.taskId);
				});

				tasksContainer.appendChild(taskElement);
			}
		});
	}

	function removeTask(id) {
		chrome.storage.sync.get("tasks", function (data) {
			const tasks = data.tasks || [];
			console.log(tasks);
			const updatedTasks = tasks.filter((task) => task.taskId !== id);

			chrome.storage.sync.set({ tasks: updatedTasks }, function () {
				renderTasks();
			});
		});
	}

	renderTasks();

	reminderBtn.addEventListener("click", function () {
		const reminderTime = timeInput.value;
		const task = taskInput.value;

		// Check if the inputs are not empty
		if (reminderTime && task) {
			const taskId = uid();
			const taskObject = {
				taskId,
				time: reminderTime,
				task: task,
			};

			// Save the task object to Chrome storage
			chrome.storage.sync.get("tasks", function (data) {
				const tasks = data.tasks || [];
				const newTasks = [...tasks, taskObject];

				chrome.storage.sync.set({ tasks: newTasks }, function () {
					// Clear the input fields
					timeInput.value = "";
					taskInput.value = "";
					renderTasks();
					setAlarm(taskObject);
					alert("Task saved successfully!");
				});
			});
		} else {
			alert("Please enter both a reminder time and a task.");
		}
	});

	function setAlarm(taskObject) {
		const alarmName = taskObject.task;
		const reminderTime = new Date(taskObject.time).getTime();

		const now = new Date().getTime();
		const delay = Math.max(reminderTime - now, 0);

		chrome.alarms.create(alarmName, {
			when: reminderTime,
		});
	}
});

const uid = function () {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
