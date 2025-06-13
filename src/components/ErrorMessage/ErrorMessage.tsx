import React from 'react';
import classNames from 'classnames';

type ErrorMessageProps = {
  errorMessage: string;
  // haveError: boolean;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  errorMessage,
  // haveError,
}) => {
  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification is-danger is-light has-text-weight-normal',
        {
          hidden: !errorMessage,
        },
      )}
    >
      <button data-cy="HideErrorButton" type="button" className="delete" />
      {errorMessage}
    </div>
  );
};
