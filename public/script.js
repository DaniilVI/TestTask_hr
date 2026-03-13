let isEditing = false;

async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        const employees = await response.json();

        const tbody = document.getElementById('employeesTableBody');

        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="text-center">Нет сотрудников</td></tr>';
            return;
        }

        tbody.innerHTML = employees.map(emp => `
            <tr class="text-center ${!emp.is_active ? 'row-danger' : ''}">
                <td>${emp.name}</td>
                <td>${formatDate(emp.birth_date)}</td>
                <td>${emp.passport}</td>
                <td>${emp.phone}</td>
                <td>${emp.address}</td>
                <td>${emp.department}</td>
                <td>${emp.position}</td>
                <td>${formatSalary(emp.salary).toString().replace(',', '.')} ₽</td>
                <td>${formatDate(emp.hire_date)}</td>
                <td><span class="${emp.is_active ? 'text-success' : 'text-danger'}">${emp.is_active ? 'Работает' : 'Уволен'}</span></td>
                <td>
                    <button class="button-edit button-start-edit" 
                            data-employee-id="${emp.id}"
                            title="Редактировать">
                    </button>
                </td>
                <td>
                    <button class="button-toggle-status ${emp.is_active ? 'button-fire' : 'button-return-to-work'}" 
                            data-employee-id="${emp.id}"
                            title="${emp.is_active ? 'Уволить' : 'Вернуть на работу'}">
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('employeesTableBody').innerHTML =
            '<tr><td colspan="12" class="text-center text-danger">Ошибка загрузки</td></tr>';
    }
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('ru-RU');
}

function formatSalary(salary) {
    return new Intl.NumberFormat('ru-RU').format(salary);
}

document.addEventListener('click', async (e) => {
    if (e.target.closest('.button-toggle-status')) {
        if (isEditing) return;

        const button = e.target.closest('.button-toggle-status');
        const employeeId = button.dataset.employeeId;

        try {
            const response = await fetch(`/api/employees/${employeeId}/toggle-status`, {
                method: 'PATCH'
            });

            if (response.ok) {
                loadEmployees();
            } else {
                alert('Ошибка сервера');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
        }
    }
});

document.addEventListener('click', async (e) => {
    if (e.target.closest('.button-edit')) {
        const button = e.target.closest('.button-edit');
        const row = button.closest('tr');
        const employeeId = button.dataset.employeeId;

        if (row.classList.contains('editing')) {
            const success = await saveRow(row, employeeId);
            if (!success) {
                return;
            }
            isEditing = false;
            row.classList.remove('editing');
            button.classList.remove('button-confirm-edit');
            button.classList.add('button-start-edit');
            button.title = 'Редактировать';
            loadEmployees();
        } else {
            if (isEditing) return;
            isEditing = true;
            row.classList.add('editing');
            button.classList.add('button-confirm-edit');
            button.classList.remove('button-start-edit');
            button.title = 'Сохранить';
            makeRowEditable(row);
        }
    }
});

function makeRowEditable(row) {
    const cells = row.querySelectorAll('td:nth-child(n+1):nth-child(-n+9)');
    cells.forEach((cell, ind) => {
        const text = cell.textContent.trim();
        switch (ind) {
            case 1:
                cell.innerHTML = `<input type="date" value="${strToDate(text)}" class="form-control">`;
                break;
            case 2:
                cell.innerHTML = `<input type="text" 
                                pattern="\\d{4}\\s\\d{6}"
                                maxlength="11"
                                value="${text}" 
                                class="form-control">`;
                break;
            case 3:
                cell.innerHTML = `<input type="tel" 
                                pattern="(\\+7|8)?[0-9]{10}" 
                                value="${text}" 
                                maxlength="12"
                                class="form-control">`;
                break;
            case 7:
                cell.innerHTML = `<input type="text" value="${parseSalary(text)}" class="form-control">`;
                break;
            case 8:
                cell.innerHTML = `<input type="date" value="${strToDate(text)}" class="form-control">`;
                break;
            default:
                cell.innerHTML = `<input type="text" value="${text}" class="form-control">`;
        }
    });
}

function strToDate(dateStr) {
    const clean = dateStr.replace(/\//g, '.');
    const [day, month, year] = clean.split('.');
    return year && month && day
        ? `${year}-${month}-${day}`
        : '';
}

function parseSalary(salaryStr) {
    return parseFloat(salaryStr.replace(/[^\d.]/g, '')) || 0;
}

function validateData(data) {
    if (data.name.length == 0){
        alert('ФИО не может быть пустым');
        return false;
    }

    if (!/^\d{4}\s\d{6}$/.test(data.passport)) {
        alert('Неверный паспорт');
        return false;
    }

    if (!/^(\+7|8)?9\d{9}$/.test(data.phone) || data.phone.replace(/\D/g, '').length !== 11) {
        alert('Неверный телефон');
        return false;
    }

    const salary = parseFloat(data.salary);
    if (isNaN(salary) || salary < 0) {
        alert('Зарплата не должна быть меньше 0');
        return false;
    }

    const parts = data.salary.toString().split('.');
    if (parts[1] && parts[1].length > 2 || data.salary.toString().replace('.', '').length > 10 || !/^\d+(\.\d{0,2})?$/.test(data.salary)) {
        alert('Неверный формат зарплаты');
        return false;
    }

    return true;
}

async function saveRow(row, employeeId) {
    const inputs = row.querySelectorAll('input');
    const data = {
        name: inputs[0].value,
        birth_date: inputs[1].value,
        passport: inputs[2].value,
        phone: inputs[3].value,
        address: inputs[4].value,
        department: inputs[5].value,
        position: inputs[6].value,
        salary: inputs[7].value,
        hire_date: inputs[8].value
    };

    if (!validateData(data)) return false;

    try {
        const response = await fetch(`/api/employees/${employeeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data)
        });
        
        if (response.ok)
        {
            return true;
        }
        else{
            console.error('Ошибка сервера');
            return false;
        }

    } catch (error) {
        console.error('Ошибка сети:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadEmployees);

const modal = document.getElementById('addEmployeeModal');
const addButton = document.getElementById('addEmployeeButton');
const closeButton = document.getElementById('closeModal');
const cancelButton = document.getElementById('cancelButton');
const form = document.getElementById('employeeForm');

addButton.addEventListener('click', () => {
    if (isEditing) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

closeButton.addEventListener('click', closeModal);
cancelButton.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
});

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    form.reset();
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    if (!validateData(data)) return;
    
    try {
        const response = await fetch('/api/new-employee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            loadEmployees();
        } else {
            alert('Ошибка сервера');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
    }
});