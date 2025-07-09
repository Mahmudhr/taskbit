import clsx from 'clsx';
import Select from 'react-select';

export type SearchAndSelectOption = {
  label: string;
  value: string;
  [key: string]: unknown;
};

export type SearchAndSelectProps<T = SearchAndSelectOption> = {
  value?: T | null;
  label?: string;
  name?: string;
  options?: T[];
  defaultOption?: T;
  onChange?: (option: T | null) => void;
  onInputChange?: (inputValue: string) => void;
  isClearable?: boolean;
  placeholder?: string;
};

export default function SearchAndSelect<T = SearchAndSelectOption>({
  value,
  label = '',
  name = '',
  options = [],
  defaultOption,
  onChange = () => {},
  onInputChange = () => {},
  isClearable = false,
  placeholder = '',
}: SearchAndSelectProps<T>) {
  const modifiedOptions = defaultOption ? [defaultOption, ...options] : options;

  return (
    <div className='flex flex-col gap-1'>
      <label
        htmlFor={name}
        className='block text-sm font-semibold text-gray-700 whitespace-nowrap'
      >
        {label}
      </label>
      <Select
        value={value}
        name={name}
        id={name}
        isClearable={isClearable}
        onChange={onChange}
        onInputChange={onInputChange}
        options={modifiedOptions}
        placeholder={placeholder}
        noOptionsMessage={() => 'No results were found'}
        classNamePrefix='react-select'
        className={clsx('my-custom-select')}
        styles={{
          control: (provided, state) => ({
            ...provided,
            height: '2.25rem',
            borderRadius: '0.375rem',
            border: state.isFocused ? '1px solid #9CA3AF' : '1px solid #D1D5DB',
            backgroundColor: 'transparent',
            fontSize: '0.875rem',
            boxShadow: ' 0 1px 2px 0 rgb(0 0 0 / 0.05);',
            '&:hover': {
              borderColor: state.isFocused ? '#9CA3AF' : '#D1D5DB', // Prevent hover effect when focused
            },
          }),
          input: (provided) => ({
            ...provided,
            padding: '',
            fontSize: '16px',
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
  );
}
