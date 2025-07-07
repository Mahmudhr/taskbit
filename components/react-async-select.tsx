import AsyncSelect from 'react-select/async';
import { ComponentProps } from 'react';
import clsx from 'clsx';

export type ReactAsyncSelectOption = {
  label: string;
  value: string;
  [key: string]: any;
};

export type ReactAsyncSelectProps<T = ReactAsyncSelectOption> = {
  label?: string;
  name?: string;
  loadDefaultOptions?: () => Promise<T[]>;
  loadOptions?: (inputValue: string) => Promise<T[]>;
  onChange?: (option: T | null) => void;
  isClearable?: boolean;
  placeholder?: string;
  isLoading?: boolean;
};

export default function ReactAsyncSelect<T = ReactAsyncSelectOption>({
  label = '',
  name = '',
  loadDefaultOptions,
  loadOptions,
  onChange = () => {},
  isClearable = false,
  placeholder = '',
  isLoading,
}: ReactAsyncSelectProps<T>) {
  const combineOptions = async (inputValue: string): Promise<T[]> => {
    if (loadOptions) {
      const options: T[] = [];
      if (loadDefaultOptions) {
        const defaultOptions = await loadDefaultOptions();
        options.push(...defaultOptions);
      }
      if (inputValue) {
        const fetchedOptions = await loadOptions(inputValue);
        options.push(...fetchedOptions);
      }
      return options;
    } else if (loadDefaultOptions) {
      return await loadDefaultOptions();
    } else {
      return [];
    }
  };

  return (
    <div className='w-full'>
      <div className='flex flex-col gap-1'>
        <label
          htmlFor={name}
          className='block text-sm font-semibold text-gray-700 whitespace-nowrap'
        >
          {label}
        </label>
        <AsyncSelect
          name={name}
          id={name}
          isClearable={isClearable}
          onChange={onChange}
          loadOptions={combineOptions}
          noOptionsMessage={() => 'No results were found'}
          placeholder={<div>{placeholder}</div>}
          isLoading={isLoading}
          className={clsx('my-custom-select')}
          cacheOptions
          styles={{
            control: (provided, state) => ({
              ...provided,
              borderRadius: '0.375rem',
              border: state.isFocused
                ? '1px solid #9CA3AF'
                : '1px solid #D1D5DB',
              backgroundColor: 'transparent',
              fontSize: '0.875rem',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05);',
              '&:hover': {
                borderColor: state.isFocused ? '#9CA3AF' : '#D1D5DB', // Prevent hover effect when focused
              },
            }),
            input: (provided) => ({
              ...provided,
              minWidth: '100%',
              width: '100%',
            }),
            placeholder: (provided) => ({
              ...provided,
              color: '#9CA3AF',
            }),
            singleValue: (provided) => ({
              ...provided,
              color: '#1F2937',
            }),
            option: (provided, state) => ({
              ...provided,
              fontSize: '0.85rem',
              backgroundColor: state.isSelected ? '#6B7280' : 'transparent',
              color: state.isSelected ? '#FFFFFF' : '#1F2937',
              '&:hover': {
                backgroundColor: '#6B7280',
                color: '#FFFFFF',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
