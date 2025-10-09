import Link from 'next/link';

export default function FacebookClient() {
  return (
    <div className='w-full h-screen flex flex-col'>
      <div className='p-3 bg-gray-100 text-gray-700 dark:text-gray-700 flex justify-center'>
        If you are facing issues, please
        <Link
          href='https://docs.google.com/spreadsheets/d/1bBYDrgw6MFCM_TP3vw38FRzzcFDGFX6KgNc6kn9aU0w/edit?usp=sharing'
          target='_blank'
          className='text-blue-500 underline mx-1'
        >
          click here
        </Link>
        to redirect
      </div>
      <div className='flex-1'>
        <iframe
          src='https://docs.google.com/spreadsheets/d/1bBYDrgw6MFCM_TP3vw38FRzzcFDGFX6KgNc6kn9aU0w/edit?usp=sharing'
          width='100%'
          height='100%'
          frameBorder='0'
          allowFullScreen
          title='Facebook Client Spreadsheet'
        />
      </div>
    </div>
  );
}
