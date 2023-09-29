document.addEventListener("DOMContentLoaded", function () {
	const timeInput = document.querySelector("#reminder-time");
	const taskInput = document.querySelector("#task-input");
	const reminderBtn = document.querySelector("#reminder-btn");
	const tasksContainer = document.querySelector(".tasks-container");

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
			const updatedTasks = tasks.filter((task) => task.taskId !== id);

			chrome.storage.sync.set({ tasks: updatedTasks }, function () {
				renderTasks();
			});
		});
	}

	renderTasks();

	reminderBtn.addEventListener("click", async function () {
		const reminderTime = timeInput.value;
		const task = taskInput.value;
		const userLocation = await fetchLocationInfo();
		if (reminderTime && task) {
			const taskId = uid();
			const taskObject = {
				taskId,
				time: reminderTime,
				task,
				userLocation,
			};
			saveTask(taskObject);
		} else {
			alert("Please enter both a reminder time and a task.");
		}
	});

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
				alert("Task saved successfully!");
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
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.action === "pendingTask") {
		const task = message.pendingTask;
	}
});

const uid = function () {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

async function fetchLocationInfo() {
	try {
		const response = await fetch("https://ipinfo.io/json");
		const data = await response.json();

		// const { city, region, country, loc } = data;
		// const userLocation = `City: ${city}, Region: ${region}, Country: ${country}, Location: ${loc}`;

		return data;
	} catch (error) {}
}
