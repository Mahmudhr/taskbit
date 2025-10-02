'use client';

import { Card } from '@/components/ui/card';
import { Input } from './input';
import { useEffect, useState } from 'react';

type Option = {
  value: number;
  label: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
};

type SearchAndSelectProps = {
  placeholder?: string;
  search: (query: string) => Promise<Option[]>;
  onSelect: (option: Option) => void;
};

export const UserSearchAndSelect = ({
  placeholder = 'Search...',
  search,
  onSelect,
}: SearchAndSelectProps) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      const results = await search(inputValue);

      setOptions(results);
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [inputValue, search, isOpen]);

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow option click
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleOptionSelect = (option: Option) => {
    onSelect(option);
    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div className='w-full relative'>
      <Input
        type='text'
        placeholder={placeholder}
        value={inputValue}
        name={`user-search-${Math.random().toString(36).substr(2, 9)}`}
        autoComplete='new-password'
        autoCorrect='off'
        autoCapitalize='off'
        spellCheck='false'
        data-lpignore='true'
        data-form-type='other'
        role='combobox'
        aria-autocomplete='list'
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      {isOpen && (
        <Card className='mt-2 p-2 absolute z-10 w-full shadow-lg min-[300px]:max-h-60 overflow-y-auto'>
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                className='p-2 hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-md'
                onClick={() => handleOptionSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className='text-gray-500'>No options found.</div>
          )}
        </Card>
      )}
    </div>
  );
};
