CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birth_date DATE,
    passport VARCHAR(20),
    phone VARCHAR(20),
    address TEXT,
    department VARCHAR(100),
    position VARCHAR(100),
    salary NUMERIC(10,2),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO employee (name, birth_date, passport, phone, address, department, position, salary, hire_date)
 VALUES('Оладьев Иван Алексеевич', '1978-03-11', '7361 464322', '+79033427422', 'г. Ярославль, ул. Союзная, д.141, кв.45', 'IT', 'Разработчик', 150000, '2018-01-17'),
  ('Андреева Анастасия Сергеевна', '2001-11-22', '4321 098765', '89622424247', 'г. Ярославль', 'HR', 'Менеджер по продажам', 1050000, '2025-09-13') ON CONFLICT DO NOTHING;