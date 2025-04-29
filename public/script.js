document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
  
  // Event Listeners
  document.getElementById('studentBranchFilter').addEventListener('change', loadAllData);
  document.getElementById('studentSearch').addEventListener('input', loadAllData);
  document.getElementById('alumniBranchFilter').addEventListener('change', loadAllData);
  document.getElementById('alumniSearch').addEventListener('input', loadAllData);
  document.getElementById('userTypeFilter').addEventListener('change', updateChart);
  document.getElementById('activityFilter').addEventListener('change', updateChart);
});

// Global user cache
let usersCache = [];

async function loadAllData() {
  await fetchUsers();
  await fetchFaculty()
  await fetchAlumni();
  await fetchFines();
  await updateChart()
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

async function fetchFaculty() {
  try {
    const res = await fetch('http://localhost:3000/api/faculty');
    const users = await res.json();
    const searchValue = document.getElementById('nameSearch').value.trim().toLowerCase();

    const tbody = document.getElementById('facultyTableBody');
    tbody.innerHTML = '';

    const filteredUsers = users.filter(user => {
      return searchValue ? user.NAME.toLowerCase().includes(searchValue) : true;
    });

    filteredUsers.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="py-2 px-5">${user.NAME}</td>
        <td class="py-2 px-5">${user.STATUS}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
  }
}

async function fetchAlumni() {
  const res = await fetch('http://localhost:3000/api/alumni');
  const users = await res.json();
  
  const branchFilterValue = document.getElementById('alumniBranchFilter').value.toLowerCase();
  const searchValue = document.getElementById('alumniSearch').value.trim();

  const tbody = document.getElementById('alumniTableBody');
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

// Other functions remain unchanged
// ...


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
      <td class="py-2 px-5">${fine.PAYMENT_STATUS}</td>
      <td class="py-2 px-5">${fine.FINE_AMOUNT}</td>
      <td class="py-2 px-5">
        ${fine.PAYMENT_STATUS.toLowerCase() === 'unpaid' ? 
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
  const userTypeFilter = document.getElementById('userTypeFilter').value.toLowerCase();

  // Counters
  const counts = {
    student: { active: 0, inactive: 0 },
    faculty: { active: 0, inactive: 0 },
    alumni: { active: 0, inactive: 0 }
  };

  usersCache.forEach(user => {
    const role = user.ROLE.toLowerCase();
    const status = user.STATUS.toLowerCase();

    if (!counts[role]) return;
    if (userTypeFilter && role !== userTypeFilter) return;

    if (status === 'active') {
      counts[role].active++;
    } else if (status === 'inactive') {
      counts[role].inactive++;
    }
  });

  const ctx = document.getElementById('userActivityChart').getContext('2d');

  if (userActivityChart) {
    userActivityChart.destroy();
  }

  userActivityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Student', 'Faculty', 'Alumni'],
      datasets: [
        {
          label: 'Active',
          data: [counts.student.active, counts.faculty.active, counts.alumni.active],
          backgroundColor: '#10B981' // Green
        },
        {
          label: 'Inactive',
          data: [counts.student.inactive, counts.faculty.inactive, counts.alumni.inactive],
          backgroundColor: '#F59E0B' // Yellow/Orange
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'User Activity by Role and Status'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        },
        x: {
          stacked: true
        },
        y: {
          stacked: true
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

async function sendDueDateNotifications() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const finesQuery = `
      SELECT u.email, u.name, f.student_id, f.due_date, f.status
      FROM fines f
      JOIN users u ON f.student_id = u.student_id
      WHERE f.status = 'Unpaid'
    `;

    const result = await connection.execute(finesQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const fines = result.rows;

    const today = new Date();

    for (const fine of fines) {
      const dueDate = new Date(fine.DUE_DATE);

      // Calculate difference in days
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // in days

      let subject = '';
      let message = '';

      if (diffDays === 3) {
        subject = "Reminder: Your due date is in 3 days!";
        message = `Hi ${fine.NAME},\n\nYour due date is in 3 days.\nPlease settle your fine before ${dueDate.toDateString()}.\n\nThank you!`;
      } else if (diffDays === 0) {
        subject = "Today is your due date!";
        message = `Hi ${fine.NAME},\n\nToday is your due date!\nPlease settle your fine by the end of the day.\n\nThank you!`;
      } else if (diffDays < 0) {
        subject = "Overdue: You missed your due date.";
        message = `Hi ${fine.NAME},\n\nYou have missed your due date (${dueDate.toDateString()}).\nPlease settle your fine immediately.\n\nThank you!`;
      } else {
        continue; // No need to send anything
      }

      const mailOptions = {
        from: 'qculibtest1@gmail.com',
        to: fine.EMAIL,
        subject: subject,
        text: message
      };

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email to', fine.EMAIL, error);
        } else {
          console.log('Notification email sent to', fine.EMAIL, ':', info.response);
        }
      });
    }
  } catch (err) {
    console.error('Error in sending notifications:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}