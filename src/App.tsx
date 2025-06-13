/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { UserWarning } from './UserWarning';
import { Todo } from './types/Todo';
import * as todoService from './api/todos';
import * as servises from './servises/buttons';
import { ButtonProp } from './types/Button';
import { ErrorMessage } from './components/ErrorMessage/ErrorMessage';
import { wait } from './servises/delay';

export const App: React.FC = () => {
  const [todoTitle, setTodoTitle] = useState('');
  const [appliedTitle, setAppliedTitle] = useState('');
  const [loadContent, setLoadedContent] = useState<Todo[]>([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [filteredBy, setFilteredBy] = useState<string>('All');
  const [titleInputState, setTitleInputState] = useState(false);

  const [tempTodo, setTempTodo] = useState<Todo[] | null>(null);
  // const [titleFocus, setTitleFocus] = useState()

  // const [isChecked, setIsChecked] = useState<boolean>(false);

  useEffect(() => {
    todoService
      .getTodos()
      .then(response => {
        // console.log(response);
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

  const filteredButtons: ButtonProp[] = servises.getButtons();

  const filter = (listOfTodos: Todo[], query: string) => {
    let sortBy = query;

    if (query === filteredBy) {
      sortBy = filteredBy;
    }

    switch (sortBy) {
      case 'Active':
        return listOfTodos.filter(item => item.completed === false);
      case 'Completed':
        return listOfTodos.filter(item => item.completed === true);
      default:
        return listOfTodos;
    }
  };

  const handleFilterButtons = async (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();

    const text: string | null = event.currentTarget.textContent;

    if (!text) {
      return;
    } else {
      setFilteredBy(text);
    }

    const existedTodos = await todoService.getTodos();
    const filteredTodos = filter(existedTodos, text);

    setLoadedContent(filteredTodos);
  };

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
      setTempTodo(temp);
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

  const handleDeleteTodo = async (dataId: Todo['id']) => {
    try {
      const deletedData: Todo | undefined = loadContent.find(
        todo => todo.id === dataId,
      );

      if (!deletedData) {
        setErrorMessage('Todo not found');

        return;
      }

      await todoService.deleteTodos(dataId);
      setTempTodo(deletedData);
      await wait(3000);
      setLoadedContent(prevTodos =>
        prevTodos.filter(todo => todo.id !== dataId),
      );
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setTempTodo(null);
    }
  };

  const handleDeleteFinished = () => {
    // const finishedTodo

    const filteredTodos = loadContent.map(todoItem => {
      if (todoItem.completed === true) {
        handleDeleteTodo(todoItem.id);
      }
    });

    setLoadedContent(filteredTodos);
  };

  // const handleChecked = (dataId: Todo['id']) => {
  //   const newTodoList = loadContent.map(todoItem => {
  //     return todoItem.id === dataId
  //       ? { ...todoItem, completed: !todoItem.completed }
  //       : todoItem;
  //   });

  //   setLoadedContent(newTodoList);
  // };

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
                  // onChange={() => handleChecked(data.id)}
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
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {`${loadContent.filter(item => !item.completed).length} items left`}
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              {filteredButtons.map(button => (
                <a
                  href={button.href}
                  className={classNames(`${button.className}`, {
                    selected: filteredBy === button.name,
                  })}
                  data-cy={button.dataCy}
                  key={button.key}
                  onClick={handleFilterButtons}
                >
                  {button.name}
                </a>
              ))}
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={handleDeleteFinished}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
};
