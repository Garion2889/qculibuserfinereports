// script.js

document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
  
  // Event Listeners
  document.getElementById('branchFilter').addEventListener('change', loadAllData);
  document.getElementById('studentSearch').addEventListener('input', loadAllData);
  document.getElementById('userTypeFilter').addEventListener('change', updateChart);
  document.getElementById('activityFilter').addEventListener('change', updateChart);
});

// Global user cache
let usersCache = [];

async function loadAllData() {
  await fetchUsers();
  await fetchAlumni();
  await fetchFines();
}

async function fetchUsers() {
  const res = await fetch('http://localhost:3000/api/users');
  const users = await res.json();
  usersCache = users; // Save for filtering and searching

  const branchFilterValue = document.getElementById('studentBranchFilter').value.trim().toLowerCase();
  const searchValue = document.getElementById('studentSearch').value.trim();

  const tbody = document.getElementById('studentTableBody');
  tbody.innerHTML = '';

  const filteredUsers = users.filter(user => {
    const matchBranch = branchFilterValue ? user.BRANCH.toLowerCase() === branchFilterValue : true;
    const matchSearch = searchValue ? user.STUDENT_ID.toString().includes(searchValue) : true;
    return matchBranch && matchSearch;
  });

  filteredUsers.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2 px-5">${user.NAME}</td>
      <td class="py-2 px-5">${user.STUDENT_ID}</td>
      <td class="py-2 px-5">${user.BRANCH}</td>
      <td class="py-2 px-5">${user.STATUS}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function fetchAlumni() {
  const res = await fetch('http://localhost:3000/api/active-alumni');
  const users = await res.json();
  
  const branchFilterValue = document.getElementById('branchFilter').value.toLowerCase();
  const searchValue = document.getElementById('studentSearch').value.trim();

  const tbody = document.getElementById('alumniTableBody');
  tbody.innerHTML = '';

  const filteredUsers = users.filter(user => {
    const matchBranch = branchFilterValue ? user.BRANCH.toLowerCase() === branchFilterValue : true;
    const matchSearch = searchValue ? user.STUDENT_ID.toString().includes(searchValue) : true;
    return matchBranch && matchSearch;
  });

  // ⚡ use filteredUsers instead of users!
  filteredUsers.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2 px-5">${user.NAME}</td>
      <td class="py-2 px-5">${user.STUDENT_ID}</td>
      <td class="py-2 px-5">${user.BRANCH}</td>
      <td class="py-2 px-5">${user.STATUS}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function fetchFines() {
  const res = await fetch('http://localhost:3000/api/fines');
  const fines = await res.json();

  const tbody = document.getElementById('fineTableBody');
  tbody.innerHTML = '';

  fines.forEach(fine => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2 px-5">${fine.NAME}</td>
      <td class="py-2 px-5">${fine.STUDENT_ID}</td>
      <td class="py-2 px-5">${fine.BRANCH}</td>
      <td class="py-2 px-5">${fine.ROLE}</td>
      <td class="py-2 px-5">${fine.DUE_DATE}</td>
      <td class="py-2 px-5">${fine.STATUS}</td>
      <td class="py-2 px-5">${fine.FINE_AMOUNT}</td>
      <td class="py-2 px-5">
        ${fine.STATUS.toLowerCase() === 'unpaid' ? 
          `<button class="text-blue-600 hover:underline" onclick="payFine('${fine.STUDENT_ID}', this)">Pay</button>` : 
          `<span class="text-green-600">Paid</span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Chart.js Setup
let userActivityChart;

function updateChart() {
  const userType = document.getElementById('userTypeFilter').value.toLowerCase();
  const activityType = document.getElementById('activityFilter').value.toLowerCase();

  // Dummy chart data simulation
  let borrowed = 0;
  let overdue = 0;

  usersCache.forEach(user => {
    if (userType && user.ROLE.toLowerCase() !== userType) return;
    // Simulate some borrowed and overdue counts
    borrowed += Math.floor(Math.random() * 5); 
    overdue += Math.floor(Math.random() * 2);
  });

  const ctx = document.getElementById('userActivityChart').getContext('2d');

  if (userActivityChart) {
    userActivityChart.destroy();
  }

  userActivityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Borrowed Books', 'Overdue Books'],
      datasets: [{
        label: 'Number of Books',
        data: activityType === 'borrowed' ? [borrowed, 0] : activityType === 'overdue' ? [0, overdue] : [borrowed, overdue],
        backgroundColor: ['#3B82F6', '#EF4444']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
async function payFine(studentId) {
  try {
    const response = await fetch('http://localhost:3000/api/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_id: studentId }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      fetchFines()
    } else {
      alert('Payment failed: ' + data.error);
    }
  } catch (error) {
    console.error('Error paying fine:', error);
  }
}
document.getElementById('user-menu-toggle').addEventListener('click', function() {
  const menu = document.getElementById('user-menu');
  menu.classList.toggle('hidden');
});
const sectionButtons = document.querySelectorAll('button[data-section]');

// Add event listeners to each button
sectionButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Get the section name from the button's data-section attribute
    const sectionName = button.getAttribute('data-section');

    // Hide all sections first
    const allSections = document.querySelectorAll('main section');
    allSections.forEach(section => {
      section.classList.add('hidden');
    });

    // Show the clicked section
    const activeSection = document.getElementById(`${sectionName}Section`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
    }
  });
});
const buttons = document.querySelectorAll('.selectable-btn');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    // First, remove "active" styles from all buttons
    buttons.forEach(btn => {
      btn.classList.remove('bg-blue-400'); // Active darker background
      btn.classList.add('bg-white');    // Reset to default
      button.classList.remove('text-gray-50')
      button.classList.add('text-gray-900');
    });

    // Then, add "active" style to the clicked button
    button.classList.remove('bg-white');
    button.classList.add('bg-blue-400');
    button.classList.add('text-gray-50');
  });
});
