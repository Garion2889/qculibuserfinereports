// script.js

document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
  
  // Event Listeners
  document.getElementById('roleFilter').addEventListener('change', loadAllData);
  document.getElementById('branchFilter').addEventListener('change', loadAllData);
  document.getElementById('studentSearch').addEventListener('input', loadAllData);
  document.getElementById('userTypeFilter').addEventListener('change', updateChart);
  document.getElementById('activityFilter').addEventListener('change', updateChart);
});

// Global user cache
let usersCache = [];

async function loadAllData() {
  await fetchUsers();
  await fetchActiveAlumni();
  await fetchFines();
}

async function fetchUsers() {
  const res = await fetch('http://localhost:3000/api/users');
  const users = await res.json();
  usersCache = users; // Save for filtering and searching

  const roleFilterValue = document.getElementById('roleFilter').value.toLowerCase();
  const branchFilterValue = document.getElementById('branchFilter').value.toLowerCase();
  const searchValue = document.getElementById('studentSearch').value.trim();

  const tbody = document.getElementById('userTableBody');
  tbody.innerHTML = '';

  const filteredUsers = users.filter(user => {
    const matchRole = roleFilterValue ? user.ROLE.toLowerCase() === roleFilterValue : true;
    const matchBranch = branchFilterValue ? user.BRANCH.toLowerCase() === branchFilterValue : true;
    const matchSearch = searchValue ? user.STUDENT_ID.toString().includes(searchValue) : true;
    return matchRole && matchBranch && matchSearch;
  });

  filteredUsers.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2 px-5">${user.NAME}</td>
      <td class="py-2 px-5">${user.STUDENT_ID}</td>
      <td class="py-2 px-5">${user.BRANCH}</td>
      <td class="py-2 px-5">${user.ROLE}</td>
      <td class="py-2 px-5">${user.STATUS}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function fetchActiveAlumni() {
  const res = await fetch('http://localhost:3000/api/active-alumni');
  const users = await res.json();

  const tbody = document.getElementById('activeAlumniTableBody');
  tbody.innerHTML = '';

  users.forEach(user => {
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
