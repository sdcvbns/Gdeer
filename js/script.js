
const scriptURL = 'https://script.google.com/macros/s/AKfycbzMulC6oUPo7D5WR8xYR2pZ2EcB824VWmTF_VaEvuy10YhR6fU4lGzWhEXLAZ9CBfvD/exec';
let allData = [];
let editRow = null;

function fetchData() {
  fetch(scriptURL)
    .then(res => res.json())
    .then(rows => {
      allData = rows.slice(1).map((row, i) => ({
        row: i + 2,
        company: row[0],
        part: row[1],
        device: row[2],
        price: row[3]
      }));
      fillCompanyFilter();
      renderTable();
      renderAdminTable();
    });
}

function fillCompanyFilter() {
  const select = document.getElementById("filterCompany");
  const current = select.value;
  const companies = [...new Set(allData.map(item => item.company))];
  select.innerHTML = `<option value="">الكل</option>` + 
    companies.map(c => `<option value="${c}">${c}</option>`).join('');
  select.value = current;
}

function renderTable() {
  const table = document.getElementById('priceTable');
  table.innerHTML = '';
  const filterCompany = document.getElementById("filterCompany").value;
  const filterPart = document.getElementById("filterPart")?.value || "";
  const search = document.getElementById("searchBox").value.toLowerCase();

  allData
    .filter(item =>
      (filterCompany === '' || item.company === filterCompany) &&
      (filterPart === '' || item.part === filterPart) &&
      (item.device.toLowerCase().includes(search))
    )
    .forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.company}</td>
        <td>${item.part}</td>
        <td>${item.device}</td>
        <td>${item.price}</td>
      `;
      table.appendChild(row);
    });
}

function renderAdminTable() {
  const table = document.getElementById('adminTable');
  table.innerHTML = '';
  allData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.company}</td>
      <td>${item.part}</td>
      <td>${item.device}</td>
      <td>${item.price}</td>
      <td>
        <button class="action-btn edit-btn" onclick='editEntry(${JSON.stringify(item)})'>تعديل</button>
        <button class="action-btn delete-btn" onclick='deleteEntry(${item.row})'>حذف</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function addToSheet() {
  const company = document.getElementById('company').value;
  const part = document.getElementById('partType').value;
  const device = document.getElementById('deviceType').value;
  const price = document.getElementById('price').value;

  if (!device || !price) return alert("يرجى ملء جميع الحقول");

  const formData = new FormData();
  formData.append('company', company);
  formData.append('part', part);
  formData.append('device', device);
  formData.append('price', price);

  if (editRow) {
    formData.append('action', 'update');
    formData.append('row', editRow);
  }

  fetch(scriptURL, { method: 'POST', body: formData })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      document.getElementById('deviceType').value = '';
      document.getElementById('price').value = '';
      editRow = null;
      fetchData();
    });
}

function editEntry(item) {
  document.getElementById('company').value = item.company;
  document.getElementById('partType').value = item.part;
  document.getElementById('deviceType').value = item.device;
  document.getElementById('price').value = item.price;
  editRow = item.row;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteEntry(row) {
  if (!confirm("هل أنت متأكد من الحذف؟")) return;
  const formData = new FormData();
  formData.append('action', 'delete');
  formData.append('row', row);
  fetch(scriptURL, { method: 'POST', body: formData })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      fetchData();
    });
}

function filterTable() {
  renderTable();
}

function updatePartFilter() {
  const company = document.getElementById("filterCompany").value;
  const partFilter = document.getElementById("partFilterContainer");
  if (company) {
    partFilter.classList.remove("hidden");
  } else {
    partFilter.classList.add("hidden");
    document.getElementById("filterPart").value = "";
  }
  renderTable();
}

function showSection(id) {
  document.getElementById('admin').classList.add('hidden');
  document.getElementById('viewer').classList.add('hidden');
  document.getElementById('navBar').classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
  if (id === 'viewer') fetchData();
  if (id === 'admin') document.getElementById('navBar').classList.remove('hidden');
}

function checkAdminAccess() {
  const pass = prompt("أدخل رمز الدخول");
  if (pass === "13571357") {
    showSection('admin');
  }
}

setInterval(fetchData, 10000);
window.onload = fetchData;

document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('selectstart', event => event.preventDefault());
document.addEventListener('copy', event => event.preventDefault());
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey && e.key === 'u') || 
      (e.ctrlKey && e.key === 'c') || 
      (e.ctrlKey && e.shiftKey && e.key === 'I') || 
      (e.key === 'F12')) {
    e.preventDefault();
  }
});
