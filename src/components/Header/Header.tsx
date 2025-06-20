import React, { useEffect, useRef } from 'react';
import { UserWarning } from '../../UserWarning';
import { Todo } from '../../types/Todo';
import * as todoService from '../../api/todos';

type HeaderProps = {
  titleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  todoTitle: string;
  titleState: boolean;
  todoList: Todo[];
  add: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const Header: React.FC<HeaderProps> = ({
  titleChange,
  todoTitle,
  titleState,
  todoList,
  add,
}) => {
  //#region handle focus
  const focusItem = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusItem.current) {
      focusItem.current.focus();
    }
  }, [todoList, todoTitle, titleState]);

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }
  //#endregion

  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      <button
        type="button"
        className="todoapp__toggle-all active"
        data-cy="ToggleAllButton"
      />

      {/* Add a todo on form submit */}
      <form onSubmit={add}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={todoTitle}
          onChange={titleChange}
          disabled={titleState}
          ref={focusItem}
        />
      </form>
    </header>
  );
};
