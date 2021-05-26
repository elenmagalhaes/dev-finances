const App = {
    init(){
        Operation.all.forEach((transaction, index) => {
            Structure.addTransaction(transaction, index);
        });

        Structure.updateBalance();    
        Storage.set(Operation.all); 
    },
    reload(){
        Structure.clearTransactions();
        App.init();
    }
};

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
    },
    set(transactions){
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
    }
};

const Operation = {
    all: Storage.get(),
    add(transaction){
        Operation.all.push(transaction);
        App.reload();
    },
    remove(index){
        Operation.all.splice(index, 1);
        App.reload();
    },
    incomes(){
        let income = 0;
        Operation.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        });

        return income;
    },
    expenses(){
        let expense = 0;
        Operation.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        });

        return expense;
    },
    total(){
        return Operation.incomes() + Operation.expenses();
    }
};

const Structure = {
    tableTransaction: document.querySelector('table#data-table tbody'),
    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = Structure.createHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        Structure.tableTransaction.appendChild(tr);
    },
    createHTMLTransaction(transaction, index){
        const cssClass = transaction.amount > 0 ? 'income' : 'expense';
        const amount = Utils.formatCurrency(transaction.amount);
        const html = `                                         
            <td class="description">${transaction.description}</td>
            <td class="${cssClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Operation.remove(${index})" src="../assets/minus.svg" alt="Remover transação">
            </td>
        `
        return html;
    },
    updateBalance(){
        document.getElementById('incomesDisplay').innerHTML = Utils.formatCurrency(Operation.incomes()); 
        document.getElementById('expensesDisplay').innerHTML = Utils.formatCurrency(Operation.expenses()); 
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Operation.total()); 
    },
    clearTransactions(){
        Structure.tableTransaction.innerHTML = "";
    }
};

const Form = {
    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    date: document.getElementById('date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    formatFields(){
        let { description, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        
        return { description, amount, date }
    },
    validateFields(){
        const { description, amount, date } = Form.getValues();
        
        if(description.trim() === '' || amount.trim() === '' || date.trim() === ''){
            throw new Error('Por favor, preencha todos os campos.');
        }
    },
    clearData(){
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
    },
    saveTransaction(event){
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatFields();
            Operation.add(transaction);
            Form.clearData();
            Modal.close();
        } catch (error) {
            console.log(error.message);
        }
      
    }
};

const Modal = {
    open(){
     document.querySelector('.modal-overlay').classList.add('active');
    },
    close(){
     document.querySelector('.modal-overlay').classList.remove('active');
    }
};

const Utils = {
    formatAmount(value){
        value = value * 100;
        return Math.round(value);
    },
    formatDate(date){
        const splittedDate = date.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value){
        const signal = Number(value) < 0 ? '-' : '';
        value = String(value).replace(/\D/g, '');
        value = Number(value) / 100;
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value;
    }
};

App.init();
