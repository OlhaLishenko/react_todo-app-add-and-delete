/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import React from 'react';
import { Todo } from '../../types/Todo';
import { Loader } from '../Loader';

type TodoItemProps = {
  tempTodo: Todo | null;
  deleteTodo: (todoId: Todo['id']) => void;
  handleActiveTodo: (todoId: Todo['id']) => void;
  activeTodo: Todo[];
  todo: Todo;
};

export const TodoItem: React.FC<TodoItemProps> = ({
  tempTodo,
  deleteTodo,
  handleActiveTodo,
  activeTodo,
  todo,
}) => {
  const { id, title, completed } = todo;

  const onDelete = () => {
    handleActiveTodo(id);
    deleteTodo(id);
  };

  return (
    <>
      <div
        key={todo.id}
        data-cy="Todo"
        className={classNames('todo', {
          completed: completed,
        })}
      >
        <label className="todo__status-label">
          <input
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
            checked={completed}
          />
        </label>

        <span data-cy="TodoTitle" className="todo__title">
          {title}
        </span>

        {/* Remove button appears only on hover */}
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={onDelete}
        >
          ×
        </button>

        <Loader activeTodo={activeTodo} todoId={id} />
      </div>

      {tempTodo && (
        <div
          key={tempTodo.id}
          data-cy="Todo"
          className={classNames('todo', {
            completed: tempTodo.completed,
          })}
        >
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={tempTodo.completed}
            />
          </label>

          <span data-cy="TodoTitle" className="todo__title">
            {tempTodo.title}
          </span>

          {/* Remove button appears only on hover */}
          <button type="button" className="todo__remove" data-cy="TodoDelete">
            ×
          </button>

          <Loader tempTodo={tempTodo} />
        </div>
      )}
    </>
  );
};
