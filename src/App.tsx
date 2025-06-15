/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { UserWarning } from './UserWarning';
import { Todo } from './types/Todo';
import * as todoService from './api/todos';
// import * as servises from './servises/buttons';
// import { ButtonProp } from './types/Button';
import { ErrorMessage } from './components/ErrorMessage/ErrorMessage';
import { TodoFooter } from './components/TodoFooter';
import { wait } from './servises/delay';
import * as filterServises from './servises/TodoFooter';

export const App: React.FC = () => {
  //#region State
  const [todoTitle, setTodoTitle] = useState('');
  const [appliedTitle, setAppliedTitle] = useState('');
  const [loadContent, setLoadedContent] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [titleInputState, setTitleInputState] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo[] | null>(null);
  //#endregion

  //#region Loading data
  useEffect(() => {
    todoService
      .getTodos()
      .then(response => {
        setLoadedContent(response);
      })
      .catch(error => {
        setErrorMessage('Unable to load todos');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
        throw error;
      });
  }, []);
  //#endregion

  const focusItem = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (focusItem.current) {
      focusItem.current.focus();
    }
  }, []);

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const timer = useRef(0);

  const handleTodoTitle = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    event.preventDefault();
    const newTitle = event.target.value;

    setTodoTitle(newTitle);

    clearTimeout(timer.current);

    timer.current = window.setTimeout(() => {
      setAppliedTitle(newTitle);
    }, 1000);
  };

  //#region Filtering buttons

  const handleFilter = async (filterBy: string) => {
    const initTodos = await todoService.getTodos();
    const filteredTodos = filterServises.filter(initTodos, filterBy);

    setLoadedContent(filteredTodos);
  };
  //#endregion

  //#region Add todo
  const handleAddTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newTodoTitle =
      appliedTitle.length !== 0 ? appliedTitle.trim() : todoTitle.trim();

    if (!newTodoTitle) {
      setErrorMessage('Title should not be empty');

      return;
    }

    const temp: Todo = {
      title: newTodoTitle,
      userId: todoService.USER_ID,
      completed: false,
      id: 0,
    };

    try {
      await todoService.postTodos(temp);

      setTitleInputState(true);
      setTempTodo([temp]);
      setLoadedContent(prev => [...prev, temp]);
      await wait(3000);
    } catch (error) {
      setErrorMessage('Unable to add a todo');
    } finally {
      setTempTodo(null);
      setTodoTitle('');
      setAppliedTitle('');
      setTitleInputState(false);
    }
  };
  //#endregion

  //#region Delete todo
  const handleDeleteTodo = async (dataId: Todo['id']) => {
    try {
      const deletedData = loadContent.find(todo => todo.id === dataId);

      if (!deletedData) {
        setErrorMessage('Todo not found');

        return;
      }

      await todoService.deleteTodos(dataId);

      if (tempTodo === null) {
        setTempTodo([deletedData]);
      } else {
        setTempTodo(prev => [...(prev ?? []), deletedData]);
      }

      await wait(3000);

      setLoadedContent(prevTodos =>
        prevTodos.filter(todo => todo.id !== dataId),
      );
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    }
  };

  const handleDeleteFinished = async () => {
    const finishedTodos = loadContent.filter(todo => todo.completed);

    await Promise.all(finishedTodos.map(todo => handleDeleteTodo(todo.id)));
  };
  //#endregion

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleAddTodo}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={todoTitle}
              onChange={handleTodoTitle}
              disabled={titleInputState}
              ref={focusItem}
            />
          </form>
        </header>

        {loadContent.map(data => (
          <section
            key={data.id}
            className={classNames('todoapp__main', {})}
            data-cy="TodoList"
          >
            <div
              data-cy="Todo"
              className={classNames('todo', {
                completed: data.completed === true,
              })}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={data.completed}
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {data.title}
              </span>

              {/* Remove button appears only on hover */}
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
                onClick={() => handleDeleteTodo(data.id)}
              >
                ×
              </button>

              <div
                data-cy="TodoLoader"
                className={classNames('modal overlay', {
                  'is-active':
                    tempTodo !== null &&
                    tempTodo.some(item => item.id === data.id),
                })}
              >
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          </section>
        ))}

        {loadContent.length !== 0 && (
          <TodoFooter
            todoList={loadContent}
            getFilteredList={handleFilter}
            clearCompleted={handleDeleteFinished}
          />
        )}
      </div>

      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
};
