let pickerData = {};
let activePickerType = '';
let activePickerCategory = '';

// Toggle Dropdown Functionality
function toggleDropdown(button) {
    const dropdownContent = button.nextElementSibling;
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

// Load Data for Selected Picker and Category
function loadPickerData(pickerType, category) {
    activePickerType = pickerType;
    activePickerCategory = category;
    
    fetch(`/api/picker-data/${pickerType}`)
        .then(response => response.json())
        .then(data => {
            pickerData = data;
            showSection(category);
        })
        .catch(error => console.error('Error loading picker data:', error));
}

// Show Editable Section for Selected Category
function showSection(category) {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Edit ${capitalize(category)} Picker</h2>
        <input type="text" id="${category}Input" placeholder="Add new item...">
        <button onclick="addItem('${category}')">Add</button>
        <ul id="${category}List"></ul>
        <button onclick="saveChanges()">Save Changes</button>
        <button onclick="closePreferences()">Close Preferences</button>
    `;
    updateList(category);
}

// Add New Item
function addItem(category) {
    const input = document.getElementById(`${category}Input`).value.trim();
    if (input && !pickerData[category].includes(input)) {
        pickerData[category].push(input);
        updateList(category);
        document.getElementById(`${category}Input`).value = '';
    }
}

// Update List with Edit/Delete Buttons
function updateList(category) {
    const list = document.getElementById(`${category}List`);
    list.innerHTML = '';
    pickerData[category].forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="text" value="${item}" onchange="editItem('${category}', ${index}, this.value)">
            <button onclick="deleteItem('${category}', ${index})">Delete</button>
        `;
        list.appendChild(li);
    });
}

// Edit Item
function editItem(category, index, newValue) {
    pickerData[category][index] = newValue;
}

// Delete Item
function deleteItem(category, index) {
    pickerData[category].splice(index, 1);
    updateList(category);
}

// Save Changes to JSON
function saveChanges() {
    fetch(`/api/picker-data/${activePickerType}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pickerData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Changes saved!');
        } else {
            alert('Error saving changes');
        }
    })
    .catch(error => {
        console.error('Error saving data:', error);
        alert('Error saving changes');
    });
}

// Close Preferences Window
function closePreferences() {
    window.close();
}

// Capitalize Helper
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
