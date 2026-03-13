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
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${formatDate(emp.birth_date)}</td>
                <td>${emp.passport}</td>
                <td>${emp.phone}</td>
                <td>${emp.address}</td>
                <td>${emp.department}</td>
                <td>${emp.position}</td>
                <td>${formatSalary(emp.salary)} ₽</td>
                <td>${formatDate(emp.hire_date)}</td>
                <td><span class="${emp.is_active ? 'text-success' : 'text-danger'}">${emp.is_active ? 'Работает' : 'Уволен'}</span></td>
                <td></td>
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


document.addEventListener('DOMContentLoaded', loadEmployees);