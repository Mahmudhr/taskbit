import AsyncSelect from 'react-select/async';
import clsx from 'clsx';

export type ReactAsyncSelectOption = {
  label: string;
  value: string;
  [key: string]: unknown;
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
  defaultValue?: T | null;
  value?: T | null;
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
  defaultValue,
  value,
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
          className='block text-sm font-semibold text-left text-muted-foreground dark:text-muted-foreground whitespace-nowrap'
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
          value={value}
          defaultValue={!value ? defaultValue : undefined}
          styles={{
            control: (provided, state) => ({
              ...provided,
              borderRadius: '0.375rem',
              border: state.isFocused
                ? '1px solid #9CA3AF'
                : '1px solid #D1D5DB',
              backgroundColor: state.isFocused
                ? document.documentElement.classList.contains('dark')
                  ? '#1a1a1a'
                  : 'transparent'
                : document.documentElement.classList.contains('dark')
                ? '#18181b'
                : 'transparent',
              fontSize: '0.875rem',
              color: document.documentElement.classList.contains('dark')
                ? '#e5e7eb'
                : '#1F2937',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05);',
              '&:hover': {
                borderColor: state.isFocused ? '#9CA3AF' : '#D1D5DB',
              },
            }),
            input: (provided) => ({
              ...provided,
              minWidth: '100%',
              color: document.documentElement.classList.contains('dark')
                ? '#e5e7eb'
                : '#1F2937',
            }),
            placeholder: (provided) => ({
              ...provided,
              color: document.documentElement.classList.contains('dark')
                ? '#a1a1aa'
                : '#9CA3AF',
            }),
            singleValue: (provided) => ({
              ...provided,
              color: document.documentElement.classList.contains('dark')
                ? '#e5e7eb'
                : '#1F2937',
            }),
            option: (provided, state) => ({
              ...provided,
              fontSize: '0.85rem',
              backgroundColor: state.isSelected
                ? document.documentElement.classList.contains('dark')
                  ? '#27272a'
                  : '#6B7280'
                : document.documentElement.classList.contains('dark')
                ? '#18181b'
                : 'transparent',
              color: state.isSelected
                ? '#FFFFFF'
                : document.documentElement.classList.contains('dark')
                ? '#e5e7eb'
                : '#1F2937',
              textAlign: 'start',
              '&:hover': {
                backgroundColor: document.documentElement.classList.contains(
                  'dark'
                )
                  ? '#27272a'
                  : '#6B7280',
                color: '#FFFFFF',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
