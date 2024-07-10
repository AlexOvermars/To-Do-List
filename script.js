let masterBinId = "666a23f8acd3cb34a856af46";

async function getData(binId) {
  let binLink = "https://api.jsonbin.io/v3/b/" + binId;
  let response = await fetch(binLink, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key" : "$2a$10$z/KLmjEMz3cBBolQ34Ua4.LvE1fi9hK3K8hBM8nkSONYTWqbaxog6",
        "X-Access-Key" : "$2a$10$t50e1.0jZIpPFAfZpMTpYumOvHesFuzi40l8dD10Vkf0zZImUwmT."
      },
    });
  response = await response.json();
  return response["record"];
}

async function putData(binId, data) {
  let binLink = "https://api.jsonbin.io/v3/b/" + binId;
  let response = await fetch(binLink, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key" : "$2a$10$z/KLmjEMz3cBBolQ34Ua4.LvE1fi9hK3K8hBM8nkSONYTWqbaxog6",
        "X-Access-Key" : "$2a$10$t50e1.0jZIpPFAfZpMTpYumOvHesFuzi40l8dD10Vkf0zZImUwmT."
      },
      body: JSON.stringify(data)
  });
  response = await response.json();
  return response;
}

async function addTask(binId, taskName, taskDesc) {
  // data is a dictionary of the task names and descriptions
  let data = await getData(binId);
  data[taskName] = taskDesc;
  await putData(binId, data);
}

async function deleteTask(binId, taskName) {
  // data is a dictionary of the task names and descriptions
  let data = await getData(binId);
  delete data[taskName];
  await putData(binId, data);
}

async function addDir(binName) {
  let masterBinData = await getData(masterBinId);
  let binLink = "https://api.jsonbin.io/v3/b";
  let response = await fetch(binLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key" : "$2a$10$z/KLmjEMz3cBBolQ34Ua4.LvE1fi9hK3K8hBM8nkSONYTWqbaxog6",
        "X-Access-Key" : "$2a$10$t50e1.0jZIpPFAfZpMTpYumOvHesFuzi40l8dD10Vkf0zZImUwmT.",
        "X-Bin-Name" : binName
      },
      body: JSON.stringify({"" : ""}),
    });
  response = await response.json();
  console.log(response);
  await addTask(masterBinId, binName, response["metadata"]["id"]);
  
  let stickyNotesContainer = document.querySelector('.sticky-notes-container');
  let binDiv = document.createElement("div");
  binDiv.id = response["metadata"]["id"];

  let title = document.createElement("h1");
  title.textContent = binName;
  binDiv.appendChild(title);

  binDiv.classList.add("sticky-note");
  stickyNotesContainer.appendChild(binDiv);
  return response;
}

async function deleteDir(binId) {
  let binLink = "https://api.jsonbin.io/v3/b/" + binId;
  let response = await fetch(binLink, {
      method: "DELETE",
      headers: {
        "X-Master-Key" : "$2a$10$z/KLmjEMz3cBBolQ34Ua4.LvE1fi9hK3K8hBM8nkSONYTWqbaxog6",
        "X-Access-Key" : "$2a$10$t50e1.0jZIpPFAfZpMTpYumOvHesFuzi40l8dD10Vkf0zZImUwmT."
      },
    });
  response = await response.json();
  return response;
}

async function deleteButtonFunction(event) {
  let binId = event.target.parentNode.parentNode.parentNode.id;
  let taskName = event.target.parentNode.textContent;
  await deleteTask(binId, event.target.id);
  event.target.parentNode.outerHTML = "";
}

async function updateButtonFunction() {
  let bins = await getData(masterBinId);
  let dirInput = document.getElementById("updateDirInput");
  dirInput = dirInput.value;
  dirInput.trim();
  
  let oldNameInput = document.getElementById("updateOldNameInput");
  oldNameInput = oldNameInput.value;
  oldNameInput.trim();
  
  let newNameInput = document.getElementById("updateNewNameInput");
  newNameInput = newNameInput.value;
  newNameInput.trim();
  
  let descInput = document.getElementById("updateDescInput");
  descInput = descInput.value;
  descInput.trim();
  
  let binData = await getData(bins[dirInput]);
  
  // Check directory exists
  if (dirInput.length != 0 && bins[dirInput] != null) {
    if (oldNameInput.length != 0 && binData[oldNameInput] != null) {
      if (descInput.length != 0) {
        // With new task name
        if (newNameInput.length != 0) {
          await deleteTask(bins[dirInput], oldNameInput);
          document.getElementById(oldNameInput).parentNode.outerHTML = "";
          
          await addTask(bins[dirInput], newNameInput, descInput);
          let newTask = bulletPoint(newNameInput, descInput);
          document.getElementById(bins[dirInput]).lastChild.appendChild(newTask);
          alert(`Task Added to ${dirInput}`);
        }
        // No new task name
        else {
          binData[oldNameInput] = descInput;
          await putData(bins[dirInput], binData);
          let newTask = bulletPoint(oldNameInput, descInput);
          document.getElementById(bins[dirInput]).lastChild.appendChild(newTask);
          alert(`Task Added to ${dirInput}`);
        }
      }
      else {
        alert("Need a task description");
      }
    }
    else {
      alert("Need a task name");
    }
  }
  // No such directory exists
  else {
    alert("No such directory found");
  }
  
  document.getElementById("updateDirInput").value = "";
  document.getElementById("updateOldNameInput").value = "";
  document.getElementById("updateNewNameInput").value = "";
  document.getElementById("updateDescInput").value = "";
}

async function addButtonFunction() {
  let bins = await getData(masterBinId);
  let dirInput = document.getElementById("addDirInput");
  dirInput = dirInput.value;
  dirInput.trim();
  
  let nameInput = document.getElementById("addNameInput");
  nameInput = nameInput.value;
  nameInput.trim();
  
  let descInput = document.getElementById("addDescInput");
  descInput = descInput.value;
  descInput.trim();
  
  // Check directory exists
  if (dirInput.length != 0 && bins[dirInput] != null) {
    if (nameInput.length != 0) {
      if (descInput.length != 0) {
        await addTask(bins[dirInput], nameInput, descInput);
        let newTask = bulletPoint(nameInput, descInput);
        document.getElementById(bins[dirInput]).lastChild.appendChild(newTask);
        alert(`Task Added to ${dirInput}`);
      }
      else {
        alert("Need a task description");
      }
    }
    else {
      alert("Need a task name");
    }
  }
  // No such directory exists
  else {
    alert("No such directory found");
  }
  
  document.getElementById("addDirInput").value = "";
  document.getElementById("addNameInput").value = "";
  document.getElementById("addDescInput").value = "";
}

async function addDirFunction(event) {
  let dirInput = document.getElementById("addDirInput2");
  dirInput = dirInput.value;
  dirInput.trim();
  addDir(dirInput);
}

async function deleteDirFunction(event) {
  let dirInput = document.getElementById("delDirInput");
  dirInput = dirInput.value;
  dirInput.trim();
  
  let masterBinData = await getData(masterBinId);
  let binId = masterBinData[dirInput];
  
  await deleteTask(masterBinId, dirInput);
  await deleteDir(binId);
  
  document.getElementById(binId).outerHTML = "";
}

function bulletPoint(taskName, taskDescInput) {
  let taskTitle = document.createElement("li");
  let taskDesc = document.createElement("ul");
  let taskDesc2 = document.createElement("li");
  let deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.onclick = deleteButtonFunction;
  deleteButton.id = taskName;
  taskDesc2.textContent = taskDescInput;
  taskTitle.textContent = taskName;
  taskTitle.innerHTML += "&nbsp;";
  taskTitle.appendChild(deleteButton);
  taskDesc.appendChild(taskDesc2);
  taskTitle.appendChild(taskDesc);
  
  return taskTitle;
}

async function main() {
  let stickyNotesContainer = document.querySelector('.sticky-notes-container');
  let binData = await getData(masterBinId);
  let binArr = Object.keys(binData);
  for (let bin of binArr) {
    let binDiv = document.createElement("div");
    binDiv.id = binData[bin];
    
    let title = document.createElement("h1");
    title.textContent = bin;
    binDiv.appendChild(title);
    
    binDiv.classList.add("sticky-note");
    stickyNotesContainer.appendChild(binDiv);
    
    // The dictionary of key/value pairs that contain task names and descriptions
    let taskData = await getData(binData[bin]);
    // Array of each task name
    let taskArr = Object.keys(taskData);
    let taskList = document.createElement("ul");
    
    for (let task of taskArr) {
      if (task.length != 0) {
        // Add task title with delete button
        let taskTitle = bulletPoint(task, taskData[task]);
        taskList.appendChild(taskTitle);
      }
    }
    document.getElementById(binData[bin]).appendChild(taskList);
  }
  
  
  let addUpdateDiv = document.createElement("div");
  
  // Add Task
  let addLabel = document.createElement("h3");
  addLabel.textContent = "Add Task";
  addUpdateDiv.appendChild(addLabel);
  
  let addDirInput = document.createElement("input");
  addDirInput.placeholder = "Directory Name";
  addDirInput.id = "addDirInput";
  addUpdateDiv.appendChild(addDirInput);
  addUpdateDiv.appendChild(document.createElement("br"));
  
  let addNameInput = document.createElement("input");
  addNameInput.placeholder = "Task Name";
  addNameInput.id = "addNameInput";
  addUpdateDiv.appendChild(addNameInput);
  
  let addDescInput = document.createElement("input");
  addDescInput.placeholder = "Task Description";
  addDescInput.id = "addDescInput";
  addUpdateDiv.appendChild(addDescInput);
  
  let addButton = document.createElement("button");
  addButton.onclick = addButtonFunction;
  addButton.textContent = "Add";
  addUpdateDiv.appendChild(addButton);
  
  // Update Task
  let updateLabel = document.createElement("h3");
  updateLabel.textContent = "Update Task";
  addUpdateDiv.appendChild(updateLabel);
  
  let updateDirInput = document.createElement("input");
  updateDirInput.placeholder = "Directory Name";
  updateDirInput.id = "updateDirInput";
  addUpdateDiv.appendChild(updateDirInput);
  addUpdateDiv.appendChild(document.createElement("br"));
  
  let updateOldName = document.createElement("input");
  updateOldName.placeholder = "Task Name";
  updateOldName.id = "updateOldNameInput";
  addUpdateDiv.appendChild(updateOldName);
  addUpdateDiv.appendChild(document.createElement("br"));
  
  let updateNewName = document.createElement("input");
  updateNewName.placeholder = "New Task Name";
  updateNewName.id = "updateNewNameInput";
  addUpdateDiv.appendChild(updateNewName);
  
  let updateDesc = document.createElement("input");
  updateDesc.placeholder = "Task Description";
  updateDesc.id = "updateDescInput";
  addUpdateDiv.appendChild(updateDesc);
  
  let updateButton = document.createElement("button");
  updateButton.onclick = updateButtonFunction;
  updateButton.textContent = "Update";
  addUpdateDiv.appendChild(updateButton);
  document.body.appendChild(addUpdateDiv);
  
  // Add Directory
  let addDirTitle = document.createElement("h3");
  addDirTitle.textContent = "Add Directory";
  addUpdateDiv.appendChild(addDirTitle);
  
  let addDirInput2 = document.createElement("input");
  addDirInput2.placeholder = "Directory Name";
  addDirInput2.id = "addDirInput2";
  addUpdateDiv.appendChild(addDirInput2);
  addUpdateDiv.appendChild(document.createElement("br"));
  
  let addDirButton = document.createElement("button");
  addDirButton.onclick = addDirFunction;
  addDirButton.textContent = "Add";
  addUpdateDiv.appendChild(addDirButton);
  
  // Delete Directory
  let delDirTitle = document.createElement("h3");
  delDirTitle.textContent = "Delete Directory";
  addUpdateDiv.appendChild(delDirTitle);
  
  let delDirInput = document.createElement("input");
  delDirInput.placeholder = "Directory Name";
  delDirInput.id = "delDirInput";
  addUpdateDiv.appendChild(delDirInput);
  addUpdateDiv.appendChild(document.createElement("br"));
  
  let delDirButton = document.createElement("button");
  delDirButton.onclick = deleteDirFunction;
  delDirButton.textContent = "Delete";
  addUpdateDiv.appendChild(delDirButton);
}
  
main();