// Função para abrir o banco de dados
function openDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open('RegistroDB', 1);

        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains('registros')) {
                db.createObjectStore('registros', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Função para adicionar um registro
function addRegistro(db, registro) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(['registros'], 'readwrite');
        let objectStore = transaction.objectStore('registros');
        let request = objectStore.add(registro);

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Função para obter todos os registros
function getRegistros(db) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(['registros'], 'readonly');
        let objectStore = transaction.objectStore('registros');
        let request = objectStore.getAll();

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Função para excluir um registro
function deleteRegistro(db, id) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(['registros'], 'readwrite');
        let objectStore = transaction.objectStore('registros');
        let request = objectStore.delete(id);

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Manipuladores de eventos
document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    let nome = document.getElementById('nome').value;
    let acao = document.getElementById('acao').value;
    let funcionario = document.getElementById('funcionario').value;
    let turno = document.getElementById('turno').value;
    let registro = {
        nome: nome,
        acao: acao,
        funcionario: funcionario,
        turno: turno,
        horario: new Date().toLocaleString()
    };

    let db = await openDB();
    await addRegistro(db, registro);
    atualizarRegistros();
    document.getElementById('registroForm').reset();
});

async function atualizarRegistros() {
    let db = await openDB();
    let registros = await getRegistros(db);

    let lista = document.getElementById('registroLista');
    lista.innerHTML = '';

    registros.forEach(registro => {
        let item = document.createElement('li');
        item.textContent = `Nome: ${registro.nome}, Ação: ${registro.acao}, Funcionário: ${registro.funcionario}, Turno: ${registro.turno}, Horário: ${registro.horario}`;
        
        let deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = async function() {
            await deleteRegistro(db, registro.id);
            atualizarRegistros();
        };

        item.appendChild(deleteBtn);
        lista.appendChild(item);
    });
}

// Função para imprimir registros
document.getElementById('printBtn').addEventListener('click', function() {
    window.print();
});

// Função para salvar registros em um arquivo
document.getElementById('saveBtn').addEventListener('click', async function() {
    let db = await openDB();
    let registros = await getRegistros(db);

    let data = registros.map(registro => `Nome: ${registro.nome}, Ação: ${registro.acao}, Funcionário: ${registro.funcionario}, Turno: ${registro.turno}, Horário: ${registro.horario}`).join('\n');

    let blob = new Blob([data], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = 'registros.txt';
    a.click();
});

// Atualizar registros ao carregar a página
atualizarRegistros();
