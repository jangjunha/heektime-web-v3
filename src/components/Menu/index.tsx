import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

import styles from './index.module.scss';

interface MenuProps {
  items: [React.Key, React.ReactNode?][];
  onSelectItem?(key: React.Key): void;
}

const Menu = ({ items, onSelectItem }: MenuProps): React.ReactElement => {
  const [focusedItem, setFocusedItem] = useState<React.Key>();
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  const validItems = items.filter(([, node]) => !!node);
  useEffect(() => {
    refs.current = refs.current.slice(0, validItems.length);
  }, [validItems]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLUListElement>
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (focusedItem !== undefined) {
        onSelectItem?.(focusedItem);
      }
    }
    if (event.key === 'ArrowUp') {
      const currentIndex = validItems.findIndex(([key]) => key === focusedItem);
      if (currentIndex >= 0) {
        const nextIndex =
          (currentIndex + validItems.length - 1) % validItems.length;
        refs.current[nextIndex]?.focus();
      }
    }
    if (event.key === 'ArrowDown') {
      const currentIndex = validItems.findIndex(([key]) => key === focusedItem);
      if (currentIndex >= 0) {
        const nextIndex = (currentIndex + 1) % validItems.length;
        refs.current[nextIndex]?.focus();
      }
    }
  };
  const handleClickItem = (key: React.Key) => (): void => {
    onSelectItem?.(key);
  };

  return (
    <ul className={styles.container} onKeyDown={handleKeyDown}>
      {validItems.map(([key, node], index) => (
        <li
          key={key}
          ref={(e): void => {
            refs.current[index] = e;
          }}
          className={classNames({ [styles.focused]: key === focusedItem })}
          tabIndex={index + 1}
          onClick={handleClickItem(key)}
          onMouseOver={(event: React.MouseEvent<HTMLLIElement>): void => {
            event.currentTarget.focus();
          }}
          onFocus={(): void => setFocusedItem(key)}
        >
          {node}
        </li>
      ))}
    </ul>
  );
};

export default Menu;
