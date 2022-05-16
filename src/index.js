import('./index.css')
import PubSub from 'pubsub-js'
import ToDo from './scripts/to_do'
import Ui from './scripts/ui'

const App
 = (function () {

    let currentActiveView = 'main-tasks'

    function addTask(name, dueDate) {
        const newTask = ToDo.createToDo(name, dueDate)
        Ui.clearTextInput()
        PubSub.publish('new-to-do', newTask)
    }

    function validateTask(msg, userInput) {
        const name = userInput.name
        const dueDate = userInput.dueDate
        Ui.domElements.errorOutput.style.display = 'none'
        if (name.length >= 1 && name.length <= 20) {
            if (msg === 'add-button-clicked') {
                addTask(name, dueDate)
            }
            Ui.clearError()
        }
        else {
            if (msg === 'input' && Ui.domElements.textInput.value === '') {
                
                Ui.clearError()
                return
            }
            Ui.domElements.errorOutput.style.display = 'block'

            Ui.outputError('Title Must be between 1 and 20 characters long')

        }
    }

    function textInputKeydown(key) {
        if (key === 'Enter') {
            PubSub.publish('add-button-clicked', Ui.getUserInput())
        }
    }


    function showCompletedTasks() {

        if (currentActiveView === 'completed-tasks') return

        currentActiveView = 'completed-tasks'
        Ui.clearTaskView()
        for (const task of ToDo.getCompletedTasks()) {
            Ui.appendToDo(task.id, task.name, task.dueDate)
        }
    }


    function showMainTasks() {
        debugger
        if (currentActiveView === 'main-tasks') return

        currentActiveView = 'main-tasks'
        Ui.clearTaskView()
        Ui.appendAddTaskRow()
        for (const task of ToDo.getCurrentMainTasks()) {
            Ui.appendToDo(task.id, task.name, task.dueDate)
        }
    }

    function start() {


        PubSub.subscribe('text-input-keydown', (msg, key) => textInputKeydown(key))
        PubSub.subscribe('add-button-clicked', (msg, userInput) => validateTask(msg, userInput))
        PubSub.subscribe('new-to-do', (msg, task) => Ui.appendToDo(task.id, task.name, task.dueDate))
        PubSub.subscribe('input', (msg, userInput) => validateTask(msg, userInput))
        PubSub.subscribe('to-do-removed', (msg, id) => ToDo.removeToDo(id))
        PubSub.subscribe('to-do-completed', (msg, id) => ToDo.completeToDo(id))
        PubSub.subscribe('completed-requested', (msg, data) => showCompletedTasks())
        PubSub.subscribe('main-tasks-requested', (msg, data) => showMainTasks())
        // PubSub.subscribe('page-loaded', (msg, data) => loadSaved())
        Ui.domElements.addButton.addEventListener('click', () => PubSub.publish('add-button-clicked', Ui.getUserInput()))
        Ui.domElements.textInput.addEventListener('input', () => PubSub.publish('input', Ui.getUserInput()))
        Ui.domElements.textInput.addEventListener('keydown', (e) => PubSub.publish('text-input-keydown', e.key))
        Ui.domElements.completedTasksButton.addEventListener('click', () => PubSub.publish('completed-requested'))
        Ui.domElements.mainTasksButton.addEventListener('click', () => PubSub.publish('main-tasks-requested'))
        // window.addEventListener('load', PubSub.publish('page-loaded'))
        Ui.setDateInputDefaultValue()


        //Testing Reasons

        addTask('Test', new Date())
        console.log(ToDo.getCurrentMainTasks())
    }


    return { start }

})()


App.start()
