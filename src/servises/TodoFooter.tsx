import * as buttonsServises from './buttons';
import { ButtonProp } from '../types/Button';
import { Todo } from '../types/Todo';

export const filteredButtons: ButtonProp[] = buttonsServises.getButtons();

export const filter = (listOfTodos: Todo[], query: string) => {
  // let sortBy = query;

  // if (query === filteredBy) {
  //   sortBy = filteredBy;
  // }

  switch (query) {
    case 'Active':
      return listOfTodos.filter(item => item.completed === false);
    case 'Completed':
      return listOfTodos.filter(item => item.completed === true);
    default:
      return listOfTodos;
  }
};
